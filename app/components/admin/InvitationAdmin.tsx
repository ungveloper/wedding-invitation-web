'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { VisitDetail } from '@/app/types/analytics';
import type {
  DashboardData,
  GuestbookEntry,
  RootAccessMode,
} from '@/app/types/invitation';

type InvitationAdminProps = {
  dashboard: DashboardData;
  ownerEmail: string;
};

const ROOT_MODE_OPTIONS: {
  value: RootAccessMode;
  title: string;
  description: string;
}[] = [
  {
    value: 'redirect-random',
    title: '랜덤 템플릿으로 이동',
    description:
      '/주소 접속 시 허용된 템플릿 중 하나의 /번호 주소로 이동합니다.',
  },
  {
    value: 'render-random',
    title: '현재 주소에서 랜덤 템플릿 표시',
    description:
      '주소창은 /주소로 유지하고 허용된 템플릿 중 하나를 바로 보여줍니다.',
  },
  {
    value: 'blocked',
    title: '접근 불가 안내',
    description: '/주소에서는 청첩장을 보여주지 않고 안내 문구만 표시합니다.',
  },
];

export default function InvitationAdmin({
  dashboard,
  ownerEmail,
}: InvitationAdminProps): React.ReactElement {
  const router = useRouter();
  const [allowedTemplateIds, setAllowedTemplateIds] = useState<number[]>(
    dashboard.invitation.settings.allowedTemplateIds,
  );
  const [rootAccessMode, setRootAccessMode] = useState<RootAccessMode>(
    dashboard.invitation.settings.rootAccessMode,
  );
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>(
    dashboard.guestbook,
  );
  const [isSaving, setIsSaving] = useState(false);

  const attendanceSummary = useMemo(() => {
    return dashboard.rsvps.reduce(
      (summary, entry) => {
        summary.responses += 1;

        if (entry.attendance === 'attending') {
          summary.attendingPeople += entry.guestCount;
        }

        if (entry.attendance === 'not-attending') {
          summary.notAttending += 1;
        }

        return summary;
      },
      { responses: 0, attendingPeople: 0, notAttending: 0 },
    );
  }, [dashboard.rsvps]);

  function toggleTemplate(templateId: number) {
    setAllowedTemplateIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId].sort((a, b) => a - b),
    );
  }

  async function saveSettings() {
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/invitations/${dashboard.invitation.slug}/settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allowedTemplateIds, rootAccessMode }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? '설정을 저장하지 못했습니다.');
      }

      toast.success('접속 설정을 저장했습니다.');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '설정을 저장하지 못했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function changeGuestbookVisibility(
    entryId: string,
    isHidden: boolean,
  ) {
    try {
      const response = await fetch(
        `/api/invitations/${dashboard.invitation.slug}/guestbook/${entryId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isHidden }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? '방명록 상태를 변경하지 못했습니다.');
      }

      setGuestbook((entries) =>
        entries.map((entry) =>
          entry.id === entryId ? { ...entry, isHidden } : entry,
        ),
      );
      toast.success(isHidden ? '방명록을 숨겼습니다.' : '방명록을 공개했습니다.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '방명록 상태를 변경하지 못했습니다.',
      );
    }
  }

  async function removeGuestbookEntry(entryId: string) {
    if (!window.confirm('이 방명록을 삭제할까요?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/invitations/${dashboard.invitation.slug}/guestbook/${entryId}`,
        { method: 'DELETE' },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? '방명록을 삭제하지 못했습니다.');
      }

      setGuestbook((entries) => entries.filter((entry) => entry.id !== entryId));
      toast.success('방명록을 삭제했습니다.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '방명록을 삭제하지 못했습니다.',
      );
    }
  }

  async function signOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-rose-600">모청모청 관리</p>
            <h1 className="mt-1 text-2xl font-bold">
              /{dashboard.invitation.slug} 설정
            </h1>
            <p className="mt-2 text-sm text-slate-500">소유자: {ownerEmail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allowedTemplateIds.map((templateId) => (
              <Link
                key={templateId}
                href={`/${dashboard.invitation.slug}/${templateId}`}
                target="_blank"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                {templateId}번 보기
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              로그아웃
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={`/${dashboard.invitation.slug} 오늘 방문자`}
            value={dashboard.stats.todayVisitors}
          />
          <StatCard
            label={`/${dashboard.invitation.slug} 누적 방문자`}
            value={dashboard.stats.totalVisitors}
          />
          <StatCard label="RSVP 응답" value={attendanceSummary.responses} />
          <StatCard
            label="참석 예정 인원"
            value={attendanceSummary.attendingPeople}
          />
        </section>

        {dashboard.siteStats ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-rose-600">서비스 전체 통계</p>
              <h2 className="mt-1 text-lg font-bold">mocheong.com 홈페이지 방문자</h2>
              <p className="mt-1 text-sm text-slate-500">
                루트 주소에 직접 접속한 고유 방문자만 집계합니다.
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <StatCard
                label="홈페이지 오늘 방문자"
                value={dashboard.siteStats.todayVisitors}
              />
              <StatCard
                label="홈페이지 누적 방문자"
                value={dashboard.siteStats.totalVisitors}
              />
            </div>
          </section>
        ) : null}

        <VisitTable
          title={`/${dashboard.invitation.slug} 최근 유입 정보`}
          description="같은 브라우저의 새로고침은 다시 집계하지 않고, 하루에 한 번만 기록합니다."
          visits={dashboard.recentVisits}
        />

        {dashboard.siteStats ? (
          <VisitTable
            title="mocheong.com 홈페이지 최근 유입 정보"
            description="루트 주소에 직접 들어온 방문자의 최초 일일 유입 정보를 표시합니다."
            visits={dashboard.siteRecentVisits}
          />
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">템플릿 접속 설정</h2>
            <p className="text-sm text-slate-500">
              비활성화한 번호나 DB에 없는 번호로 접속하면 /{dashboard.invitation.slug}로
              이동합니다.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.templates.map((template) => {
              const checked = allowedTemplateIds.includes(template.id);

              return (
                <label
                  key={template.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    checked
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200 bg-white'
                  } ${template.published ? '' : 'cursor-not-allowed opacity-50'}`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-rose-600"
                    checked={checked}
                    disabled={!template.published}
                    onChange={() => toggleTemplate(template.id)}
                  />
                  <span>
                    <strong className="block">
                      {template.id}번 · {template.name}
                    </strong>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      {template.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <fieldset className="mt-7">
            <legend className="font-bold">/{dashboard.invitation.slug} 접속 방식</legend>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {ROOT_MODE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-4 ${
                    rootAccessMode === option.value
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <input
                      type="radio"
                      name="rootAccessMode"
                      value={option.value}
                      checked={rootAccessMode === option.value}
                      onChange={() => setRootAccessMode(option.value)}
                      className="accent-rose-600"
                    />
                    {option.title}
                  </span>
                  <span className="mt-2 block text-sm leading-5 text-slate-500">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            disabled={isSaving}
            onClick={saveSettings}
            className="mt-6 cursor-pointer rounded-lg bg-rose-600 px-5 py-3 font-medium text-white hover:bg-rose-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? '저장 중...' : '접속 설정 저장'}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">RSVP 현황표</h2>
          <p className="mt-1 text-sm text-slate-500">
            불참 응답 {attendanceSummary.notAttending}건을 포함해 최신 순으로 표시합니다.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">이름</th>
                  <th className="px-3 py-3 font-medium">구분</th>
                  <th className="px-3 py-3 font-medium">참석</th>
                  <th className="px-3 py-3 font-medium">인원</th>
                  <th className="px-3 py-3 font-medium">식사</th>
                  <th className="px-3 py-3 font-medium">연락처</th>
                  <th className="px-3 py-3 font-medium">메시지</th>
                  <th className="px-3 py-3 font-medium">등록일</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.rsvps.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-500" colSpan={8}>
                      아직 RSVP 응답이 없습니다.
                    </td>
                  </tr>
                ) : (
                  dashboard.rsvps.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 align-top">
                      <td className="whitespace-nowrap px-3 py-3 font-medium">{entry.name}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {entry.side === 'groom' ? '신랑측' : '신부측'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {attendanceLabel(entry.attendance)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{entry.guestCount}</td>
                      <td className="whitespace-nowrap px-3 py-3">{mealLabel(entry.meal)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{entry.phone || '-'}</td>
                      <td className="min-w-56 whitespace-pre-wrap px-3 py-3">{entry.message || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">방명록 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            숨김 처리한 글은 공개 청첩장에서 보이지 않습니다.
          </p>
          <div className="mt-5 space-y-3">
            {guestbook.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                아직 방명록이 없습니다.
              </p>
            ) : (
              guestbook.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-xl border p-4 ${
                    entry.isHidden
                      ? 'border-slate-200 bg-slate-100 opacity-70'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{entry.name}</strong>
                        {entry.isHidden ? (
                          <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs">
                            숨김
                          </span>
                        ) : null}
                        <time className="text-xs text-slate-400">
                          {formatDate(entry.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {entry.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          changeGuestbookVisibility(entry.id, !entry.isHidden)
                        }
                        className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        {entry.isHidden ? '공개' : '숨김'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGuestbookEntry(entry.id)}
                        className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function VisitTable({
  title,
  description,
  visits,
}: {
  title: string;
  description: string;
  visits: VisitDetail[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="whitespace-nowrap px-3 py-3 font-medium">방문 시각</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">경로</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">유입 경로</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">IP</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">지역</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">환경</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">캠페인</th>
              <th className="whitespace-nowrap px-3 py-3 font-medium">방문자 키</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={8}>
                  아직 수집된 방문 정보가 없습니다.
                </td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr key={visit.id} className="border-b border-slate-100 align-top">
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                    {formatDate(visit.visitedAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {visit.pagePath || '-'}
                    {visit.templateId ? ` · ${visit.templateId}번` : ''}
                  </td>
                  <td className="max-w-64 px-3 py-3">
                    <span className="block font-medium">
                      {visit.referrerHost || '직접 유입'}
                    </span>
                    {visit.referrer ? (
                      <span className="mt-1 block truncate text-slate-400" title={visit.referrer}>
                        {visit.referrer}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono">
                    {visit.ipAddress || visit.ipMasked || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {[visit.country, visit.region, visit.city]
                      .filter(Boolean)
                      .join(' / ') || '-'}
                  </td>
                  <td className="max-w-72 px-3 py-3">
                    <span className="block">
                      {[visit.platform, visit.language].filter(Boolean).join(' / ') || '-'}
                    </span>
                    {visit.userAgent ? (
                      <span className="mt-1 block truncate text-slate-400" title={visit.userAgent}>
                        {visit.userAgent}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {[visit.utmSource, visit.utmMedium, visit.utmCampaign]
                      .filter(Boolean)
                      .join(' / ') || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-slate-400">
                    {visit.visitorHash || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-bold tabular-nums">
        {value.toLocaleString('ko-KR')}
      </strong>
    </article>
  );
}

function attendanceLabel(value: string): string {
  if (value === 'not-attending') return '불참';
  if (value === 'undecided') return '미정';
  return '참석';
}

function mealLabel(value: string): string {
  if (value === 'yes') return '예정';
  if (value === 'no') return '안 함';
  return '미정';
}

function formatDate(value: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
