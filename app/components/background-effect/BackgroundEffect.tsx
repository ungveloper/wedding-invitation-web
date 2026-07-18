import type { CSSProperties } from 'react';
import { variants, type BackgroundEffectVariant } from './variants';

export type { BackgroundEffectVariant } from './variants';

export type BackgroundEffectProps = {
  /** variants.ts에 등록한 효과 이름입니다. */
  variant?: BackgroundEffectVariant;

  /** variant의 이미지 경로를 일시적으로 덮어씁니다. */
  imageSrc?: string;

  className?: string;
  opacity?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  zIndex?: number;
  maxWidth?: number;

  /** viewport는 스크롤 중에도 화면에 고정되고, container는 부모 영역을 채웁니다. */
  placement?: 'viewport' | 'container';

  /** 사용자가 동작 줄이기를 켰을 때 효과를 숨깁니다. */
  respectReducedMotion?: boolean;
};

type BackgroundEffectStyle = CSSProperties & {
  '--background-effect-opacity': number;
  '--background-effect-object-fit': 'cover' | 'contain' | 'fill';
  '--background-effect-z-index': number;
  '--background-effect-max-width': string;
};

export default function BackgroundEffect({
  variant = 'cherryBlossom',
  imageSrc,
  className = '',
  opacity,
  objectFit,
  zIndex = 40,
  maxWidth,
  placement = 'viewport',
  respectReducedMotion = true,
}: BackgroundEffectProps) {
  const config = variants[variant];
  const resolvedOpacity = Math.min(Math.max(opacity ?? config.opacity, 0), 1);
  const resolvedMaxWidth = Math.max(maxWidth ?? config.maxWidth, 1);

  const style: BackgroundEffectStyle = {
    '--background-effect-opacity': resolvedOpacity,
    '--background-effect-object-fit': objectFit ?? config.objectFit,
    '--background-effect-z-index': zIndex,
    '--background-effect-max-width': `${resolvedMaxWidth}px`,
  };

  return (
    <div
      className={[
        'inset-y-0 overflow-hidden pointer-events-none select-none z-(--background-effect-z-index)',
        placement === 'viewport'
          ? 'fixed left-1/2 h-svh w-[min(100vw,var(--background-effect-max-width))] -translate-x-1/2'
          : 'absolute inset-x-0 h-full w-full',
        respectReducedMotion ? 'motion-reduce:hidden' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      data-background-effect={variant}
      aria-hidden="true"
    >
      {/*
        effect_cherryblossom.png은 정적 PNG가 아니라 APNG입니다.
        브라우저가 img 요소만으로 파일 내부 프레임을 자동 반복 재생합니다.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="block h-full w-full pointer-events-none [object-fit:var(--background-effect-object-fit)] opacity-(--background-effect-opacity)"
        src={imageSrc ?? config.imageSrc}
        alt=""
        draggable={false}
      />
    </div>
  );
}
