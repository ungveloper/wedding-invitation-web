'use client';

import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import BackgroundEffect from './components/background-effect/BackgroundEffect';
import Handwriting from './components/handwriting/Handwriting';
import { Solinsunny } from './lib/fonts';

type CoverProps = {
  photoSrc?: string;
  statement?: string;
  date?: string;
  groomLabel?: string;
  brideLabel?: string;
};

type CoverStyle = CSSProperties & {
  '--cover-photo': string;
};

const LAYER_CLASS =
  'pointer-events-none absolute m-0 block select-none bg-center bg-no-repeat p-0';

const TEXT_CLASS =
  'absolute z-[2] m-0 box-border block whitespace-pre-wrap break-words p-0 font-normal text-[#353535] select-none';

const HEART_MOTIONS = [
  { angle: 5, delay: 0 },
  { angle: 7, delay: -160 },
  { angle: 9, delay: -320 },
  { angle: 12, delay: -480 },
  { angle: 8, delay: -640 },
  { angle: 10, delay: -800 },
] as const;

export default function Cover({
  photoSrc = '/images/cover/heart-frame-photo.png',
  statement = 'Our wedding day',
  date = 'on September 20, 2026',
  groomLabel = 'Groom',
  brideLabel = 'Bride',
}: CoverProps): ReactElement {
  const coverRef = useRef<HTMLElement>(null);
  const groomFloatRef = useRef<HTMLDivElement>(null);
  const brideFloatRef = useRef<HTMLDivElement>(null);

  const coverStyle: CoverStyle = {
    '--cover-photo': `url("${photoSrc}")`,
  };

  useEffect(() => {
    const cover = coverRef.current;
    const groomFloat = groomFloatRef.current;
    const brideFloat = brideFloatRef.current;

    if (!cover || !groomFloat || !brideFloat) {
      return;
    }

    const heartElements = Array.from(
      cover.querySelectorAll<HTMLElement>('[data-cover-hearts] > span'),
    );

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    let animations: Animation[] = [];
    const heartTimeouts: number[] = [];
    const heartIntervals: number[] = [];

    const cancelAnimations = () => {
      animations.forEach((animation) => {
        animation.cancel();
      });

      heartTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      heartIntervals.forEach((intervalId) => {
        window.clearInterval(intervalId);
      });

      heartElements.forEach((heart) => {
        heart.style.transform = '';
      });

      animations = [];
      heartTimeouts.length = 0;
      heartIntervals.length = 0;
    };

    const startAnimations = () => {
      cancelAnimations();

      groomFloat.style.transform = '';
      brideFloat.style.transform = '';

      heartElements.forEach((heart) => {
        heart.style.transform = '';
      });

      const coverWidth = cover.getBoundingClientRect().width;
      const cqw = coverWidth / 100;

      const nextAnimations: Animation[] = [];

      /*
       * 신랑·신부의 부유 애니메이션은
       * 사용자의 모션 감소 설정을 따릅니다.
       */
      if (!reducedMotionQuery.matches) {
        const groomAnimation = groomFloat.animate(
          [
            {
              offset: 0,
              transform: 'translate3d(0, 0, 0)',
            },
            {
              offset: 0.3,
              transform: `translate3d(
                ${-0.6 * cqw}px,
                ${-0.9 * cqw}px,
                0
              )`,
            },
            {
              offset: 0.65,
              transform: `translate3d(
                ${0.7 * cqw}px,
                ${-0.3 * cqw}px,
                0
              )`,
            },
            {
              offset: 1,
              transform: 'translate3d(0, 0, 0)',
            },
          ],
          {
            duration: 2400,
            easing: 'ease-in-out',
            iterations: Infinity,
          },
        );

        const brideAnimation = brideFloat.animate(
          [
            {
              offset: 0,
              transform: 'translate3d(0, 0, 0)',
            },
            {
              offset: 0.35,
              transform: `translate3d(
                ${0.7 * cqw}px,
                ${-0.6 * cqw}px,
                0
              )`,
            },
            {
              offset: 0.7,
              transform: `translate3d(
                ${-0.4 * cqw}px,
                ${0.5 * cqw}px,
                0
              )`,
            },
            {
              offset: 1,
              transform: 'translate3d(0, 0, 0)',
            },
          ],
          {
            delay: -1200,
            duration: 2800,
            easing: 'ease-in-out',
            iterations: Infinity,
          },
        );

        nextAnimations.push(groomAnimation, brideAnimation);
      }

      /*
       * 하트 6개는 각각 다른 각도와 시작 시점으로
       * 좌우 두 프레임을 1초 간격으로 반복합니다.
       */
      heartElements.forEach((heart, index) => {
        const motion = HEART_MOTIONS[index % HEART_MOTIONS.length];
        const startDelay = Math.abs(motion.delay);

        let isRightFrame = index % 2 === 0;

        const applyFrame = () => {
          heart.style.transform = isRightFrame
            ? `rotate(${motion.angle}deg)`
            : `rotate(${-motion.angle}deg)`;

          isRightFrame = !isRightFrame;
        };

        applyFrame();

        const timeoutId = window.setTimeout(() => {
          applyFrame();

          const intervalId = window.setInterval(() => {
            applyFrame();
          }, 1000);

          heartIntervals.push(intervalId);
        }, startDelay);

        heartTimeouts.push(timeoutId);
      });

      animations = nextAnimations;
    };

    const resizeObserver = new ResizeObserver(() => {
      startAnimations();
    });

    resizeObserver.observe(cover);
    reducedMotionQuery.addEventListener('change', startAnimations);

    startAnimations();

    return () => {
      resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', startAnimations);
      cancelAnimations();
    };
  }, []);

  return (
    <section
      ref={coverRef}
      className="relative isolate aspect-9/16 w-full overflow-hidden bg-[#f2c5cd] @container"
      style={coverStyle}
    >
      <div
        className="pointer-events-none absolute inset-0 z-2"
        aria-hidden="true"
      >
        <BackgroundEffect variant="cherryBlossom" placement="container" />
      </div>

      <div
        className={`absolute inset-0 z-1 overflow-hidden bg-[#f2c5cd] ${Solinsunny.className}`}
      >
        <div
          className={`${LAYER_CLASS} left-[2.402778%] top-[4.788551%] h-[95.211392%] w-[95.1945%] [background-image:var(--cover-photo)] bg-cover`}
          role="img"
          aria-label="웨딩 커버 사진"
        />

        <span
          className={`${LAYER_CLASS} left-[-0.75%] top-[-0.421941%] h-[100.843882%] w-[101.5%] bg-[url('/images/cover/heart-mask.svg')] bg-cover`}
          aria-hidden="true"
        />

        <span
          className={`${LAYER_CLASS} left-[9.375%] top-[15.195359%] h-[79.768917%] w-[81.25%] bg-[url('/images/cover/heart-outline.svg')] bg-size-[100%_100%]`}
          aria-hidden="true"
        />

        <div
          data-cover-hearts
          className="pointer-events-none absolute inset-0 z-2"
          aria-hidden="true"
        >
          <span className="absolute left-[19.103175%] top-[91.729395%] h-[3.375527%] w-[5.5%] origin-center will-change-transform">
            <span
              className={`${LAYER_CLASS} inset-0 rotate-[-10deg] bg-[url('/images/cover/heart-red-bottom-left.svg')] bg-size-[100%_100%]`}
            />
          </span>

          <span className="absolute left-[5.55555%] top-[54.708439%] h-[3.23488%] w-[4.5%] origin-center will-change-transform">
            <span
              className={`${LAYER_CLASS} inset-0 -rotate-12 bg-[url('/images/cover/heart-white-middle-left.svg')] bg-size-[100%_100%]`}
            />
          </span>

          <span className="absolute left-[10.125%] top-[14.914065%] h-[3.23488%] w-[5%] origin-center will-change-transform">
            <span
              className={`${LAYER_CLASS} inset-0 rotate-[-13deg] bg-[url('/images/cover/heart-red-top-left.svg')] bg-size-[100%_100%]`}
            />
          </span>

          <span className="absolute left-[88.375%] top-[61.673699%] h-[3.23488%] w-[4.5%] origin-center will-change-transform">
            <span
              className={`${LAYER_CLASS} inset-0 bg-[url('/images/cover/heart-red-middle-right.svg')] bg-size-[100%_100%]`}
            />
          </span>

          <span className="absolute left-[88.6945%] top-[16.812799%] h-[3.23488%] w-[4.5%] origin-center will-change-transform">
            <span
              className={`${LAYER_CLASS} inset-0 rotate-11 bg-[url('/images/cover/heart-white-top-right.svg')] bg-size-[100%_100%]`}
            />
          </span>

          <span className="absolute left-[80.5%] top-[80.45007%] h-[3.23488%] w-[4.5%] origin-center will-change-transform">
            <span
              className={`${LAYER_CLASS} inset-0 rotate-6 bg-[url('/images/cover/heart-white-bottom-right.svg')] bg-size-[100%_100%]`}
            />
          </span>
        </div>

        <div
          className={`${TEXT_CLASS} left-1/2 top-[6.6%] flex h-[8.572771%] w-[90%] -translate-x-1/2 items-center justify-center overflow-visible`}
        >
          <Handwriting
            variant="gettingMarried"
            className="w-[110%] flex-none"
            color="#AA091C"
            duration={4}
            delay={0.7}
          />
        </div>

        <p
          className={`${TEXT_CLASS} left-[7.30555%] top-[75.527426%] flex h-[12.725204%] w-[26.1905%] items-center justify-start text-left text-[clamp(19px,6vw,26.88px)] leading-[1.3] supports-[font-size:1cqw]:text-[6cqw]`}
        >
          {statement}
        </p>

        <p
          className={`${TEXT_CLASS} animate-tada left-[60.84925%] top-[87.495921%] flex h-[8.840661%] w-[33.09525%] origin-center items-center justify-end text-right text-[clamp(18px,5.75vw,25.76px)] leading-[1.3] will-change-transform supports-[font-size:1cqw]:text-[5.75cqw]`}
        >
          {date}
        </p>

        <div
          ref={groomFloatRef}
          className="pointer-events-none absolute inset-0 z-3 will-change-transform"
        >
          <span
            className={`${LAYER_CLASS} left-[6.5%] top-[63.291139%] h-[6.84436%] w-[25.238%] bg-[url('/images/cover/label-groom.svg')] bg-size-[100%_100%]`}
            aria-hidden="true"
          />

          <p
            className={`${TEXT_CLASS} left-[9.80555%] top-[64.322363%] flex h-[4.500703%] w-[19.75%] rotate-[-16deg] items-center justify-center text-center text-[clamp(16px,5vw,22.4px)] leading-normal supports-[font-size:1cqw]:text-[5cqw]`}
          >
            {brideLabel}
          </p>

          <span
            className={`${LAYER_CLASS} left-[20.4365%] top-[59.07173%] h-[3.171969%] w-[8.333325%] transform-[rotate(295deg)_scaleX(-1)] bg-[url('/images/cover/wings-groom.svg')] bg-size-[100%_100%]`}
            aria-hidden="true"
          />
        </div>

        <div
          ref={brideFloatRef}
          className="pointer-events-none absolute inset-0 z-3 will-change-transform"
        >
          <span
            className={`${LAYER_CLASS} left-[69.1945%] top-[25.987764%] h-[6.304866%] w-[25%] bg-[url('/images/cover/label-bride.svg')] bg-size-[100%_100%]`}
            aria-hidden="true"
          />

          <p
            className={`${TEXT_CLASS} left-[72.9445%] top-[26.749086%] flex h-[4.500703%] w-[18.25%] rotate-11 items-center justify-center text-center text-[clamp(16px,5vw,22.4px)] leading-normal supports-[font-size:1cqw]:text-[5cqw]`}
          >
            {groomLabel}
          </p>

          <span
            className={`${LAYER_CLASS} left-[73.58325%] top-[30.987904%] h-[3.171969%] w-[8.333325%] rotate-21 bg-[url('/images/cover/wings-bride.svg')] bg-size-[100%_100%]`}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
