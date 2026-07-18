'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { IntroRendererProps } from '../Intro';

type CurtainState = 'closed' | 'opening' | 'open';

type CurtainStyle = CSSProperties & {
  '--curtain-duration': string;
  '--curtain-delay': string;
  '--curtain-color': string;
};

const PANEL_CLASS =
  "absolute inset-y-0 w-[58%] overflow-hidden [background-color:var(--curtain-color)] bg-center bg-no-repeat [background-size:100%_100%] [backface-visibility:hidden] will-change-[transform,filter] [transition:transform_var(--curtain-duration)_cubic-bezier(0.7,0,0.2,1)_var(--curtain-delay),filter_var(--curtain-duration)_ease_var(--curtain-delay)] after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_78%,rgba(0,0,0,0.12))] motion-reduce:[transition-duration:1ms] motion-reduce:[transition-delay:0ms]";

export default function Curtain({
  className = '',
  duration = 1.45,
  delay = 0,
  autoOpen = false,
  ariaLabel = '커튼을 열어 청첩장 보기',
  curtainColor = '#7d2638',
  curtainLeftImage = '/images/intro/curtain/veil-left.webp',
  curtainRightImage = '/images/intro/curtain/veil-right.webp',
  lockScroll = true,
  onOpen,
}: IntroRendererProps): React.ReactElement | null {
  const [state, setState] = useState<CurtainState>('closed');
  const [isMounted, setIsMounted] = useState(true);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoOpenStartedRef = useRef(false);

  const safeDuration = Number.isFinite(duration) ? Math.max(duration, 0) : 1.45;
  const safeDelay = Number.isFinite(delay) ? Math.max(delay, 0) : 0;

  useEffect(() => {
    if (!lockScroll || state === 'open') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [lockScroll, state]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleOpen = useCallback(() => {
    if (state !== 'closed') {
      return;
    }

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setState('opening');

    const totalMilliseconds = reduceMotion
      ? 20
      : (safeDelay + safeDuration) * 1000 + 120;

    timerRef.current = setTimeout(() => {
      setState('open');
      setIsMounted(false);
      onOpen?.();
    }, totalMilliseconds);
  }, [onOpen, safeDelay, safeDuration, state]);

  useEffect(() => {
    if (!autoOpen || autoOpenStartedRef.current) {
      return;
    }

    autoOpenStartedRef.current = true;
    handleOpen();
  }, [autoOpen, handleOpen]);

  const curtainStyle: CurtainStyle = {
    '--curtain-duration': `${safeDuration}s`,
    '--curtain-delay': `${safeDelay}s`,
    '--curtain-color': curtainColor,
  };

  const leftPanelStyle: CSSProperties = {
    backgroundImage: `url("${curtainLeftImage}")`,
  };

  const rightPanelStyle: CSSProperties = {
    backgroundImage: `url("${curtainRightImage}")`,
  };

  if (!isMounted) {
    return null;
  }

  const isOpening = state === 'opening';

  return (
    <button
      type="button"
      className={[
        'fixed inset-0 z-9999 isolate block h-svh min-h-full w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-white touch-manipulation perspective-[1000px] [-webkit-tap-highlight-color:transparent] focus-visible:[outline:3px_solid_rgba(255,255,255,0.9)] focus-visible:[outline-offset:-6px]',
        isOpening ? 'pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={curtainStyle}
      onClick={handleOpen}
      aria-label={ariaLabel}
      aria-expanded={state !== 'closed'}
      data-intro-state={state}
      data-intro-variant="curtain"
    >
      <span
        className={`${PANEL_CLASS} left-0 z-2 origin-left shadow-[4px_0_16px_rgba(0,0,0,0.28)] ${
          isOpening
            ? 'transform-[translate3d(-103%,0,0)_rotateY(-4deg)] brightness-[0.82]'
            : ''
        }`}
        style={leftPanelStyle}
        aria-hidden="true"
      />

      <span
        className={`${PANEL_CLASS} right-0 z-1 origin-right shadow-[-4px_0_16px_rgba(0,0,0,0.28)] ${
          isOpening
            ? 'transform-[translate3d(103%,0,0)_rotateY(4deg)] brightness-[0.82]'
            : ''
        }`}
        style={rightPanelStyle}
        aria-hidden="true"
      />
    </button>
  );
}
