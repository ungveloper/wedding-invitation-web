'use client';

import { Heart } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { GowunDodum } from '../../lib/fonts';
import FadeInUp from '../common/FadeInUp';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

type WeddingRsvpProps = {
  invitationId: string;
  title: string;
  descriptionLines: string[];
  submitLabel: string;
  groomName: string;
  brideName: string;
  month: number;
  day: number;
  dayOfWeek: string;
  time: string;
  venueName: string;
  hallName: string;
};

type SubmitState = 'idle' | 'submitting' | 'success';

const INPUT_CLASS =
  'w-full rounded-md border border-[#d8d5d0] bg-white px-3.5 py-3 text-base outline-none transition focus:border-[#999999] focus:ring-2 focus:ring-[#999999]/15';
const LABEL_CLASS = 'block text-sm font-medium text-[#555555]';

export default function WeddingRsvp({
  invitationId,
  title,
  descriptionLines,
  submitLabel,
  groomName,
  brideName,
  month,
  day,
  dayOfWeek,
  time,
  venueName,
  hallName,
}: WeddingRsvpProps): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const formId = 'wedding-rsvp-form';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState === 'submitting') {
      return;
    }

    setSubmitState('submitting');
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/invitations/${invitationId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          side: formData.get('side'),
          attendance: formData.get('attendance'),
          guestCount: formData.get('guestCount'),
          meal: formData.get('meal'),
          phone: formData.get('phone'),
          message: formData.get('message'),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? '참석 여부를 전달하지 못했습니다.');
      }

      form.reset();
      setSubmitState('success');
      toast.success('참석 여부가 전달되었습니다.');
    } catch (error) {
      setSubmitState('idle');
      toast.error(
        error instanceof Error
          ? error.message
          : '참석 여부를 전달하지 못했습니다.',
      );
    }
  }

  return (
    <section
      className={`flex w-full flex-col items-center px-5 pt-10 pb-14 text-[#333333] ${GowunDodum.className}`}
      aria-labelledby="wedding-rsvp-title"
    >
      <WeddingSectionHeader
        id="wedding-rsvp-title"
        title={title}
        className="space-y-5"
      />

      <FadeInUp>
        <div className="mt-7 text-center text-[15px] leading-[1.9] tracking-[-0.035em] text-[#555555]">
          {descriptionLines.map((line) => (
            <p key={line} className="m-0">
              {line}
            </p>
          ))}
        </div>
      </FadeInUp>

      <FadeInUp>
        <div
          className="mt-7 w-full border-t border-dashed border-[#d8d5d0]"
          aria-hidden="true"
        />
      </FadeInUp>

      <FadeInUp>
        <div className="mt-7 flex w-full items-center justify-center gap-8 text-center">
          <div className="min-w-19">
            <p className="m-0 text-sm leading-normal text-[#8a8782]">신랑</p>
            <p className="mt-1.5 mb-0 text-xl font-medium tracking-[-0.04em]">
              {groomName}
            </p>
          </div>

          <Heart
            className="size-4.5 fill-[#d69090] stroke-[#d69090]"
            aria-hidden="true"
          />

          <div className="min-w-19">
            <p className="m-0 text-sm leading-normal text-[#8a8782]">신부</p>
            <p className="mt-1.5 mb-0 text-xl font-medium tracking-[-0.04em]">
              {brideName}
            </p>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="mt-7 flex w-full flex-col items-center text-center">
          <div className="flex items-center justify-center text-[2rem] leading-none font-medium tracking-[-0.04em]">
            <span>{month}</span>
            <span
              className="mx-4 h-8 w-px rotate-20 bg-[#bbb7b1]"
              aria-hidden="true"
            />
            <span>{day}</span>
          </div>

          <p className="mt-4 mb-0 text-[15px] leading-normal tracking-[-0.035em] text-[#555555]">
            <span>{dayOfWeek}</span>
            <span className="mx-1.5 text-[#bbb7b1]" aria-hidden="true">
              ·
            </span>
            <span>{time}</span>
          </p>

          <div className="mt-5 text-[15px] leading-[1.75] tracking-[-0.035em] text-[#555555]">
            <p className="m-0">{venueName}</p>
            {hallName ? <p className="m-0">{hallName}</p> : null}
          </div>
        </div>
      </FadeInUp>

      <FadeInUp>
        <button
          type="button"
          className="mt-8 flex min-h-13.5 w-full cursor-pointer items-center justify-center rounded-md border border-[#d8d5d0] bg-[#f1f0ee] px-5 text-lg font-medium tracking-[-0.04em] text-[#333333] transition-colors duration-200 hover:bg-[#e9e7e4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#999999]/35"
          aria-expanded={isFormOpen}
          aria-controls={formId}
          onClick={() => {
            setIsFormOpen((previous) => !previous);
          }}
        >
          {submitState === 'success' ? '전달 완료' : submitLabel}
        </button>
      </FadeInUp>

      <div
        id={formId}
        className={`grid w-full transition-[grid-template-rows,margin-top] duration-500 ease-out ${
          isFormOpen ? 'mt-5 grid-rows-[1fr]' : 'mt-0 grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <form
            className="space-y-4 rounded-md border border-[#dedbd6] bg-[#f8f7f5] p-4"
            onSubmit={handleSubmit}
          >
            <label className={LABEL_CLASS}>
              이름
              <input
                className={`${INPUT_CLASS} mt-1.5`}
                name="name"
                autoComplete="name"
                maxLength={40}
                required
              />
            </label>

            <fieldset>
              <legend className={LABEL_CLASS}>어느 분의 하객인가요?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <RadioCard name="side" value="groom" label="신랑측" required />
                <RadioCard name="side" value="bride" label="신부측" />
              </div>
            </fieldset>

            <fieldset>
              <legend className={LABEL_CLASS}>참석 여부</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <RadioCard
                  name="attendance"
                  value="attending"
                  label="참석"
                  required
                />
                <RadioCard
                  name="attendance"
                  value="not-attending"
                  label="불참"
                />
                <RadioCard
                  name="attendance"
                  value="undecided"
                  label="미정"
                />
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <label className={LABEL_CLASS}>
                참석 인원
                <input
                  className={`${INPUT_CLASS} mt-1.5`}
                  name="guestCount"
                  type="number"
                  min={0}
                  max={20}
                  defaultValue={1}
                  required
                />
              </label>

              <label className={LABEL_CLASS}>
                식사 여부
                <select
                  className={`${INPUT_CLASS} mt-1.5`}
                  name="meal"
                  defaultValue="undecided"
                >
                  <option value="yes">예정</option>
                  <option value="no">안 함</option>
                  <option value="undecided">미정</option>
                </select>
              </label>
            </div>

            <label className={LABEL_CLASS}>
              연락처
              <input
                className={`${INPUT_CLASS} mt-1.5`}
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                placeholder="선택 입력"
              />
            </label>

            <label className={LABEL_CLASS}>
              전달할 말씀
              <textarea
                className={`${INPUT_CLASS} mt-1.5 min-h-24 resize-y`}
                name="message"
                maxLength={500}
                placeholder="선택 입력"
              />
            </label>

            <button
              type="submit"
              disabled={submitState === 'submitting'}
              className="w-full cursor-pointer rounded-md bg-[#333333] px-4 py-3.5 text-base font-medium text-white disabled:cursor-wait disabled:opacity-60"
            >
              {submitState === 'submitting' ? '전달 중...' : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

type RadioCardProps = {
  name: string;
  value: string;
  label: string;
  required?: boolean;
};

function RadioCard({
  name,
  value,
  label,
  required = false,
}: RadioCardProps): React.ReactElement {
  return (
    <label className="cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        name={name}
        value={value}
        required={required}
      />
      <span className="flex min-h-11 items-center justify-center rounded-md border border-[#d8d5d0] bg-white text-sm transition peer-checked:border-[#777777] peer-checked:bg-[#eceae7] peer-focus-visible:ring-2 peer-focus-visible:ring-[#999999]/30">
        {label}
      </span>
    </label>
  );
}
