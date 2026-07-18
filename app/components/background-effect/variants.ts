export const BACKGROUND_EFFECT_VARIANT_NAMES = ['cherryBlossom'] as const;

export type BackgroundEffectVariant =
  (typeof BACKGROUND_EFFECT_VARIANT_NAMES)[number];

export type BackgroundEffectVariantConfig = {
  /** public 폴더를 기준으로 하는 APNG/GIF/animated WebP 경로입니다. */
  readonly imageSrc: string;
  readonly opacity: number;
  readonly objectFit: 'cover' | 'contain' | 'fill';
  readonly maxWidth: number;
};

/**
 * 배경 효과별 기본값을 한곳에서 관리합니다.
 *
 * 이 컴포넌트는 이미지 파일 안에 들어 있는 애니메이션을 재생합니다.
 * 따라서 새 variant도 APNG, GIF, animated WebP처럼 스스로 움직이는
 * 이미지 파일을 등록해야 이미지 경로만 바꿔 같은 방식으로 동작합니다.
 * 일반 정적 PNG를 넣으면 정지 이미지로 표시됩니다.
 *
 * 새 효과를 추가하는 방법:
 * 1. public/images/effects에 애니메이션 이미지를 추가합니다.
 * 2. BACKGROUND_EFFECT_VARIANT_NAMES에 이름을 추가합니다.
 * 3. 아래 variants에 해당 이미지 경로와 기본값을 추가합니다.
 */
export const variants = {
  cherryBlossom: {
    imageSrc: '/images/effects/effect_cherryblossom.png',
    opacity: 1,
    objectFit: 'cover',
    maxWidth: 448,
  },
} as const satisfies Record<
  BackgroundEffectVariant,
  BackgroundEffectVariantConfig
>;
