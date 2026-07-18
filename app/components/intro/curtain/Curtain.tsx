'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { IntroRendererProps } from '../Intro';
import styles from './Curtain.module.css';

type CurtainState = 'closed' | 'opening' | 'open';

type CurtainStyle = CSSProperties & {
  '--curtain-duration': string;
  '--curtain-delay': string;
  '--curtain-color': string;
  '--curtain-highlight': string;
  '--curtain-shadow': string;
};

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className={direction === 'left' ? styles.arrowLeft : styles.arrowRight}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <path d="M19 12H5M5 12l5-5M5 12l5 5" />
      ) : (
        <path d="M5 12h14M19 12l-5-5M19 12l-5 5" />
      )}
    </svg>
  );
}

export default function Curtain({
  children,
  className = '',
  duration = 1.45,
  delay = 0,
  eyebrow = 'Wedding',
  title = 'Invitation',
  openLabel = '터치하여 열기',
  ariaLabel = '커튼을 열어 청첩장 보기',
  curtainColor = '#7d2638',
  curtainHighlightColor = '#b85a6e',
  curtainShadowColor = '#350812',
  curtainLeftImage = '/images/intro/curtain/veil-left.webp',
  curtainRightImage = '/images/intro/curtain/veil-right.webp',
  lockScroll = true,
  onOpen,
}: IntroRendererProps) {
  const [state, setState] = useState<CurtainState>('closed');
  const [isMounted, setIsMounted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const curtainStyle: CurtainStyle = {
    '--curtain-duration': `${safeDuration}s`,
    '--curtain-delay': `${safeDelay}s`,
    '--curtain-color': curtainColor,
    '--curtain-highlight': curtainHighlightColor,
    '--curtain-shadow': curtainShadowColor,
  };

  const leftPanelStyle: CSSProperties = {
    backgroundImage: `url("${curtainLeftImage}")`,
  };

  const rightPanelStyle: CSSProperties = {
    backgroundImage: `url("${curtainRightImage}")`,
  };

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-intro-state={state}
      data-intro-variant="curtain"
    >
      <div className={styles.content}>{children}</div>

      {isMounted ? (
        <button
          type="button"
          className={[styles.overlay, state === 'opening' ? styles.opening : '']
            .filter(Boolean)
            .join(' ')}
          style={curtainStyle}
          onClick={handleOpen}
          aria-label={ariaLabel}
          aria-expanded={state !== 'closed'}
        >
          <span
            className={`${styles.panel} ${styles.panelLeft}`}
            style={leftPanelStyle}
            aria-hidden="true"
          />

          <span
            className={`${styles.panel} ${styles.panelRight}`}
            style={rightPanelStyle}
            aria-hidden="true"
          />

          <span className={styles.centerCopy}>
            <span className={styles.heading}>
              <span className={styles.eyebrow}>{eyebrow}</span>
              <span className={styles.title}>{title}</span>
            </span>

            <span className={styles.divider} />

            <span className={styles.openBadge}>
              <Arrow direction="left" />
              <span>{openLabel}</span>
              <Arrow direction="right" />
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
