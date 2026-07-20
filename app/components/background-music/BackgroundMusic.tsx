'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { variants, type BackgroundMusicVariant } from './variants';

export type { BackgroundMusicVariant } from './variants';

export type BackgroundMusicProps = {
  /** variants.ts에 등록한 음악 이름입니다. */
  variant?: BackgroundMusicVariant;

  /** variant의 음원 경로를 일시적으로 덮어씁니다. */
  src?: string;

  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  preload?: 'none' | 'metadata' | 'auto';
  startOnFirstInteraction?: boolean;
  showControl?: boolean;
};

export default function BackgroundMusic({
  variant = 'none',
  src,
  className = '',
  autoPlay,
  loop,
  volume,
  preload,
  startOnFirstInteraction,
  showControl,
}: BackgroundMusicProps): React.ReactElement | null {
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * 브라우저가 백그라운드로 이동하기 직전에
   * 실제로 음악이 재생 중이었는지를 기억합니다.
   */
  const wasPlayingBeforeBackgroundRef = useRef(false);

  /**
   * 사용자가 우측 상단 버튼으로 직접 일시정지했는지를 기억합니다.
   * 직접 정지한 경우 화면 복귀 시 자동으로 재생하지 않습니다.
   */
  const userPausedRef = useRef(false);

  /**
   * 최초 사용자 입력을 감지하는 이벤트를
   * 음악 재생 성공 후 제거하기 위한 함수입니다.
   */
  const removeInteractionListenersRef = useRef<() => void>(() => {});

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const config = variants[variant];

  const resolvedSrc = src ?? config.src;
  const resolvedAutoPlay = autoPlay ?? config.autoPlay;
  const resolvedLoop = loop ?? config.loop;
  const resolvedVolume = Math.min(Math.max(volume ?? config.volume, 0), 1);
  const resolvedPreload = preload ?? config.preload;
  const resolvedStartOnFirstInteraction =
    startOnFirstInteraction ?? config.startOnFirstInteraction;
  const resolvedShowControl = showControl ?? config.showControl;

  /**
   * React 상태를 실제 audio 요소의 재생 상태와 동기화합니다.
   */
  const syncPlaybackState = useCallback((): void => {
    const audio = audioRef.current;

    const currentlyPlaying = Boolean(audio && !audio.paused && !audio.ended);

    setIsPlaying(currentlyPlaying);
  }, []);

  /**
   * 배경음악 재생을 요청합니다.
   *
   * 화면이 백그라운드 상태라면 재생하지 않습니다.
   * 브라우저의 자동재생 정책으로 차단된 경우 false를 반환합니다.
   */
  const play = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current;

    if (!audio || !resolvedSrc || document.visibilityState !== 'visible') {
      return false;
    }

    try {
      audio.muted = false;
      audio.volume = resolvedVolume;

      await audio.play();

      /**
       * play()를 기다리는 동안 브라우저가 백그라운드로 전환된 경우
       * 재생이 시작됐더라도 즉시 중지합니다.
       */
      if (document.visibilityState !== 'visible') {
        audio.pause();
        setIsPlaying(false);

        return false;
      }

      const didPlay = !audio.paused && !audio.ended;

      setHasError(false);
      setIsPlaying(didPlay);

      if (didPlay) {
        removeInteractionListenersRef.current();
      }

      return didPlay;
    } catch (error) {
      setIsPlaying(false);

      /**
       * NotAllowedError는 음원 파일 오류가 아니라
       * 브라우저의 자동재생 정책에 따른 정상적인 차단입니다.
       */
      if (
        !(error instanceof DOMException && error.name === 'NotAllowedError')
      ) {
        console.error('배경음악 재생에 실패했습니다.', error);
      }

      return false;
    }
  }, [resolvedSrc, resolvedVolume]);

  /**
   * 음원 경로가 변경되면 내부 상태를 초기화합니다.
   */
  useEffect(() => {
    userPausedRef.current = false;
    wasPlayingBeforeBackgroundRef.current = false;

  }, [resolvedSrc]);

  /**
   * volume prop 또는 variant 설정이 변경되면
   * 실제 audio 요소의 볼륨도 변경합니다.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = resolvedVolume;
  }, [resolvedVolume]);

  /**
   * 실제 audio 이벤트를 감시하여
   * 우측 상단 재생 버튼과 실제 음악 상태를 동기화합니다.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handlePlaybackStateChange = (): void => {
      syncPlaybackState();
    };

    const playbackEvents = [
      'play',
      'playing',
      'pause',
      'ended',
      'emptied',
      'abort',
      'loadedmetadata',
      'canplay',
    ] as const;

    playbackEvents.forEach((eventName) => {
      audio.addEventListener(eventName, handlePlaybackStateChange);
    });

    /**
     * 모바일에서 이벤트가 연결되기 전에 자동재생이 시작된 경우도
     * 현재 audio 상태를 직접 읽어 버튼 상태를 맞춥니다.
     */
    syncPlaybackState();

    return () => {
      playbackEvents.forEach((eventName) => {
        audio.removeEventListener(eventName, handlePlaybackStateChange);
      });
    };
  }, [resolvedSrc, syncPlaybackState]);

  /**
   * 페이지 최초 렌더링 시 자동재생을 시도합니다.
   *
   * 자동재생이 차단된 경우 화면의 첫 사용자 입력에서
   * 다시 재생을 시도합니다.
   */
  useEffect(() => {
    if (!resolvedSrc) {
      return;
    }

    let disposed = false;

    function removeInteractionListeners(): void {
      document.removeEventListener('pointerdown', tryPlayFromInteraction, true);

      document.removeEventListener('keydown', tryPlayFromInteraction, true);
    }

    function tryPlay(): void {
      const audio = audioRef.current;

      if (
        disposed ||
        userPausedRef.current ||
        document.visibilityState !== 'visible'
      ) {
        return;
      }

      if (audio && !audio.paused && !audio.ended) {
        removeInteractionListeners();
        syncPlaybackState();

        return;
      }

      void play();
    }

    function tryPlayFromInteraction(event: Event): void {
      if (disposed || userPausedRef.current) {
        return;
      }

      const target = event.target;

      /**
       * 우측 상단 음악 버튼을 누른 경우에는
       * 전역 pointerdown과 버튼 onClick이 중복 실행되지 않도록 합니다.
       */
      if (
        target instanceof Element &&
        target.closest('[data-background-music-control="true"]')
      ) {
        return;
      }

      void play().then((didPlay) => {
        if (didPlay) {
          removeInteractionListeners();
        }
      });
    }

    removeInteractionListenersRef.current = removeInteractionListeners;

    if (resolvedStartOnFirstInteraction) {
      /**
       * 커튼이나 전체 화면 영상보다 먼저 입력을 감지하도록
       * capture 단계에 이벤트를 등록합니다.
       */
      document.addEventListener('pointerdown', tryPlayFromInteraction, {
        capture: true,
        passive: true,
      });

      document.addEventListener('keydown', tryPlayFromInteraction, true);
    }

    /**
     * 페이지 렌더링 직후 즉시 자동재생을 시도합니다.
     */
    if (resolvedAutoPlay) {
      tryPlay();
    }

    return () => {
      disposed = true;

      removeInteractionListeners();

      removeInteractionListenersRef.current = () => {};
    };
  }, [
    play,
    resolvedAutoPlay,
    resolvedSrc,
    resolvedStartOnFirstInteraction,
    syncPlaybackState,
  ]);

  /**
   * 모바일 브라우저가 백그라운드로 이동하면 음악을 중지합니다.
   *
   * 다시 화면으로 돌아왔을 때는 백그라운드로 이동하기 직전에
   * 음악이 재생 중이었던 경우에만 이어서 재생합니다.
   */
  useEffect(() => {
    if (!resolvedSrc) {
      return;
    }

    const pauseForBackground = (): void => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      const wasActuallyPlaying = !audio.paused && !audio.ended;

      wasPlayingBeforeBackgroundRef.current =
        wasActuallyPlaying && !userPausedRef.current;

      if (wasActuallyPlaying) {
        audio.pause();
      }

      syncPlaybackState();
    };

    const resumeFromBackground = (): void => {
      if (
        document.visibilityState !== 'visible' ||
        !wasPlayingBeforeBackgroundRef.current ||
        userPausedRef.current
      ) {
        return;
      }

      void play().then((didPlay) => {
        if (didPlay) {
          wasPlayingBeforeBackgroundRef.current = false;
        }

        syncPlaybackState();
      });
    };

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        pauseForBackground();

        return;
      }

      resumeFromBackground();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    /**
     * 일부 모바일 브라우저에서 visibilitychange가 누락되는 경우를
     * 대비하여 pagehide와 pageshow도 함께 처리합니다.
     */
    window.addEventListener('pagehide', pauseForBackground);
    window.addEventListener('pageshow', resumeFromBackground);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      window.removeEventListener('pagehide', pauseForBackground);

      window.removeEventListener('pageshow', resumeFromBackground);
    };
  }, [play, resolvedSrc, syncPlaybackState]);

  const togglePlayback = async (): Promise<void> => {
    const audio = audioRef.current;

    if (!audio || !resolvedSrc) {
      return;
    }

    if (audio.paused || audio.ended) {
      userPausedRef.current = false;

      const didPlay = await play();

      if (didPlay) {
        wasPlayingBeforeBackgroundRef.current = false;
      }

      syncPlaybackState();

      return;
    }

    /**
     * 사용자가 버튼으로 직접 음악을 멈춘 경우에는
     * 화면 복귀 시 자동으로 다시 재생하지 않습니다.
     */
    userPausedRef.current = true;
    wasPlayingBeforeBackgroundRef.current = false;

    audio.pause();
    syncPlaybackState();
  };

  if (!resolvedSrc) {
    return null;
  }

  return (
    <div
      className={className}
      data-background-music={variant}
      data-playing={isPlaying ? 'true' : 'false'}
    >
      <audio
        key={resolvedSrc}
        ref={audioRef}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0_0_0_0)] [clip-path:inset(50%)]"
        src={resolvedSrc}
        autoPlay={resolvedAutoPlay}
        loop={resolvedLoop}
        preload={resolvedPreload}
        onLoadedMetadata={() => {
          const audio = audioRef.current;

          if (!audio) {
            return;
          }

          audio.muted = false;
          audio.volume = resolvedVolume;

          syncPlaybackState();
        }}
        onCanPlay={() => {
          const audio = audioRef.current;

          syncPlaybackState();

          if (
            document.visibilityState === 'visible' &&
            resolvedAutoPlay &&
            !userPausedRef.current &&
            audio?.paused
          ) {
            void play();
          }
        }}
        onPlay={syncPlaybackState}
        onPlaying={syncPlaybackState}
        onPause={syncPlaybackState}
        onEnded={syncPlaybackState}
        onEmptied={syncPlaybackState}
        onLoadStart={() => {
          setHasError(false);
          syncPlaybackState();
        }}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
      />

      {resolvedShowControl ? (
        <button
          type="button"
          data-background-music-control="true"
          className="fixed top-4.5 right-[max(16px,calc((100vw-448px)/2+16px))] z-60 inline-flex h-10.5 w-10.5 cursor-pointer items-center justify-center rounded-full border border-[rgba(117,102,93,0.25)] bg-white/82 text-lg leading-none text-[#75665d] shadow-[0_4px_16px_rgba(70,54,44,0.12)] backdrop-blur-sm [-webkit-backdrop-filter:blur(8px)] focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-[0.45] motion-reduce:transition-none"
          onClick={() => {
            void togglePlayback();
          }}
          disabled={hasError}
          aria-pressed={isPlaying}
          aria-label={
            hasError
              ? `${config.title} 음원을 불러올 수 없습니다.`
              : isPlaying
                ? `${config.title} 일시정지`
                : `${config.title} 재생`
          }
          title={
            hasError
              ? '음원 파일을 확인해 주세요.'
              : isPlaying
                ? '배경음악 일시정지'
                : '배경음악 재생'
          }
        >
          <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '♪'}</span>
        </button>
      ) : null}
    </div>
  );
}
