export const INTRO_VARIANT_NAMES = ['curtain'] as const;

export type IntroVariant = (typeof INTRO_VARIANT_NAMES)[number];

export type IntroVariantConfig = {
  readonly defaultDuration: number;
  readonly defaultDelay: number;
  readonly eyebrow: string;
  readonly title: string;
  readonly openLabel: string;
  readonly ariaLabel: string;
  readonly curtainColor: string;
  readonly curtainHighlightColor: string;
  readonly curtainShadowColor: string;
  readonly curtainLeftImage: string;
  readonly curtainRightImage: string;
};

/**
 * 인트로별 기본값을 한곳에서 관리합니다.
 *
 * 새로운 인트로를 추가할 때는:
 * 1. INTRO_VARIANT_NAMES에 이름을 추가하고
 * 2. 아래 variants에 기본값을 추가한 뒤
 * 3. Intro.tsx의 renderer 맵에 전용 컴포넌트를 연결합니다.
 */
export const variants = {
  curtain: {
    defaultDuration: 1.45,
    defaultDelay: 0,
    eyebrow: 'Wedding',
    title: 'Invitation',
    openLabel: '터치하여 열기',
    ariaLabel: '커튼을 열어 청첩장 보기',
    curtainColor: '#7d2638',
    curtainHighlightColor: '#b85a6e',
    curtainShadowColor: '#350812',
    curtainLeftImage: '/images/intro/curtain/veil-left.webp',
    curtainRightImage: '/images/intro/curtain/veil-right.webp',
  },
} as const satisfies Record<IntroVariant, IntroVariantConfig>;
