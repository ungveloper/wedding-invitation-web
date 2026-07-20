import Link from 'next/link';

type InvitationBlockedProps = {
  invitationId: string;
};

export default function InvitationBlocked({
  invitationId,
}: InvitationBlockedProps): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-center text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <p className="text-sm font-bold tracking-[0.14em] text-rose-500">
          모청모청
        </p>
        <h1 className="mt-4 text-2xl font-bold">허용되지 않은 페이지입니다.</h1>
        <p className="mt-3 leading-7 text-slate-500">
          청첩장 소유자가 현재 이 주소의 공개를 허용하지 않았습니다.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
        >
          모청모청 홈으로
        </Link>
        <p className="mt-5 text-xs text-slate-400">주소: /{invitationId}</p>
      </section>
    </main>
  );
}
