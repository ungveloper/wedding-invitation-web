'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { GuestbookEntry } from '@/app/types/invitation';
import { GowunDodum } from '../../lib/fonts';
import FadeInUp from '../common/FadeInUp';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

type WeddingGuestbookProps = {
  invitationId: string;
  title: string;
  description: string;
  submitLabel: string;
};

export default function WeddingGuestbook({
  invitationId,
  title,
  description,
  submitLabel,
}: WeddingGuestbookProps): React.ReactElement {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/invitations/${invitationId}/guestbook`,
        { cache: 'no-store' },
      );
      const result = (await response.json()) as {
        entries?: GuestbookEntry[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? '방명록을 불러오지 못했습니다.');
      }

      setEntries(result.entries ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadEntries();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadEntries]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        `/api/invitations/${invitationId}/guestbook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.get('name'),
            message: formData.get('message'),
          }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? '축하 메시지를 남기지 못했습니다.');
      }

      form.reset();
      toast.success('축하 메시지가 등록되었습니다.');
      await loadEntries();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '축하 메시지를 남기지 못했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className={`w-full bg-[#f4f3f1] px-5 py-14 ${GowunDodum.className}`}
      aria-labelledby="wedding-guestbook-title"
    >
      <WeddingSectionHeader
        id="wedding-guestbook-title"
        title={title}
        className="space-y-5"
      />

      <FadeInUp>
        <p className="mt-7 text-center text-[15px] leading-[1.8] tracking-[-0.035em] text-[#666666]">
          {description}
        </p>
      </FadeInUp>

      <FadeInUp>
        <form
          className="mt-7 space-y-3 rounded-md border border-[#dedbd6] bg-white p-4"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full rounded-md border border-[#ddd9d4] px-3.5 py-3 text-base outline-none focus:border-[#999999] focus:ring-2 focus:ring-[#999999]/15"
            name="name"
            maxLength={40}
            placeholder="이름"
            required
          />
          <textarea
            className="min-h-28 w-full resize-y rounded-md border border-[#ddd9d4] px-3.5 py-3 text-base leading-[1.6] outline-none focus:border-[#999999] focus:ring-2 focus:ring-[#999999]/15"
            name="message"
            maxLength={500}
            placeholder="축하 메시지를 남겨주세요."
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-md bg-[#333333] px-4 py-3.5 text-base font-medium text-white disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? '등록 중...' : submitLabel}
          </button>
        </form>
      </FadeInUp>

      <div className="mt-5 space-y-3" aria-live="polite">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-[#888888]">
            방명록을 불러오는 중입니다.
          </p>
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#888888]">
            첫 번째 축하 메시지를 남겨주세요.
          </p>
        ) : (
          entries.map((entry) => (
            <FadeInUp key={entry.id}>
              <article className="rounded-md border border-[#e2dfda] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="font-medium text-[#333333]">
                    {entry.name}
                  </strong>
                  <time className="text-xs text-[#999999]">
                    {formatDate(entry.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-[1.7] text-[#555555]">
                  {entry.message}
                </p>
              </article>
            </FadeInUp>
          ))
        )}
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
