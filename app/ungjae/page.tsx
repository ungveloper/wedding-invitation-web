'use client';

import BackgroundMusic from '@/app/components/background-music/BackgroundMusic';
import FadeInUp from '@/app/components/common/FadeInUp';
import WeddingRibbon from '@/app/components/common/WeddingRibbon';
import WeddingSectionHeader from '@/app/components/common/WeddingSectionHeader';
import WeddingCalendar from '@/app/components/wedding-calendar/WeddingCalendar';
import WeddingGallery from '@/app/components/wedding-gallery/WeddingGallery';
import { GowunDodum } from '@/app/lib/fonts';
import { Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';

type Account = {
  id: string;
  role: string;
  holder: string;
  bank: string;
  accountNumber: string;
};

type KakaoWebLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoFeedTemplate = {
  objectType: 'feed';
  content: {
    title: string;
    description?: string;
    imageUrl: string;
    link: KakaoWebLink;
  };
  buttons?: {
    title: string;
    link: KakaoWebLink;
  }[];
};

type KakaoSdk = {
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (template: KakaoFeedTemplate) => void;
  };
};

type KakaoLatLng = object;

type KakaoMapInstance = {
  setCenter: (position: KakaoLatLng) => void;
  relayout: () => void;
  getLevel: () => number;
  setLevel: (
    level: number,
    options?: {
      animate?: boolean | number;
    },
  ) => void;
};

type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

type KakaoMapsNamespace = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => KakaoMapInstance;
  Marker: new (options: Record<string, unknown>) => KakaoMarkerInstance;
};

type KakaoWindow = Window & {
  /**
   * 카카오 공유 SDK
   */
  Kakao?: KakaoSdk;

  /**
   * 카카오 지도 SDK
   */
  kakao?: {
    maps: KakaoMapsNamespace;
  };
};

type MapStatus = 'loading' | 'ready' | 'error';

const DEFAULT_KAKAO_JAVASCRIPT_KEY = '310d015109a750e6c26da3906be21d48';

const KAKAO_JAVASCRIPT_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? DEFAULT_KAKAO_JAVASCRIPT_KEY;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

const invitationUrl = `${siteUrl}/ungjae`;

/**
 * /ungjae 페이지에서만 사용하는 하드코딩 데이터입니다.
 *
 * DB, Firestore, API 요청을 사용하지 않습니다.
 */
const couple = {
  groom: {
    name: '웅재',
    fullName: '지웅재',
    fatherName: '지정호',
    motherName: '박순영',
    relationLabel: '아들',
  },
  bride: {
    name: '혜정',
    fullName: '송혜정',
    fatherName: '송종무',
    motherName: '지경화',
    relationLabel: '딸',
  },
};

const event = {
  dateTime: '2026-09-20T12:00:00+09:00',
  dateLabel: '2026년 9월 20일',
  month: 9,
  day: 20,
  dayOfWeek: '일요일',
  timeLabel: '오후 12시',
  venueName: 'W웨딩 국민연금웨딩홀',
  hallName: '3층 에메랄드홀',
  address: '부산 연제구 중앙대로 1000',
  latitude: 35.1778497,
  longitude: 129.0756194,
};

