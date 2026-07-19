export const BACKGROUND_MUSIC_VARIANT_NAMES = ['none', 'wedding'] as const;

export type BackgroundMusicVariant =
  (typeof BACKGROUND_MUSIC_VARIANT_NAMES)[number];

export type BackgroundMusicVariantConfig = {
  /** public 폴더를 기준으로 하는 음원 경로입니다. null이면 재생하지 않습니다. */
  readonly src: string | null;
  /** 재생 버튼과 스크린 리더에 표시할 곡 이름입니다. */
  readonly title: string;
  readonly autoPlay: boolean;
  readonly loop: boolean;
  /** 0부터 1 사이의 기본 볼륨입니다. */
  readonly volume: number;
  readonly preload: 'none' | 'metadata' | 'auto';
  /** 자동 재생이 차단되면 사용자의 첫 입력에서 다시 재생을 시도합니다. */
  readonly startOnFirstInteraction: boolean;
  /** 화면에 재생/정지 버튼을 표시합니다. */
  readonly showControl: boolean;
};

/**
 * 배경음악별 기본값을 한곳에서 관리합니다.
 *
 * 새 음악을 추가하는 방법:
 * 1. public/audio/background-music에 음원 파일을 추가합니다.
 * 2. BACKGROUND_MUSIC_VARIANT_NAMES에 variant 이름을 추가합니다.
 * 3. 아래 variants에 음원 경로와 재생 옵션을 추가합니다.
 * 4. <BackgroundMusic variant="추가한이름" />으로 사용합니다.
 */
export const variants = {
  none: {
    src: null,
    title: '배경음악 없음',
    autoPlay: false,
    loop: false,
    volume: 0,
    preload: 'none',
    startOnFirstInteraction: false,
    showControl: false,
  },
  wedding: {
    src: '/audio/background-music/would_you_marry_me.mp3',
    title: 'Wedding background music',
    autoPlay: true,
    loop: true,
    volume: 0.5,
    preload: 'auto',
    startOnFirstInteraction: true,
    showControl: true,
  },
} as const satisfies Record<
  BackgroundMusicVariant,
  BackgroundMusicVariantConfig
>;
