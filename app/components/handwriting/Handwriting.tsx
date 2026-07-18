'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import styles from './Handwriting.module.css';
import { variants, type HandwritingVariant } from './variants';

export type { HandwritingVariant } from './variants';

export type HandwritingProps = {
  className?: string;
  /** 권장 prop. 표시할 SVG 손글씨 종류입니다. */
  variant?: HandwritingVariant;
  /** variant의 별칭입니다. 둘 다 전달하면 variant가 우선합니다. */
  type?: HandwritingVariant;
  duration?: number;
  delay?: number;
  once?: boolean;
  threshold?: number;
  ariaLabel?: string;
  color?: string;
};

type AnimationStyle = CSSProperties & {
  '--draw-duration': string;
  '--draw-delay': string;
  color: string;
};

type HandwritingRendererProps = Omit<HandwritingProps, 'variant' | 'type'> & {
  variant: HandwritingVariant;
};

function HandwritingRenderer({
  className = '',
  variant,
  duration,
  delay = 0.15,
  once = true,
  threshold = 0.25,
  ariaLabel,
  color = '#d97e9f',
}: HandwritingRendererProps) {
  const artwork = variants[variant];
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const reactId = useId();
  const clipPathId = `handwriting-clip-${reactId.replace(
    /[^a-zA-Z0-9_-]/g,
    '',
  )}`;

  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const path = pathRef.current;

    if (!path) return;

    const length = path.getTotalLength();

    // 빈 구간을 실제 경로보다 크게 만들어 마지막 획이
    // 애니메이션 전에 점처럼 되감겨 보이지 않게 합니다.
    path.style.setProperty('--path-length', `${length}`);
    path.style.setProperty('--path-gap', `${length * 2}`);

    setIsReady(true);
  }, []);

  useEffect(() => {
    const element = rootRef.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, threshold]);

  const animationStyle: AnimationStyle = {
    '--draw-duration': `${duration ?? artwork.defaultDuration}s`,
    '--draw-delay': `${delay}s`,
    color,
  };

  return (
    <div
      ref={rootRef}
      className={[
        styles.root,
        isReady ? styles.ready : '',
        isVisible ? styles.visible : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={animationStyle}
      data-handwriting-variant={variant}
    >
      <svg
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={artwork.viewBox}
        role="img"
        aria-label={ariaLabel ?? artwork.ariaLabel}
      >
        <defs>
          <clipPath id={clipPathId}>
            {artwork.clipPaths.map((path, index) => (
              <path
                key={`${variant}-${index}`}
                d={path.d}
                transform={'transform' in path ? path.transform : undefined}
              />
            ))}
          </clipPath>
        </defs>

        <path
          ref={pathRef}
          className={styles.drawingPath}
          clipPath={`url(#${clipPathId})`}
          d={artwork.drawingPath}
          strokeWidth={artwork.strokeWidth}
        />
      </svg>
    </div>
  );
}

export default function Handwriting({
  variant,
  type,
  ...props
}: HandwritingProps) {
  const resolvedVariant = variant ?? type ?? 'gettingMarried';

  // variant 변경 시 내부 상태와 SVG 경로 길이를 새로 초기화합니다.
  return (
    <HandwritingRenderer
      key={resolvedVariant}
      {...props}
      variant={resolvedVariant}
    />
  );
}
