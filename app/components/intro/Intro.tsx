'use client';

import type { ComponentType, ReactNode } from 'react';
import Curtain from './curtain/Curtain';
import { variants, type IntroVariant } from './variants';

export type { IntroVariant } from './variants';

export type IntroProps = {
  children: ReactNode;
  className?: string;

  /** 권장 prop. 표시할 인트로 효과입니다. */
  variant?: IntroVariant;

  /** variant의 별칭입니다. 둘 다 전달하면 variant가 우선합니다. */
  type?: IntroVariant;

  /** 인트로가 열리는 데 걸리는 시간입니다. 단위는 초입니다. */
  duration?: number;

  /**
   * 열기 요청 후 애니메이션 시작 전 대기 시간입니다.
   * autoOpen이 true이면 페이지 진입 후 자동 열기까지의 시간으로 사용됩니다.
   */
  delay?: number;

  /**
   * true이면 버튼을 누르지 않아도 자동으로 커튼을 엽니다.
   */
  autoOpen?: boolean;

  eyebrow?: string;
  title?: string;
  openLabel?: string;
  ariaLabel?: string;

  /** 이미지 로딩 실패 시 보이는 커튼 배경색입니다. */
  curtainColor?: string;
  curtainHighlightColor?: string;
  curtainShadowColor?: string;

  /** public 폴더를 기준으로 하는 좌우 커튼 이미지 경로입니다. */
  curtainLeftImage?: string;
  curtainRightImage?: string;

  /** 인트로가 닫혀 있는 동안 본문 스크롤을 막습니다. */
  lockScroll?: boolean;

  /** 커튼이 완전히 열린 다음 실행됩니다. */
  onOpen?: () => void;
};

export type IntroRendererProps = Omit<IntroProps, 'variant' | 'type'> & {
  variant: IntroVariant;
};

const renderers = {
  curtain: Curtain,
} satisfies Record<IntroVariant, ComponentType<IntroRendererProps>>;

export default function Intro({ variant, type, ...props }: IntroProps) {
  const resolvedVariant = variant ?? type ?? 'curtain';
  const Renderer = renderers[resolvedVariant];
  const config = variants[resolvedVariant];

  return (
    <Renderer
      key={resolvedVariant}
      {...props}
      variant={resolvedVariant}
      duration={props.duration ?? config.defaultDuration}
      delay={props.delay ?? config.defaultDelay}
      eyebrow={props.eyebrow ?? config.eyebrow}
      title={props.title ?? config.title}
      openLabel={props.openLabel ?? config.openLabel}
      ariaLabel={props.ariaLabel ?? config.ariaLabel}
      curtainColor={props.curtainColor ?? config.curtainColor}
      curtainHighlightColor={
        props.curtainHighlightColor ?? config.curtainHighlightColor
      }
      curtainShadowColor={props.curtainShadowColor ?? config.curtainShadowColor}
      curtainLeftImage={props.curtainLeftImage ?? config.curtainLeftImage}
      curtainRightImage={props.curtainRightImage ?? config.curtainRightImage}
    />
  );
}