const content = {
  backgroundMusic: {
    variant: 'wedding' as const,
    src: '/audio/background-music/mother_to_daughter.mp3',
    autoPlay: true,
    loop: true,
    volume: 1,
    preload: 'auto' as const,
    startOnFirstInteraction: true,
    showControl: true,
  },

  cover: {
    photoSrc: '/images/cover/heart-frame-photo.png',
    statement: 'Our wedding day',
    date: 'on September 20, 2026',
    groomLabel: 'Groom',
    brideLabel: 'Bride',
  },

  greeting: {
    quote: '“당신은 내가 더 좋은 사람이 되고 싶게 만들어요.”',
    quoteSource: '- 영화 〈이보다 더 좋을 순 없다〉 -',
    messages: [
      '세상에 하나뿐인',
      '우리 아들이 결혼합니다.',
      '두 사람의 행복한 앞날을',
      '함께 축하해 주세요.',
    ],
    family: {
      groomParentsLabel: '신랑',
      brideParentsLabel: '혼주',
    },
  },

  calendar: {
    enabled: true,
  },

  gallery: {
    title: '웨딩 갤러리',
    images: [
      {
        src: '/images/gallery/1.png',
        alt: '웨딩 갤러리 이미지 1',
      },
      {
        src: '/images/gallery/2.png',
        alt: '웨딩 갤러리 이미지 2',
      },
      {
        src: '/images/gallery/3.png',
        alt: '웨딩 갤러리 이미지 3',
      },
      {
        src: '/images/gallery/4.png',
        alt: '웨딩 갤러리 이미지 4',
      },
      {
        src: '/images/gallery/5.png',
        alt: '웨딩 갤러리 이미지 5',
      },
      {
        src: '/images/gallery/6.png',
        alt: '웨딩 갤러리 이미지 6',
      },
      {
        src: '/images/gallery/7.png',
        alt: '웨딩 갤러리 이미지 7',
      },
      {
        src: '/images/gallery/8.png',
        alt: '웨딩 갤러리 이미지 8',
      },
      {
        src: '/images/gallery/9.png',
        alt: '웨딩 갤러리 이미지 9',
      },
      {
        src: '/images/gallery/10.png',
        alt: '웨딩 갤러리 이미지 10',
      },
      {
        src: '/images/gallery/11.png',
        alt: '웨딩 갤러리 이미지 11',
      },
      {
        src: '/images/gallery/12.png',
        alt: '웨딩 갤러리 이미지 12',
      },
      {
        src: '/images/gallery/13.png',
        alt: '웨딩 갤러리 이미지 13',
      },
      {
        src: '/images/gallery/14.png',
        alt: '웨딩 갤러리 이미지 14',
      },
    ],
  },

  location: {
    title: '오시는 길',
    mapLinks: [
      {
        id: 'naver',
        name: '네이버지도',
        href: 'https://map.naver.com/p/directions/-/3AHG0P,2z9P1f,W%EC%9B%A8%EB%94%A9%20%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EC%9B%A8%EB%94%A9%ED%99%80,11881122,PLACE_POI/-/transit?c=15.00,0,0,0,dh',
        imageSrc: '/images/location/navermap.png',
        imageAlt: '네이버지도',
      },
      {
        id: 'kakao',
        name: '카카오맵',
        href: 'https://map.kakao.com/?map_type=TYPE_MAP&target=car&rt=,,972685.000000339,471972.00000000885&rt1=&rt2=W%EC%9B%A8%EB%94%A9%20%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EC%9B%A8%EB%94%A9%ED%99%80&rtIds=,11097221',
        imageSrc: '/images/location/kakaomap.png',
        imageAlt: '카카오맵',
      },
      {
        id: 'tmap',
        name: '티맵',
        href: 'https://apis.openapi.sk.com/tmap/app/routes?appKey=TJfHFoG4TQ3L1V2DNZ1Vj2sVFVVIvOWU6GlF3Oon&name=W웨딩국민연금웨딩홀&lon=129.0756194&lat=35.1778497',
        imageSrc: '/images/location/tmap.png',
        imageAlt: '티맵',
      },
      {
        id: 'google',
        name: '구글맵',
        href: 'https://www.google.co.kr/maps/dir//%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C+%EC%97%B0%EC%A0%9C%EA%B5%AC+%EC%A4%91%EC%95%99%EB%8C%80%EB%A1%9C+1000+W%EC%9B%A8%EB%94%A9+%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EC%9B%A8%EB%94%A9%ED%99%80/data=!4m16!1m7!3m6!1s0x35689354a2ad7b81:0x8dccda5788b92fb1!2zV-ybqOuUqSDqta3rr7zsl7DquIjsm6jrlKntmYA!8m2!3d35.1779992!4d129.0757805!16s%2Fg%2F1vcq5gx3!4m7!1m0!1m5!1m1!1s0x35689354a2ad7b81:0x8dccda5788b92fb1!2m2!1d129.0757805!2d35.1779992?entry=ttu',
        imageSrc: '/images/location/googlemap.png',
        imageAlt: '구글맵',
      },
    ],
  },

  accounts: {
    enabled: true,
    title: '마음 전하실 곳',
    groomSectionTitle: '신랑측 계좌번호',

    groom: [
      {
        id: 'groom-mother',
        role: '카카오뱅크 박순영',
        accountNumber: '3333-21-0312583',
        bank: '',
        holder: '',
      },
    ] satisfies Account[],
  },

  signoff: {
    imageSrc: '/images/signoff/bowing.png',
    imageAlt: '신랑과 신부가 인사하는 모습',
    kakaoTitle: '저희 두 사람 결혼합니다!',
    kakaoDescription: '소중한 분들을 저희의 시작에 초대합니다.',
    kakaoImage: '/images/signoff/bowing.png',
    kakaoButtonLabel: '모바일 청첩장 보기',
    shareButtonLabel: '카카오톡 공유하기',
    copyButtonLabel: '청첩장 링크 복사하기',
  },
};

