'use client';

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import Image from 'next/image';
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import WeddingSectionHeader from '../common/WeddingSectionHeader';
import { GowunDodum } from '../../lib/fonts';

type WeddingGalleryImage = {
  src: string;
  alt: string;
};

type WeddingGalleryProps = {
  title?: string;
  images?: readonly WeddingGalleryImage[];
};

type PolaroidStyle = CSSProperties & {
  '--polaroid-rotation': string;
};

const DEFAULT_IMAGES: readonly WeddingGalleryImage[] = [
  { src: '/images/gallery/1.png', alt: '웨딩 갤러리 이미지 1' },
  { src: '/images/gallery/2.png', alt: '웨딩 갤러리 이미지 2' },
  { src: '/images/gallery/3.png', alt: '웨딩 갤러리 이미지 3' },
  { src: '/images/gallery/4.png', alt: '웨딩 갤러리 이미지 4' },
  { src: '/images/gallery/5.png', alt: '웨딩 갤러리 이미지 5' },
  { src: '/images/gallery/6.png', alt: '웨딩 갤러리 이미지 6' },
  { src: '/images/gallery/7.png', alt: '웨딩 갤러리 이미지 7' },
  { src: '/images/gallery/8.png', alt: '웨딩 갤러리 이미지 8' },
  { src: '/images/gallery/9.png', alt: '웨딩 갤러리 이미지 9' },
  { src: '/images/gallery/10.png', alt: '웨딩 갤러리 이미지 10' },
  { src: '/images/gallery/11.png', alt: '웨딩 갤러리 이미지 11' },
  { src: '/images/gallery/12.png', alt: '웨딩 갤러리 이미지 12' },
  { src: '/images/gallery/13.png', alt: '웨딩 갤러리 이미지 13' },
  { src: '/images/gallery/14.png', alt: '웨딩 갤러리 이미지 14' },
  { src: '/images/gallery/15.png', alt: '웨딩 갤러리 이미지 15' },
  { src: '/images/gallery/16.png', alt: '웨딩 갤러리 이미지 16' },
  { src: '/images/gallery/17.png', alt: '웨딩 갤러리 이미지 17' },
  { src: '/images/gallery/18.png', alt: '웨딩 갤러리 이미지 18' },
];

const POLAROID_ROTATIONS = [
  -3, 2, -2, 3, -2.5, 1.5, -1.5, 2.5, -3.5, 1, -2, 3.5, -1, 2, -3, 1.5, -2.5,
  2.5,
];
const SWIPE_THRESHOLD = 48;

const POLAROID_ITEM_CLASS_NAME = [
  'block w-full min-w-0 m-0 border-0 p-0',
  'cursor-pointer bg-transparent text-inherit',
  'origin-center rotate-[var(--polaroid-rotation)]',
  'transition-[transform,filter] duration-250',
  '[-webkit-tap-highlight-color:transparent]',
  'hover:z-[2] hover:-translate-y-1 hover:scale-[1.018] hover:outline-none',
  'hover:drop-shadow-[0_8px_10px_rgb(0_0_0/11%)]',
  'focus-visible:z-[2] focus-visible:-translate-y-1 focus-visible:scale-[1.018]',
  'focus-visible:outline-none focus-visible:drop-shadow-[0_8px_10px_rgb(0_0_0/11%)]',
  'active:-translate-y-px active:scale-[0.99]',
  'motion-reduce:[transition:none]',
  'motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100',
  'motion-reduce:focus-visible:translate-y-0 motion-reduce:focus-visible:scale-100',
  'motion-reduce:active:translate-y-0 motion-reduce:active:scale-100',
].join(' ');

const LIGHTBOX_BUTTON_CLASS_NAME = [
  'flex m-0 border-0 p-0 items-center justify-center',
  'cursor-pointer bg-transparent text-white',
  '[-webkit-tap-highlight-color:transparent]',
].join(' ');

type GalleryMotionItemProps = {
  index: number;
  containerRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  children: ReactNode;
};

