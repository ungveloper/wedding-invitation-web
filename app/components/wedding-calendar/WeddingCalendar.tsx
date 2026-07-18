'use client';

import { useEffect, useMemo, useState } from 'react';
import WeddingRibbon from '../common/WeddingRibbon';
import { GowunDodum } from '../../lib/fonts';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const KOREA_TIME_OFFSET = 9 * 60 * 60 * 1000;

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const KOREAN_WEEKDAYS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

const SECTION_BASE_CLASS = [
  'box-border w-full bg-[#f4f3f1] px-4 pt-[46px] pb-[50px] text-[#333333]',
].join(' ');

const COUNTER_CLASS = [
  'mt-5 grid grid-cols-[64px_1fr_64px_1fr_64px_1fr_64px] items-center',
].join(' ');

type WeddingCalendarProps = {
  targetDate?: string;
  groomName?: string;
  brideName?: string;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  calendarDays: number;
  isPast: boolean;
  isWeddingDay: boolean;
};

type CalendarCell = {
  key: string;
  day: number;
  isCurrentMonth: boolean;
  isSunday: boolean;
  isWeddingDay: boolean;
};

const INITIAL_COUNTDOWN: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  calendarDays: 0,
  isPast: false,
  isWeddingDay: false,
};

function toKoreaDateParts(timestamp: number) {
  const koreaDate = new Date(timestamp + KOREA_TIME_OFFSET);

  return {
    year: koreaDate.getUTCFullYear(),
    month: koreaDate.getUTCMonth(),
    day: koreaDate.getUTCDate(),
  };
}

function getKoreaMidnightTimestamp(timestamp: number): number {
  const { year, month, day } = toKoreaDateParts(timestamp);
  return Date.UTC(year, month, day) - KOREA_TIME_OFFSET;
}

function getCountdown(
  targetTimestamp: number,
  nowTimestamp: number,
): Countdown {
  const difference = targetTimestamp - nowTimestamp;
  const remaining = Math.max(0, difference);
  const targetMidnight = getKoreaMidnightTimestamp(targetTimestamp);
  const nowMidnight = getKoreaMidnightTimestamp(nowTimestamp);
  const calendarDays = Math.round(
    (targetMidnight - nowMidnight) / MILLISECONDS_PER_DAY,
  );

  return {
    days: Math.floor(remaining / MILLISECONDS_PER_DAY),
    hours: Math.floor((remaining / (60 * 60 * 1000)) % 24),
    minutes: Math.floor((remaining / (60 * 1000)) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
    calendarDays: Math.max(0, calendarDays),
    isPast: difference < 0,
    isWeddingDay: calendarDays === 0,
  };
}

function createCalendarCells(
  year: number,
  month: number,
  weddingDay: number,
): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const daysInPreviousMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const calendarDay = index - firstWeekday + 1;
    const isCurrentMonth = calendarDay >= 1 && calendarDay <= daysInMonth;
    const day =
      calendarDay < 1
        ? daysInPreviousMonth + calendarDay
        : calendarDay > daysInMonth
          ? calendarDay - daysInMonth
          : calendarDay;

    return {
      key: `${isCurrentMonth ? 'current' : calendarDay < 1 ? 'previous' : 'next'}-${day}-${index}`,
      day,
      isCurrentMonth,
      isSunday: index % 7 === 0,
      isWeddingDay: isCurrentMonth && day === weddingDay,
    };
  });
}

