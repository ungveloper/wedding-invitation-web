'use client';

import { Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import { GowunDodum } from '../../lib/fonts';
import FadeInUp from '../common/FadeInUp';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

const DEFAULT_NAVER_MAP_CLIENT_ID = 't001dpgy5u';

type NaverLatLng = object;

type NaverMapInstance = {
  setCenter: (position: NaverLatLng) => void;
};

type NaverMarkerInstance = {
  setMap: (map: NaverMapInstance | null) => void;
};

type NaverMapsNamespace = {
  LatLng: new (latitude: number, longitude: number) => NaverLatLng;
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => NaverMapInstance;
  Marker: new (options: Record<string, unknown>) => NaverMarkerInstance;
  Event: {
    trigger: (target: NaverMapInstance, eventName: string) => void;
  };
  Position: {
    TOP_RIGHT: unknown;
    BOTTOM_LEFT: unknown;
  };
  ZoomControlStyle: {
    SMALL: unknown;
  };
};

declare global {
  interface Window {
    naver?: {
      maps: NaverMapsNamespace;
    };
    navermap_authFailure?: () => void;
  }
}

type WeddingLocationProps = {
  venueName?: string;
  hallName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  naverMapClientId?: string;
};

type MapStatus = 'loading' | 'ready' | 'error';

type MapLink = {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const MAP_LINKS: readonly MapLink[] = [
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
    href: 'https://www.google.co.kr/maps/dir//%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C+%EC%97%B0%EC%A0%9C%EA%B5%AC+%EC%A4%91%EC%95%99%EB%8C%80%EB%A1%9C+1000+W%EC%9B%A8%EB%94%A9+%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EC%9B%A8%EB%94%A9%ED%99%80/data=!4m16!1m7!3m6!1s0x35689354a2ad7b81:0x8dccda5788b92fb1!2zV-ybqOuUqSDqta3rr7zsl7DquIjsm6jrlKntmYA!8m2!3d35.1779992!4d129.0757805!16s%2Fg%2F1vcq5gx3!4m7!1m0!1m5!1m1!1s0x35689354a2ad7b81:0x8dccda5788b92fb1!2m2!1d129.0757805!2d35.1779992?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D',
    imageSrc: '/images/location/googlemap.png',
    imageAlt: '구글맵',
  },
];

export default function WeddingLocation({
  venueName = '식장 이름',
  hallName = '웨딩홀 이름',
  address = '주소',
  latitude = 35.1778497,
  longitude = 129.0756194,
  naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ??
    DEFAULT_NAVER_MAP_CLIENT_ID,
}: WeddingLocationProps): React.ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');

  useEffect(() => {
    const previousAuthFailure = window.navermap_authFailure;

    window.navermap_authFailure = () => {
      previousAuthFailure?.();
      setMapStatus('error');
    };

    return () => {
      window.navermap_authFailure = previousAuthFailure;
    };
  }, []);

  useEffect(() => {
    if (mapStatus !== 'ready' || !mapContainerRef.current) {
      return;
    }

    const maps = window.naver?.maps;

    if (!maps) {
      return;
    }

    const center = new maps.LatLng(latitude, longitude);
    const map = new maps.Map(mapContainerRef.current, {
      center,
      zoom: 17,
      minZoom: 11,
      maxZoom: 20,
      draggable: false,
      scrollWheel: false,
      pinchZoom: false,
      disableDoubleClickZoom: true,
      disableDoubleTapZoom: true,
      disableTwoFingerTapZoom: true,
      keyboardShortcuts: false,
      zoomControl: false,
      mapDataControl: false,
      scaleControl: false,
      logoControlOptions: {
        position: maps.Position.BOTTOM_LEFT,
      },
    });

    const marker = new maps.Marker({
      position: center,
      map,
      title: venueName,
    });

    const resizeMap = () => {
      maps.Event.trigger(map, 'resize');
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
    };
  }, [latitude, longitude, mapStatus, venueName]);

  const encodedVenueName = encodeURIComponent(venueName);
  const naverMapUrl = `https://map.naver.com/p/search/${encodedVenueName}`;

  return (
    <section
      className={`${GowunDodum.className} flex w-full flex-col items-center bg-[#f4f3f1] px-5 pt-12 pb-14`}
      aria-labelledby="wedding-location-title"
    >
      <Script
        id="naver-map-sdk"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
          naverMapClientId,
        )}&language=ko`}
        strategy="afterInteractive"
        onReady={() => setMapStatus('ready')}
        onError={() => setMapStatus('error')}
      />

      <WeddingSectionHeader
        id="wedding-location-title"
        className="space-y-5"
        title="오시는 길"
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
            <div
              ref={mapContainerRef}
              className="pointer-events-none relative aspect-366/294 w-full touch-pan-y overflow-clip rounded-md border border-gray-200 bg-[#ecebea]"
              aria-label={`${venueName} 네이버 지도`}
            />
          </FadeInUp>

          {mapStatus !== 'ready' ? (
            <div
              className="absolute inset-x-0 bottom-14 top-0 z-2 flex flex-col items-center justify-center gap-2 bg-[#f3f2f0] text-center leading-normal text-[#777777] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-[3px]"
              aria-live="polite"
            >
              {mapStatus === 'error' ? (
                <>
                  <span>지도를 불러오지 못했습니다.</span>
                  <a href={naverMapUrl} target="_blank" rel="noreferrer">
                    네이버 지도에서 보기
                  </a>
                </>
              ) : (
                <span>지도를 불러오는 중입니다.</span>
              )}
            </div>
          ) : null}

          <div className={`grid grid-cols-2 gap-0 ${GowunDodum.className}`}>
            {MAP_LINKS.map((mapLink) => (
              <Link
                key={mapLink.id}
                target="_blank"
                rel="noreferrer"
                href={mapLink.href}
                className="flex items-center gap-1 rounded-md overflow-clip border border-gray-200 bg-gray-50"
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
    </section>
  );
}
