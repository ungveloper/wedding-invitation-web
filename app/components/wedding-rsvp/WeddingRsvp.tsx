'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { GowunDodum } from '../../lib/fonts';
import FadeInUp from '../common/FadeInUp';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

type WeddingRsvpProps = {
  title?: string;
  groomName?: string;
  brideName?: string;
  month?: number;
  day?: number;
  dayOfWeek?: string;
  time?: string;
  venueName?: string;
  hallName?: string;
  formUrl?: string;
};

const DEFAULT_FORM_URL =
  'https://jealous-growth-583.notion.site/ebd//3a27f0af97c280549aaef662fc987fca';

export default function WeddingRsvp({
  title = '참석여부',
  groomName = '웅재',
  brideName = '혜정',
  month = 9,
  day = 20,
  dayOfWeek = '일요일',
  time = '오후 12시',
  venueName = 'W웨딩 국민연금웨딩홀',
  hallName = '3층 에메랄드홀',
  formUrl = DEFAULT_FORM_URL,
}: WeddingRsvpProps): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formId = 'wedding-rsvp-form';

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
          <p className="m-0">참석에 부담 가지지 말아주시고,</p>
          <p className="m-0">편하게 알려주세요.</p>
          <p className="m-0">저희의 정성을 다하는 준비에 도움이 될 것 같아</p>
          <p className="m-0">참석 여부를 알려주시면 감사하겠습니다.</p>
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
            <p className="m-0">{hallName}</p>
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
          참석여부 전달하기
        </button>
      </FadeInUp>

      <div
        id={formId}
        className={`grid w-full transition-[grid-template-rows,margin-top] duration-500 ease-out ${
          isFormOpen ? 'mt-5 grid-rows-[1fr]' : 'mt-0 grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="overflow-hidden rounded-md border border-[#dedbd6] bg-white">
            <iframe
              src={formUrl}
              title="결혼식 참석 여부 작성 폼"
              className="block h-150 w-full border-0 bg-white"
              frameBorder="0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