export default function WeddingCalendar({
  targetDate = '2026-09-20T12:00:00+09:00',
  groomName = '지웅재',
  brideName = '송혜정',
}: WeddingCalendarProps): React.ReactElement {
  const [countdown, setCountdown] = useState<Countdown>(INITIAL_COUNTDOWN);

  const targetTimestamp = useMemo(
    () => new Date(targetDate).getTime(),
    [targetDate],
  );
  const target = useMemo(
    () => new Date(targetTimestamp + KOREA_TIME_OFFSET),
    [targetTimestamp],
  );
  const year = target.getUTCFullYear();
  const month = target.getUTCMonth();
  const day = target.getUTCDate();
  const weekday = target.getUTCDay();
  const hour = target.getUTCHours();
  const minute = target.getUTCMinutes();
  const calendarCells = useMemo(
    () => createCalendarCells(year, month, day),
    [year, month, day],
  );

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(targetTimestamp, Date.now()));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [targetTimestamp]);

  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  const displayTime =
    minute === 0 ? `${displayHour}시` : `${displayHour}시 ${minute}분`;

  return (
    <section
      className={`${SECTION_BASE_CLASS} ${GowunDodum.className}`}
      aria-label={`${year}년 ${month + 1}월 ${day}일 예식 달력`}
    >
      <WeddingRibbon />

      <header className="text-center">
        <div className="text-[30px] leading-[1.2] font-black tracking-[-0.045em] tabular-nums">
          {year}. {month + 1}. {day}
        </div>

        <p className="mt-3.5 text-lg leading-normal font-medium tracking-[-0.045em]">
          <span>{KOREAN_WEEKDAYS[weekday]}</span> <span>{period}</span>{' '}
          <span>{displayTime}</span>
        </p>
      </header>

      <div className="mt-4.5 border-y border-[#e8e7e5] pt-6.5 pb-4">
        <div
          className="grid grid-cols-7 text-center text-sm leading-5 font-semibold"
          aria-hidden="true"
        >
          {WEEKDAY_LABELS.map((label, index) => (
            <span
              key={label}
              className={index === 0 ? 'text-[#ea3323]' : undefined}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-7 gap-y-1">
          {calendarCells.map((cell) => {
            const dateColorClass = cell.isWeddingDay
              ? 'bg-[#333333] text-white font-bold'
              : cell.isSunday
                ? 'text-[#ea3323]'
                : '';

            return (
              <span
                key={cell.key}
                className={`mx-auto flex size-9 items-center justify-center rounded-full text-lg leading-none font-medium tabular-nums ${
                  !cell.isCurrentMonth ? 'invisible' : ''
                } ${dateColorClass}`}
                aria-current={cell.isWeddingDay ? 'date' : undefined}
                aria-hidden={!cell.isCurrentMonth || undefined}
              >
                {cell.day}
              </span>
            );
          })}
        </div>
      </div>

      <div className={COUNTER_CLASS} aria-live="polite">
        <CounterItem label="DAYS" value={countdown.days} />
        <CounterDots />
        <CounterItem label="HOUR" value={countdown.hours} />
        <CounterDots />
        <CounterItem label="MIN" value={countdown.minutes} />
        <CounterDots />
        <CounterItem label="SEC" value={countdown.seconds} />
      </div>

      <div className="mt-7.75 text-center text-lg leading-normal font-medium tracking-[-0.045em] whitespace-nowrap">
        {countdown.isPast && !countdown.isWeddingDay ? (
          <span>함께해 주셔서 감사합니다.</span>
        ) : countdown.isWeddingDay ? (
          <span>
            {groomName} <HeartIcon /> {brideName}의 결혼식이 오늘입니다.
          </span>
        ) : (
          <span>
            {groomName} <HeartIcon /> {brideName}의 결혼식이{' '}
            <strong className="text-base font-bold text-[#ec5e2a]">
              {countdown.calendarDays}일
            </strong>{' '}
            남았습니다.
          </span>
        )}
      </div>
    </section>
  );
}

type CounterItemProps = {
  label: string;
  value: number;
};

function CounterItem({ label, value }: CounterItemProps): React.ReactElement {
  return (
    <div className="box-border flex h-19.5 min-w-0 flex-col items-center justify-center gap-2.5 rounded-[9px] bg-[#edeceb]">
      <span className="text-[11px] leading-none font-medium">{label}</span>
      <span className="text-[21px] leading-none font-extrabold tabular-nums">
        {value}
      </span>
    </div>
  );
}

function CounterDots(): React.ReactElement {
  return (
    <span
      className="flex flex-col items-center justify-center gap-1"
      aria-hidden="true"
    >
      <i className="block size-0.5 rounded-full bg-[#333333]" />
      <i className="block size-0.5 rounded-full bg-[#333333]" />
    </span>
  );
}

function HeartIcon(): React.ReactElement {
  return (
    <svg
      className="mx-1.25 inline-block size-3 fill-[#ec5e2a] align-[-1px]"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 21s-7.2-4.5-9.55-8.7C.3 8.45 2.1 4.5 6.1 4.5c2.15 0 3.65 1.3 4.45 2.55C11.35 5.8 12.85 4.5 15 4.5c4 0 5.8 3.95 3.65 7.8C16.3 16.5 12 21 12 21Z" />
    </svg>
  );
}