function GalleryMotionItem({
  index,
  containerRef,
  progress,
  children,
}: GalleryMotionItemProps): React.ReactElement {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [range, setRange] = useState({
    start: 0,
    end: 1,
  });

  useEffect(() => {
    const containerElement = containerRef.current;
    const itemElement = itemRef.current;

    if (!containerElement || !itemElement) {
      return;
    }

    const calculateRange = (): void => {
      const containerRect = containerElement.getBoundingClientRect();
      const itemRect = itemElement.getBoundingClientRect();
      const containerHeight = containerRect.height || 1;

      const itemTop = itemRect.top - containerRect.top;
      const itemBottom = itemRect.bottom - containerRect.top;

      const start = Math.max(0, Math.min(1, itemTop / containerHeight - 0.12));

      const end = Math.max(0, Math.min(1, itemBottom / containerHeight - 0.04));

      setRange({
        start,
        end: Math.max(start + 0.01, end),
      });
    };

    calculateRange();

    const resizeObserver = new ResizeObserver(calculateRange);

    resizeObserver.observe(containerElement);
    resizeObserver.observe(itemElement);
    window.addEventListener('resize', calculateRange);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateRange);
    };
  }, [containerRef]);

  const isLeft = index % 2 === 0;

  const opacity = useTransform(progress, [range.start, range.end], [0, 1]);

  const x = useTransform(
    progress,
    [range.start, range.end],
    [isLeft ? -50 : 50, 0],
  );

  const y = useTransform(progress, [range.start, range.end], [50, 0]);

  return (
    <motion.div
      ref={itemRef}
      className="w-full min-w-0 will-change-transform"
      style={{ opacity, x, y }}
    >
      {children}
    </motion.div>
  );
}

export default function WeddingGallery({
  title = '웨딩 갤러리',
  images = DEFAULT_IMAGES,
}: WeddingGalleryProps): React.ReactElement {
  const pointerStartXRef = useRef<number | null>(null);
  const galleryContainerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: galleryContainerRef,
    offset: ['start center', 'end center'],
  });

  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const portalRoot = typeof document === 'undefined' ? null : document.body;

  const galleryImages = useMemo(
    () => (images.length > 0 ? [...images] : [...DEFAULT_IMAGES]),
    [images],
  );

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

    return () => window.cancelAnimationFrame(animationFrame);
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.touchAction = 'none';

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventZoomWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    };

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
    document.addEventListener('gesturestart', preventGesture, {
      passive: false,
    });
    document.addEventListener('gesturechange', preventGesture, {
      passive: false,
    });
    document.addEventListener('gestureend', preventGesture, {
      passive: false,
    });
    document.addEventListener('touchmove', preventMultiTouch, {
      passive: false,
    });
    document.addEventListener('touchstart', preventMultiTouch, {
      passive: false,
    });
    window.addEventListener('wheel', preventZoomWheel, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchmove', preventMultiTouch);
      document.removeEventListener('touchstart', preventMultiTouch);
      window.removeEventListener('wheel', preventZoomWheel);
    };
  }, [closeLightbox, selectedIndex, showNext, showPrevious]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartXRef.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
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
                    className="pointer-events-none object-cover object-center select-none [-webkit-user-drag:none]"
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, 620px"
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
        className={`m-0 box-border flex w-full flex-col items-center px-5 pt-14 pb-14 text-[#333333] bg-[#f4f3f1] ${GowunDodum.className} overflow-hidden`}
        aria-labelledby="wedding-gallery-title"
      >
        <WeddingSectionHeader
          id="wedding-gallery-title"
          title={title}
          className="mb-8.5"
        />

        <div ref={galleryContainerRef} className="w-full box-border">
          <div className="grid w-full grid-cols-2 items-start gap-x-5 gap-y-6.5">
            {galleryImages.map((image, index) => {
              const itemStyle: PolaroidStyle = {
                '--polaroid-rotation': `${
                  POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length]
                }deg`,
              };

              return (
                <GalleryMotionItem
                  key={`${image.src}-${index}`}
                  index={index}
                  containerRef={galleryContainerRef}
                  progress={scrollYProgress}
                >
                  <button
                    className={POLAROID_ITEM_CLASS_NAME}
                    style={itemStyle}
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`${image.alt} 크게 보기`}
                  >
                    <span className="block w-full box-border bg-white px-2 pt-2 pb-0 shadow-[0_2px_7px_rgb(0_0_0/10%),0_1px_2px_rgb(0_0_0/7%)]">
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
                </GalleryMotionItem>
              );
            })}
          </div>
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
