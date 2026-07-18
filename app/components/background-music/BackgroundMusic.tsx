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
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
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

  const play = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !resolvedSrc) {
      return false;
    }

    try {
      await audio.play();
      setHasError(false);
      return true;
    } catch {
      return false;
    }
  }, [resolvedSrc]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = resolvedVolume;
  }, [resolvedVolume]);

  useEffect(() => {
    if (!resolvedSrc || !resolvedAutoPlay) {
      return;
    }

    let disposed = false;

    const tryInitialPlay = async () => {
      const didPlay = await play();

      if (disposed || didPlay || !resolvedStartOnFirstInteraction) {
        return;
      }

      const playFromInteraction = () => {
        void play();
        removeInteractionListeners();
      };

      const removeInteractionListeners = () => {
        window.removeEventListener('pointerdown', playFromInteraction);
        window.removeEventListener('keydown', playFromInteraction);
      };

      window.addEventListener('pointerdown', playFromInteraction, {
        once: true,
      });
      window.addEventListener('keydown', playFromInteraction, { once: true });

      cleanupInteractionListeners = removeInteractionListeners;
    };

    let cleanupInteractionListeners = () => {};
    void tryInitialPlay();

    return () => {
      disposed = true;
      cleanupInteractionListeners();
    };
  }, [play, resolvedAutoPlay, resolvedSrc, resolvedStartOnFirstInteraction]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio || !resolvedSrc) {
      return;
    }

    if (audio.paused) {
      await play();
      return;
    }

    audio.pause();
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
        onLoadStart={() => {
          setHasError(false);
          setIsPlaying(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
      />

      {resolvedShowControl ? (
        <button
          type="button"
          className="fixed bottom-4.5 z-60 inline-flex h-10.5 w-10.5 cursor-pointer items-center justify-center rounded-full border border-[rgba(117,102,93,0.25)] bg-white/82 text-lg leading-none text-[#75665d] shadow-[0_4px_16px_rgba(70,54,44,0.12)] backdrop-blur-sm right-[max(16px,calc((100vw-448px)/2+16px))] [-webkit-backdrop-filter:blur(8px)] focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-[0.45] motion-reduce:transition-none"
          onClick={() => void togglePlayback()}
          disabled={hasError}
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
