'use client';

import Image from 'next/image';
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { GowunDodum } from '../../lib/fonts';
import FadeInUp from '../common/FadeInUp';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

type WeddingGalleryImage = {
  src: string;
  alt: string;
};

type WeddingGalleryProps = {
  title: string;
  images: readonly WeddingGalleryImage[];
};

type PolaroidStyle = CSSProperties & {
  '--polaroid-rotation': string;
};

const POLAROID_ROTATIONS = [
  -3, 2, -2, 3, -2.5, 1.5, -1.5, 2.5, -3.5, 1, -2, 3.5, -1, 2,
];

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 4;
const SWIPE_THRESHOLD = 48;

const POLAROID_ITEM_CLASS_NAME = [
  'relative block m-0 w-full min-w-0 border-0 p-0',
  'cursor-pointer bg-transparent text-inherit',
  'origin-center',
  '[transform:rotate(var(--polaroid-rotation))]',
  'transition-[transform,filter] duration-300 ease-out',
  '[-webkit-tap-highlight-color:transparent]',

  'hover:z-[10]',
  'hover:[transform:rotate(0deg)_translateY(-6px)_scale(1.04)]',
  'hover:drop-shadow-[0_12px_16px_rgb(0_0_0/18%)]',
  'hover:outline-none',

  'focus-visible:z-[10]',
  'focus-visible:[transform:rotate(0deg)_translateY(-6px)_scale(1.04)]',
  'focus-visible:drop-shadow-[0_12px_16px_rgb(0_0_0/18%)]',
  'focus-visible:outline-none',

  'active:[transform:rotate(0deg)_translateY(-2px)_scale(1.01)]',

  'motion-reduce:transition-none',
  'motion-reduce:hover:[transform:rotate(var(--polaroid-rotation))]',
  'motion-reduce:focus-visible:[transform:rotate(var(--polaroid-rotation))]',
  'motion-reduce:active:[transform:rotate(var(--polaroid-rotation))]',
].join(' ');

const LIGHTBOX_BUTTON_CLASS_NAME = [
  'flex m-0 border-0 p-0 items-center justify-center',
  'cursor-pointer bg-transparent text-white',
  '[-webkit-tap-highlight-color:transparent]',
].join(' ');

