'use client';

import { X } from 'lucide-react';
import {
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

type OpeningVideoProps = {
  src?: string;
  shouldPlay: boolean;
  isActive: boolean;
  onFinish: () => void;
};

function blockMediaInteraction(event: SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

export default function OpeningVideo({
  src = '/images/signoff/signoff.mp4',
  shouldPlay,
  isActive,
  onFinish,
}: OpeningVideoProps): React.ReactElement | null {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasFinishedRef = useRef(false);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const portalRoot = isMounted ? document.body : null;
  const isVideoInteractive = shouldPlay || isActive;

  const finishVideo = useCallback((): void => {
    if (hasFinishedRef.current) {
      return;
    }

    hasFinishedRef.current = true;

    const video = videoRef.current;

    if (video) {
      video.pause();
    }

    onFinish();
  }, [onFinish]);

  const handleVideoClick = (event: ReactMouseEvent<HTMLVideoElement>): void => {
    event.stopPropagation();
  };

  const handleCloseButtonClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
  ): void => {
    event.stopPropagation();
    finishVideo();
  };


  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const video = videoRef.current;
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    const previousHtmlOverflow = htmlStyle.overflow;
    const previousHtmlOverscrollBehavior = htmlStyle.overscrollBehavior;

    const previousBodyOverflow = bodyStyle.overflow;
    const previousBodyOverscrollBehavior = bodyStyle.overscrollBehavior;
    const previousBodyTouchAction = bodyStyle.touchAction;

    htmlStyle.overflow = 'hidden';
    htmlStyle.overscrollBehavior = 'none';

    bodyStyle.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.touchAction = 'none';

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isVideoInteractive) {
        finishVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      htmlStyle.overflow = previousHtmlOverflow;
      htmlStyle.overscrollBehavior = previousHtmlOverscrollBehavior;

      bodyStyle.overflow = previousBodyOverflow;
      bodyStyle.overscrollBehavior = previousBodyOverscrollBehavior;
      bodyStyle.touchAction = previousBodyTouchAction;

      window.removeEventListener('keydown', handleKeyDown);

      video?.pause();
    };
  }, [finishVideo, isMounted, isVideoInteractive]);

  useEffect(() => {
    if (!shouldPlay) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    hasFinishedRef.current = false;
    video.currentTime = 0;

    void video.play().catch(() => {
      // 브라우저의 자동 재생 정책으로 재생이 차단될 수 있습니다.
      // muted 및 playsInline 설정으로 대부분의 모바일 환경에서는
      // 자동 재생이 허용됩니다.
    });
  }, [shouldPlay]);

  if (!isMounted || !portalRoot) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-9998 flex h-dvh w-screen items-center justify-center overflow-hidden bg-black select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] ${
        isVideoInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role={isVideoInteractive ? 'dialog' : undefined}
      aria-modal={isVideoInteractive ? true : undefined}
      aria-label={isVideoInteractive ? '웨딩 인트로 영상' : undefined}
      aria-hidden={!isVideoInteractive}
      onClick={isVideoInteractive ? finishVideo : undefined}
      onContextMenu={blockMediaInteraction}
    >
      <video
        ref={videoRef}
        className="block h-auto max-h-dvh w-auto max-w-screen select-none object-contain [-webkit-user-drag:none] [-webkit-touch-callout:none]"
        src={src}
        muted
        playsInline
        controls={false}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate nofullscreen"
        draggable={false}
        tabIndex={-1}
        aria-hidden="true"
        onClick={handleVideoClick}
        onEnded={finishVideo}
        onError={finishVideo}
        onDoubleClick={blockMediaInteraction}
        onDragStart={blockMediaInteraction}
      />

      {shouldPlay ? (
        <button
          type="button"
          className="absolute top-[max(16px,env(safe-area-inset-top))] right-[max(16px,env(safe-area-inset-right))] z-10 flex size-11 cursor-pointer items-center justify-center rounded-full border border-white bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          onClick={handleCloseButtonClick}
          aria-label="인트로 영상 닫기"
        >
          <X size={26} aria-hidden="true" />
        </button>
      ) : null}
    </div>,
    portalRoot,
  );
}