function blockMediaInteraction(event: SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * 기존 Greeting을 사용하지 않는 이유:
 * 기존 Greeting 내부에는 HeartImage가 고정으로 포함되어 있습니다.
 *
 * 이 페이지 전용 인사말에는 하트 이미지를 아예 렌더링하지 않습니다.
 */
function UngjaeGreeting(): React.ReactElement {
  const { greeting } = content;

  return (
    <section
      className={`mt-10 flex flex-col items-center ${GowunDodum.className}`}
    >
      <FadeInUp>
        <WeddingRibbon />
      </FadeInUp>

      <FadeInUp>
        <div className="mt-5 w-full space-y-1.5 px-5 text-center text-xl">
          {greeting.messages.map((message, index) => (
            <p key={`${message}-${index}`}>{message}</p>
          ))}
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="mx-auto mt-10 mb-20 w-[66.6%] border-y border-y-gray-200 py-5">
          <div className="grid grid-cols-[auto_auto] items-center justify-center gap-x-4 gap-y-3 text-xl">
            <p className="justify-self-center">신랑</p>
            <p>지웅재</p>

            <p className="justify-self-center">혼주</p>
            <p>박순영</p>
          </div>
        </div>
      </FadeInUp>
    </section>
  );
}

/**
 * 신랑 측 계좌만 표시합니다.
 *
 * 아코디언 버튼과 useState가 없으므로 항상 펼쳐진 상태입니다.
 */
function UngjaeAccounts(): React.ReactElement {
  const { accounts } = content;

  return (
    <section
      className="relative box-border flex w-full flex-col items-center px-5 py-10"
      aria-labelledby="ungjae-accounts-title"
    >
      <WeddingSectionHeader
        id="ungjae-accounts-title"
        className="space-y-5"
        title={accounts.title}
      />

      <ul className="mt-8.5 flex w-full list-none flex-col gap-4 p-0">
        <FadeInUp>
          <li className={`w-full overflow-hidden ${GowunDodum.className}`}>
            <div className="flex min-h-13.5 w-full items-center bg-[#f1f0ee] px-4.25 tracking-[-0.04em]">
              <span>{accounts.groomSectionTitle}</span>
            </div>

            <div className="px-4 pb-4">
              {accounts.groom.map((account) => {
                const copyValue = `${account.bank} ${account.accountNumber}`;

                return (
                  <article
                    key={account.id}
                    className="flex w-full items-center justify-between gap-4 py-4 [&+&]:border-t [&+&]:border-[#e4e2df]"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="block text-lg tracking-[-0.045em]">
                        {account.accountNumber}
                      </span>

                      <span className="mt-1.5 block break-all leading-normal tracking-tight">
                        {account.role}
                      </span>
                    </div>

                    <CopyToClipboard
                      text={copyValue}
                      onCopy={(_, copied) => {
                        if (copied) {
                          toast.success('은행명과 계좌번호가 복사되었습니다.');
                          return;
                        }

                        toast.error('복사에 실패했습니다.');
                      }}
                    >
                      <button
                        type="button"
                        className="m-0 shrink-0 cursor-pointer whitespace-nowrap rounded-md border border-[#d7d4d0] bg-[#f1f0ed] px-3 py-1 text-[#555555]"
                        aria-label={`${account.role} ${account.bank} ${account.accountNumber} 복사`}
                      >
                        복사하기
                      </button>
                    </CopyToClipboard>
                  </article>
                );
              })}
            </div>
          </li>
        </FadeInUp>
      </ul>
    </section>
  );
}

/**
 * /ungjae 전용 오시는 길 영역입니다.
 *
 * 공용 WeddingLocation 컴포넌트를 사용하지 않고
 * 이 파일에 하드코딩된 event와 content.location 값을 직접 사용합니다.
 */
function UngjaeLocation(): React.ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);

  const [mapStatus, setMapStatus] = useState<MapStatus>(
    KAKAO_JAVASCRIPT_KEY ? 'loading' : 'error',
  );

  const { venueName, hallName, address, latitude, longitude } = event;

  const { title, mapLinks } = content.location;

  const handleKakaoMapScriptReady = (): void => {
    const maps = (window as KakaoWindow).kakao?.maps;

    if (!maps) {
      setMapStatus('error');
      return;
    }

    maps.load(() => {
      setMapStatus('ready');
    });
  };

  const handleZoomIn = (): void => {
    const map = mapInstanceRef.current;

    if (!map) {
      return;
    }

    const nextLevel = Math.max(1, map.getLevel() - 1);

    map.setLevel(nextLevel, {
      animate: 200,
    });
  };

  const handleZoomOut = (): void => {
    const map = mapInstanceRef.current;

    if (!map) {
      return;
    }

    const nextLevel = Math.min(14, map.getLevel() + 1);

    map.setLevel(nextLevel, {
      animate: 200,
    });
  };

  useEffect(() => {
    if (mapStatus !== 'ready' || !mapContainerRef.current) {
      return;
    }

    const maps = (window as KakaoWindow).kakao?.maps;

    if (!maps) {
      setMapStatus('error');
      return;
    }

    const center = new maps.LatLng(latitude, longitude);

    const map = new maps.Map(mapContainerRef.current, {
      center,
      level: 3,
      draggable: false,
      scrollwheel: false,
      disableDoubleClick: true,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
    });

    mapInstanceRef.current = map;

    const marker = new maps.Marker({
      position: center,
      map,
      title: venueName,
    });

    const resizeMap = (): void => {
      map.relayout();
      map.setCenter(center);
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(resizeMap);

    resizeObserver?.observe(mapContainerRef.current);

    window.addEventListener('resize', resizeMap);

    return () => {
      resizeObserver?.disconnect();

      window.removeEventListener('resize', resizeMap);

      marker.setMap(null);

      if (mapInstanceRef.current === map) {
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, mapStatus, venueName]);

  const encodedVenueName = encodeURIComponent(venueName);

  const kakaoMapUrl =
    `https://map.kakao.com/link/map/` +
    `${encodedVenueName},${latitude},${longitude}`;

  return (
    <section
      className={`${GowunDodum.className} flex w-full flex-col items-center bg-[#f4f3f1] px-5 pt-12 pb-14`}
      aria-labelledby="ungjae-location-title"
    >
      {KAKAO_JAVASCRIPT_KEY ? (
        <Script
          id="ungjae-kakao-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
            KAKAO_JAVASCRIPT_KEY,
          )}&autoload=false`}
          strategy="afterInteractive"
          onReady={handleKakaoMapScriptReady}
          onError={() => {
            setMapStatus('error');
          }}
        />
      ) : null}

      <WeddingSectionHeader
        id="ungjae-location-title"
        className="space-y-5"
        title={title}
      />

      <FadeInUp>
        <div className="mt-6.75 flex flex-col items-center gap-0.5 text-center">
          <p className="m-0 text-lg leading-[1.65] tracking-[-0.04em]">
            {venueName}
          </p>

          <p className="m-0 text-lg leading-[1.65] tracking-[-0.04em]">
            {hallName}
          </p>
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="relative mt-3.5 flex items-center justify-center gap-1.25">
          <p className="m-0 text-lg font-normal leading-[1.65] tracking-[-0.04em]">
            {address}
          </p>

          <CopyToClipboard
            text={address}
            onCopy={(_, copied) => {
              if (copied) {
                toast.success('주소가 복사되었습니다.');
                return;
              }

              toast.error('복사에 실패했습니다.');
            }}
          >
            <button
              type="button"
              className="m-0 flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#777777] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-[1.45]"
              aria-label="식장 주소 복사"
            >
              <Copy />
            </button>
          </CopyToClipboard>
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="relative mt-7 w-full overflow-hidden">
          <FadeInUp>
            <div className="relative aspect-366/294 w-full overflow-hidden rounded-md border border-gray-200 bg-[#ecebea]">
              <div
                ref={mapContainerRef}
                className="pointer-events-none absolute inset-0 touch-pan-y"
                aria-label={`${venueName} 카카오맵`}
              />

              {mapStatus === 'ready' ? (
                <div
                  className="pointer-events-auto absolute top-1/2 right-2 z-10 flex -translate-y-1/2 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
                  role="group"
                  aria-label="지도 확대 및 축소"
                >
                  <button
                    type="button"
                    className="flex h-9 w-9 touch-manipulation items-center justify-center border-0 border-b border-gray-200 bg-white p-0 text-xl leading-none text-gray-700 [-webkit-tap-highlight-color:transparent] active:bg-gray-100"
                    onClick={handleZoomIn}
                    aria-label="지도 확대"
                  >
                    <span aria-hidden="true">+</span>
                  </button>

                  <button
                    type="button"
                    className="flex h-9 w-9 touch-manipulation items-center justify-center border-0 bg-white p-0 text-xl leading-none text-gray-700 [-webkit-tap-highlight-color:transparent] active:bg-gray-100"
                    onClick={handleZoomOut}
                    aria-label="지도 축소"
                  >
                    <span aria-hidden="true">−</span>
                  </button>
                </div>
              ) : null}

              {mapStatus !== 'ready' ? (
                <div
                  className="pointer-events-none absolute inset-0 z-2 flex flex-col items-center justify-center gap-2 bg-[#f3f2f0] text-center leading-normal text-[#777777] [&_a]:pointer-events-auto [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-[3px]"
                  aria-live="polite"
                >
                  {mapStatus === 'error' ? (
                    <>
                      <span>지도를 불러오지 못했습니다.</span>

                      <a href={kakaoMapUrl} target="_blank" rel="noreferrer">
                        카카오맵에서 보기
                      </a>
                    </>
                  ) : (
                    <span>지도를 불러오는 중입니다.</span>
                  )}
                </div>
              ) : null}
            </div>
          </FadeInUp>

          <div className={`grid grid-cols-2 gap-0 ${GowunDodum.className}`}>
            {mapLinks.map((mapLink) => (
              <Link
                key={mapLink.id}
                href={mapLink.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 overflow-clip rounded-md border border-gray-200 bg-gray-50"
              >
                <div className="flex w-full items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative aspect-square w-5 overflow-clip rounded-sm">
                      <Image
                        src={mapLink.imageSrc}
                        alt={mapLink.imageAlt}
                        fill
                      />
                    </div>

                    <span>{mapLink.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </FadeInUp>

      <div className="mt-10 space-y-8 text-center">
        <FadeInUp>
          <div>
            <h3 className="font-bold text-lg">🚗 주차장</h3>
            <div className="mt-2 space-y-1.5 text-base">
              <p>본 건물 지하 2층~4층 (3시간 무료 주차)</p>
              <p>* 주차장 만차시 시청/이마트/연제구청 주차장 이용</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp>
          <div className="mx-auto w-[40%] h-px bg-[repeating-linear-gradient(to_right,#999_0_4px,transparent_4px_10px)] bg-bottom bg-no-repeat bg-size-[100%_2px] opacity-50"></div>
        </FadeInUp>

        <FadeInUp>
          <div>
            <h3 className="font-bold text-lg">🚌 버스 노선</h3>
            <div className="mt-2 space-y-1.5 text-base">
              <p>86, 87, 99, 110, 129, 131, 141, 179 (시청 하차)</p>
              <p>20, 55, 57, 62, 131-1, 305 (연제구청 하차)</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp>
          <div className="mx-auto w-[40%] h-px bg-[repeating-linear-gradient(to_right,#999_0_4px,transparent_4px_10px)] bg-bottom bg-no-repeat bg-size-[100%_2px] opacity-50"></div>
        </FadeInUp>

        <FadeInUp>
          <div>
            <h3 className="font-bold text-lg">🚊 지하철</h3>
            <div className="mt-2 space-y-1.5 text-base">
              <p>1호선 시청역 2번 출구 (도보 2분 거리)</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp>
          <div className="mx-auto w-[40%] h-px bg-[repeating-linear-gradient(to_right,#999_0_4px,transparent_4px_10px)] bg-bottom bg-no-repeat bg-size-[100%_2px] opacity-50"></div>
        </FadeInUp>

        <FadeInUp>
          <div>
            <h3 className="font-bold text-lg">📞 문의 전화</h3>
            <div className="mt-2 space-y-1.5 text-base">
              <Link target="_blank" href={`tel:0516687979`}>
                <p>051-668-7979</p>
              </Link>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}

/**
 * 기존 Signoff를 사용하지 않는 이유:
 * 기존 Signoff 내부에도 HeartImage가 고정으로 포함되어 있습니다.
 *
 * 공유 기능은 유지하고 하트 이미지만 제외한 전용 하단 영역입니다.
 */
function UngjaeSignoff(): React.ReactElement {
  const { signoff } = content;

  function initializeKakao(): void {
    const kakao = (window as KakaoWindow).Kakao;

    if (!kakao || !KAKAO_JAVASCRIPT_KEY) {
      return;
    }

    if (!kakao.isInitialized()) {
      kakao.init(KAKAO_JAVASCRIPT_KEY);
    }
  }

  function handleKakaoShare(): void {
    initializeKakao();

    const kakao = (window as KakaoWindow).Kakao;

    if (!kakao?.isInitialized()) {
      window.alert(
        '카카오톡 공유 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
      return;
    }

    try {
      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: signoff.kakaoTitle,
          description: signoff.kakaoDescription,
          imageUrl: new URL(signoff.kakaoImage, invitationUrl).toString(),
          link: {
            mobileWebUrl: invitationUrl,
            webUrl: invitationUrl,
          },
        },
        buttons: [
          {
            title: signoff.kakaoButtonLabel,
            link: {
              mobileWebUrl: invitationUrl,
              webUrl: invitationUrl,
            },
          },
        ],
      });
    } catch (error) {
      console.error('카카오톡 공유에 실패했습니다.', error);
      window.alert('카카오톡 공유에 실패했습니다.');
    }
  }

  return (
    <>
      <Script
        id="ungjae-kakao-javascript-sdk"
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={initializeKakao}
        onError={() => {
          console.error('Kakao JavaScript SDK 로드에 실패했습니다.');
        }}
      />

      <section className="space-y-5 pb-20 select-none [-webkit-touch-callout:none]">
        <FadeInUp>
          <div className="relative aspect-64/95 w-full overflow-hidden select-none [-webkit-touch-callout:none]">
            <Image
              src={signoff.imageSrc}
              alt={signoff.imageAlt}
              fill
              draggable={false}
              className="pointer-events-none object-cover select-none [-webkit-user-drag:none] [-webkit-touch-callout:none]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 touch-pan-y bg-transparent select-none [-webkit-touch-callout:none]"
              onClick={blockMediaInteraction}
              onAuxClick={blockMediaInteraction}
              onDoubleClick={blockMediaInteraction}
              onContextMenu={blockMediaInteraction}
              onDragStart={blockMediaInteraction}
            />
          </div>
        </FadeInUp>

        <div className={`mt-10 space-y-4 px-5 ${GowunDodum.className}`}>
          <FadeInUp>
            <button
              type="button"
              onClick={handleKakaoShare}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[#0000000d] bg-[#F4F3F1] px-5 py-4.5"
            >
              <span>{signoff.shareButtonLabel}</span>

              <Image
                src="/images/signoff/kakao.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </button>
          </FadeInUp>

          <FadeInUp>
            <CopyToClipboard
              text={invitationUrl}
              onCopy={(_, copied) => {
                if (copied) {
                  toast.success('청첩장 링크가 복사되었습니다.');
                  return;
                }

                toast.error('청첩장 링크 복사에 실패했습니다.');
              }}
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[#0000000d] bg-[#F4F3F1] px-5 py-4.5"
              >
                <span>{signoff.copyButtonLabel}</span>

                <Image
                  src="/images/signoff/link.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
              </button>
            </CopyToClipboard>
          </FadeInUp>

          {/*
           * 기존 Signoff의 HeartImage를 넣지 않습니다.
           */}
        </div>
      </section>
    </>
  );
}

export default function UngJae(): React.ReactElement {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <>
      <BackgroundMusic
        variant={content.backgroundMusic.variant}
        src={content.backgroundMusic.src}
        autoPlay={content.backgroundMusic.autoPlay}
        loop={content.backgroundMusic.loop}
        volume={content.backgroundMusic.volume}
        preload={content.backgroundMusic.preload}
        startOnFirstInteraction={
          content.backgroundMusic.startOnFirstInteraction
        }
        showControl={content.backgroundMusic.showControl}
      />

      <main className="mx-auto flex w-full max-w-md flex-col min-[449px]:border-x min-[449px]:border-[#e5e5e5]">
        <div className="relative aspect-1/1.25 w-full overflow-hidden bg-black">
          <video
            src="/videos/youngung.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />

          {!hasEntered ? (
            <button
              type="button"
              className={`absolute inset-0 z-10 flex cursor-pointer items-end justify-center bg-black/10 pb-10 text-white ${GowunDodum.className}`}
              onClick={() => {
                setHasEntered(true);
              }}
            >
              <span className="rounded-full border border-white/70 bg-black/35 px-6 py-3 text-lg backdrop-blur-sm">
                음악과 함께 보기
              </span>
            </button>
          ) : null}
        </div>

        <UngjaeGreeting />

        {content.calendar.enabled ? (
          <WeddingCalendar
            targetDate={event.dateTime}
            groomName={couple.groom.name}
            brideName={couple.bride.name}
          />
        ) : null}

        <WeddingGallery
          title={content.gallery.title}
          images={content.gallery.images}
        />

        <UngjaeLocation />

        {content.accounts.enabled ? <UngjaeAccounts /> : null}

        <UngjaeSignoff />
      </main>
    </>
  );
}