export default function WeddingGallery({
  title,
  images,
}: WeddingGalleryProps): React.ReactElement {
  const pointerStartXRef = useRef<number | null>(null);

  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const isLightboxOpen = selectedIndex !== null;
  const portalRoot = typeof document === 'undefined' ? null : document.body;

  const galleryImages = useMemo(
    () => [...images],
    [images],
  );

  const visibleGalleryImages = galleryImages.slice(0, visibleCount);
  const hasMoreImages = visibleCount < galleryImages.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((currentCount) =>
      Math.min(currentCount + LOAD_MORE_COUNT, galleryImages.length),
    );
  }, [galleryImages.length]);

  const openLightbox = useCallback((index: number) => {
    setIsLightboxVisible(false);
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxVisible(false);
    setSelectedIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return null;
      }

      return (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    });
  }, [galleryImages.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return null;
      }

      return (currentIndex + 1) % galleryImages.length;
    });
  }, [galleryImages.length]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsLightboxVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [selectedIndex]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    const previousHtmlOverflow = htmlStyle.overflow;
    const previousHtmlOverscrollBehavior = htmlStyle.overscrollBehavior;
    const previousOverflow = bodyStyle.overflow;
    const previousOverscrollBehavior = bodyStyle.overscrollBehavior;
    const previousTouchAction = bodyStyle.touchAction;
    const previousPosition = bodyStyle.position;
    const previousTop = bodyStyle.top;
    const previousWidth = bodyStyle.width;

    htmlStyle.overflow = 'hidden';
    htmlStyle.overscrollBehavior = 'none';

    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = '100%';
    bodyStyle.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.touchAction = 'none';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        showPrevious();
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      htmlStyle.overflow = previousHtmlOverflow;
      htmlStyle.overscrollBehavior = previousHtmlOverscrollBehavior;

      bodyStyle.position = previousPosition;
      bodyStyle.top = previousTop;
      bodyStyle.width = previousWidth;
      bodyStyle.overflow = previousOverflow;
      bodyStyle.overscrollBehavior = previousOverscrollBehavior;
      bodyStyle.touchAction = previousTouchAction;

      window.removeEventListener('keydown', handleKeyDown);

      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          left: 0,
          behavior: 'auto',
        });
      });
    };
  }, [closeLightbox, isLightboxOpen, showNext, showPrevious]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    pointerStartXRef.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const pointerStartX = pointerStartXRef.current;

    pointerStartXRef.current = null;

    if (pointerStartX === null) {
      return;
    }

    const distance = event.clientX - pointerStartX;

    if (Math.abs(distance) < SWIPE_THRESHOLD) {
      return;
    }

    if (distance > 0) {
      showPrevious();
      return;
    }

    showNext();
  };

  const selectedImage =
    selectedIndex === null ? null : galleryImages[selectedIndex];

  const lightbox =
    portalRoot && selectedImage && selectedIndex !== null
      ? createPortal(
          <div
            className={`fixed inset-0 z-9999 flex h-dvh w-screen touch-none select-none items-center justify-center overflow-hidden bg-[rgb(24_24_24/88%)] px-5 py-5 opacity-0 backdrop-blur-[5px] overscroll-none [-webkit-tap-highlight-color:transparent] transition-opacity duration-240 ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
              isLightboxVisible ? 'opacity-100' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedImage.alt} 크게 보기`}
            onClick={closeLightbox}
            onDoubleClick={(event) => event.preventDefault()}
            onContextMenu={(event) => event.preventDefault()}
          >
            <button
              className={`${LIGHTBOX_BUTTON_CLASS_NAME} absolute top-[max(17px,env(safe-area-inset-top))] right-4.5 z-2 size-9.5`}
              type="button"
              onClick={closeLightbox}
              aria-label="갤러리 닫기"
            >
              <CloseIcon />
            </button>

            <div
              className={`relative flex max-h-[calc(100dvh-96px)] w-[min(90vw,calc((100dvh-120px)*0.75),620px)] scale-[0.96] touch-none items-center justify-center opacity-0 transition-[opacity,transform] duration-280 ease-out motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none ${
                isLightboxVisible ? 'scale-100 opacity-100' : ''
              }`}
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.preventDefault()}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              {galleryImages.length > 1 ? (
                <button
                  className={`${LIGHTBOX_BUTTON_CLASS_NAME} absolute top-1/2 -left-14.5 z-2 h-14.5 w-10.5 -translate-y-1/2 max-[640px]:left-2`}
                  type="button"
                  onClick={showPrevious}
                  aria-label="이전 이미지"
                >
                  <ChevronIcon direction="previous" />
                </button>
              ) : null}

              <div className="w-full -rotate-1 bg-white px-2.5 pt-2.5 pb-0 shadow-[0_18px_48px_rgb(0_0_0/34%)]">
                <div className="relative aspect-3/4 w-full overflow-hidden bg-[#e9e8e6]">
                  <Image
                    key={selectedImage.src}
                    className="pointer-events-none object-cover object-center select-none [-webkit-user-drag:none]"
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, 620px"
                    loading="eager"
                    unoptimized
                    draggable={false}
                  />
                </div>

                <div className="h-8.5 bg-white" aria-hidden="true" />
              </div>

              {galleryImages.length > 1 ? (
                <button
                  className={`${LIGHTBOX_BUTTON_CLASS_NAME} absolute top-1/2 -right-14.5 z-2 h-14.5 w-10.5 -translate-y-1/2 max-[640px]:right-2`}
                  type="button"
                  onClick={showNext}
                  aria-label="다음 이미지"
                >
                  <ChevronIcon direction="next" />
                </button>
              ) : null}

              <span
                className="absolute top-[calc(100%+17px)] left-1/2 -translate-x-1/2 leading-none font-medium tracking-[0.08em] text-white/86"
                aria-live="polite"
              >
                {selectedIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </div>,
          portalRoot,
        )
      : null;

  return (
    <>
      <section
        className={`m-0 box-border flex w-full flex-col items-center overflow-hidden px-5 pt-14 pb-14 ${GowunDodum.className}`}
        aria-labelledby="wedding-gallery-title"
      >
        <WeddingSectionHeader
          id="wedding-gallery-title"
          title={title}
          className="mb-8.5 space-y-5"
        />

        <div className="box-border w-full">
          <div className="grid w-full grid-cols-2 items-start gap-x-5 gap-y-6.5">
            {visibleGalleryImages.map((image, index) => {
              const itemStyle: PolaroidStyle = {
                '--polaroid-rotation': `${
                  POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length]
                }deg`,
              };

              return (
                <FadeInUp key={`${image.src}-${index}`}>
                  <button
                    className={POLAROID_ITEM_CLASS_NAME}
                    style={itemStyle}
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`${image.alt} 크게 보기`}
                  >
                    <span className="box-border block w-full bg-white px-2 pt-2 pb-0 shadow-[0_2px_7px_rgb(0_0_0/10%),0_1px_2px_rgb(0_0_0/7%)]">
                      <span className="relative block aspect-3/4 w-full overflow-hidden bg-[#e9e8e6]">
                        <Image
                          className="object-cover object-center select-none [-webkit-user-drag:none]"
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 448px) 42vw, 176px"
                          loading="lazy"
                          draggable={false}
                        />
                      </span>

                      <span
                        className="block h-6.25 w-full bg-white"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </FadeInUp>
              );
            })}
          </div>

          {hasMoreImages ? (
            <FadeInUp>
              <button
                type="button"
                className="mx-auto mt-10 w-full block cursor-pointer rounded-md border border-[#d8d6d2] bg-white px-6 py-3 text-base text-[#555555] transition-colors duration-200 hover:bg-[#f4f3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#999999]/40"
                onClick={handleLoadMore}
              >
                <span>더 보기</span>
              </button>
            </FadeInUp>
          ) : null}
        </div>
      </section>

      {lightbox}
    </>
  );
}

function CloseIcon(): React.ReactElement {
  return (
    <svg
      className="size-6.5 fill-none stroke-current [stroke-linecap:round] stroke-[1.7]"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

function ChevronIcon({
  direction,
}: {
  direction: 'previous' | 'next';
}): React.ReactElement {
  return (
    <svg
      className="size-6.75 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.6]"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d={direction === 'previous' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
    </svg>
  );
}
