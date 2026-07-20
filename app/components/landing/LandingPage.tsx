'use client';

import {
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getFirebaseClientAuth,
  isFirebaseClientConfigured,
} from '@/app/lib/firebase/client';

type SessionUser = {
  uid: string;
  email: string;
  name: string;
  picture: string;
};

type AvailabilityState =
  | { status: 'idle'; message: string }
  | { status: 'checking'; message: string }
  | { status: 'available'; message: string }
  | { status: 'unavailable'; message: string };

const INPUT_CLASS =
  'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100';

export default function LandingPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [slug, setSlug] = useState('');
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: 'idle',
    message: '영문 소문자, 숫자, 하이픈으로 3~32자 입력하세요.',
  });

  useEffect(() => {
    void fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as { user?: SessionUser | null };
        setUser(result.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setIsSessionLoading(false));
  }, []);

  async function handleGoogleSignIn() {
    if (!isFirebaseClientConfigured()) {
      toast.error('Firebase Web App 환경변수를 먼저 설정해 주세요.');
      return;
    }

    setIsSigningIn(true);

    try {
      const auth = getFirebaseClientAuth();
      await setPersistence(auth, inMemoryPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? '로그인 세션을 만들지 못했습니다.');
      }

      await firebaseSignOut(auth);
      setUser({
        uid: credential.user.uid,
        email: credential.user.email ?? '',
        name: credential.user.displayName ?? '',
        picture: credential.user.photoURL ?? '',
      });
      toast.success('Google 계정으로 로그인했습니다.');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Google 로그인에 실패했습니다.',
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
    router.refresh();
  }

  async function checkSlug(): Promise<boolean> {
    const normalizedSlug = slug.trim().toLowerCase();
    setSlug(normalizedSlug);
    setAvailability({ status: 'checking', message: '주소를 확인하고 있습니다.' });

    try {
      const response = await fetch(
        `/api/invitations/check?slug=${encodeURIComponent(normalizedSlug)}`,
        { cache: 'no-store' },
      );
      const result = (await response.json()) as {
        available?: boolean;
        valid?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? '주소를 확인하지 못했습니다.');
      }

      const available = Boolean(result.available && result.valid);
      setAvailability({
        status: available ? 'available' : 'unavailable',
        message: result.message ?? '',
      });
      return available;
    } catch (error) {
      setAvailability({
        status: 'unavailable',
        message:
          error instanceof Error ? error.message : '주소를 확인하지 못했습니다.',
      });
      return false;
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toast.error('먼저 Google 계정으로 로그인해 주세요.');
      return;
    }

    const isAvailable = await checkSlug();

    if (!isAvailable) {
      return;
    }

    setIsCreating(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          groomName: formData.get('groomName'),
          brideName: formData.get('brideName'),
          eventDateTime: formData.get('eventDateTime'),
          venueName: formData.get('venueName'),
        }),
      });
      const result = (await response.json()) as {
        invitation?: { slug: string };
        error?: string;
      };

      if (!response.ok || !result.invitation) {
        throw new Error(result.error ?? '청첩장을 생성하지 못했습니다.');
      }

      toast.success('청첩장 기본 정보가 생성되었습니다.');
      router.push(`/${result.invitation.slug}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '청첩장을 생성하지 못했습니다.',
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f8_0%,#ffffff_46%,#f8fafc_100%)] text-slate-900">
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-14 sm:px-8 sm:pt-28">
        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-[0.16em] text-rose-500">
            MOCHEONG MOCHEONG
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-black tracking-[-0.04em] sm:text-6xl">
            정보는 한 번,
            <br />
            모청은 여러 번.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            이름과 예식 정보를 먼저 입력하면 내 정보가 적용된 여러 모바일
            청첩장을 한 번에 비교할 수 있습니다. 마음에 드는 번호만 골라 그대로
            공유하세요.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            number="01"
            title="정보 한 번 입력"
            description="신랑·신부 이름, 날짜, 장소를 한 번만 등록합니다."
          />
          <FeatureCard
            number="02"
            title="여러 시안 비교"
            description="허용된 템플릿 번호를 바꿔가며 실제 정보가 적용된 화면을 봅니다."
          />
          <FeatureCard
            number="03"
            title="바로 공유"
            description="선택한 템플릿 주소를 카카오톡이나 링크로 공유합니다."
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/85 px-5 py-14 backdrop-blur sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold text-rose-500">시작하기</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              나만의 주소를 먼저 확인하세요.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              예를 들어 <strong>0920</strong>을 선택하면 관리 화면은
              <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                mocheong.com/0920
              </code>
              , 1번 청첩장은
              <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
                mocheong.com/0920/1
              </code>
              로 만들어집니다.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {isSessionLoading ? (
                <p className="text-sm text-slate-500">로그인 상태를 확인하고 있습니다.</p>
              ) : user ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{user.name || 'Google 사용자'}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3.5 font-medium text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSigningIn ? 'Google 로그인 중...' : 'Google 계정으로 시작하기'}
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8"
          >
            <div>
              <label className="text-sm font-semibold" htmlFor="slug">
                사용할 주소
              </label>
              <div className="mt-1.5 flex rounded-xl border border-slate-300 bg-white focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-400">
                  mocheong.com/
                </span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '')
                        .slice(0, 32),
                    );
                    setAvailability({
                      status: 'idle',
                      message: '주소 확인 버튼을 눌러주세요.',
                    });
                  }}
                  className="min-w-0 flex-1 rounded-r-xl px-3 py-3.5 outline-none"
                  placeholder="0920"
                  minLength={3}
                  maxLength={32}
                  required
                />
                <button
                  type="button"
                  onClick={() => void checkSlug()}
                  disabled={availability.status === 'checking'}
                  className="m-1.5 cursor-pointer rounded-lg bg-slate-100 px-3 text-sm font-medium hover:bg-slate-200 disabled:cursor-wait"
                >
                  확인
                </button>
              </div>
              <p
                className={`mt-2 text-sm ${
                  availability.status === 'available'
                    ? 'text-emerald-600'
                    : availability.status === 'unavailable'
                      ? 'text-red-600'
                      : 'text-slate-500'
                }`}
              >
                {availability.message}
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                신랑 이름
                <input
                  className={INPUT_CLASS}
                  name="groomName"
                  maxLength={30}
                  placeholder="신랑 이름"
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                신부 이름
                <input
                  className={INPUT_CLASS}
                  name="brideName"
                  maxLength={30}
                  placeholder="신부 이름"
                  required
                />
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold">
              예식 일시
              <input
                className={INPUT_CLASS}
                name="eventDateTime"
                type="datetime-local"
                required
              />
            </label>

            <label className="mt-5 block text-sm font-semibold">
              예식장 이름
              <input
                className={INPUT_CLASS}
                name="venueName"
                maxLength={100}
                placeholder="예식장 이름"
                required
              />
            </label>

            <button
              type="submit"
              disabled={!user || isCreating}
              className="mt-7 w-full cursor-pointer rounded-xl bg-rose-600 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isCreating
                ? '생성 중...'
                : user
                  ? '기본 청첩장 생성하기'
                  : 'Google 로그인 후 생성할 수 있습니다'}
            </button>
          </form>
        </div>
      </section>

      <footer className="px-5 py-10 text-center text-sm text-slate-400">
        © 2026 모청모청 · mocheong.com
      </footer>
    </main>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-sm backdrop-blur">
      <span className="text-sm font-bold text-rose-400">{number}</span>
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}
