'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
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
}: HandwritingRendererProps): React.ReactElement {
  const artwork = variants[variant];
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const reactId = useId();
  const clipPathId = `handwriting-clip-${reactId.replace(
    /[^a-zA-Z0-9_-]/g,
    '',
  )}`;

  const [isVisible, setIsVisible] = useState(false);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    const path = pathRef.current;

    if (!path) {
      return;
    }

    setPathLength(path.getTotalLength());
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

    return () => {
      observer.disconnect();
    };
  }, [once, threshold]);

  useEffect(() => {
    const path = pathRef.current;

    if (!path || pathLength <= 0) {
      return;
    }

    animationRef.current?.cancel();
    animationRef.current = null;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      path.style.opacity = '1';
      path.style.strokeDashoffset = '0';
      return;
    }

    if (!isVisible) {
      path.style.opacity = '0';
      path.style.strokeDashoffset = `${pathLength}`;
      return;
    }

    const animation = path.animate(
      [
        {
          opacity: 0,
          strokeDashoffset: `${pathLength}`,
          offset: 0,
        },
        {
          opacity: 1,
          strokeDashoffset: `${pathLength}`,
          offset: 0.0001,
        },
        {
          opacity: 1,
          strokeDashoffset: '0',
          offset: 1,
        },
      ],
      {
        duration: (duration ?? artwork.defaultDuration) * 1000,
        delay: delay * 1000,
        easing: 'cubic-bezier(0.45, 0, 0.3, 1)',
        fill: 'both',
      },
    );

    animationRef.current = animation;

    return () => {
      animation.cancel();

      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };
  }, [artwork.defaultDuration, delay, duration, isVisible, pathLength]);

  const rootStyle: CSSProperties = {
    color,
  };

  const drawingPathStyle: CSSProperties = {
    strokeDasharray: `${pathLength} ${pathLength * 2}`,
    strokeDashoffset: pathLength,
    opacity: 0,
  };

  return (
    <div
      ref={rootRef}
      className={['w-full', className].filter(Boolean).join(' ')}
      style={rootStyle}
      data-handwriting-variant={variant}
    >
      <svg
        className="block h-auto w-full overflow-visible"
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
          className="fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] will-change-[stroke-dashoffset,opacity]"
          style={drawingPathStyle}
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
}: HandwritingProps): React.ReactElement {
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
