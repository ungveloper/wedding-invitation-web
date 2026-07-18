'use client';

import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { GowunDodum } from '../../lib/fonts';
import Link from 'next/link';
import { ChevronsRight, Copy } from 'lucide-react';

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

export default function WeddingLocation({
  venueName = '식장 이름',
  hallName = '웨딩홀 이름',
  address = '주소',
  latitude = 35.1778497,
  longitude = 129.0756194,
  naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ??
    DEFAULT_NAVER_MAP_CLIENT_ID,
}: WeddingLocationProps): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

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
      zoomControl: true,
      zoomControlOptions: {
        position: maps.Position.TOP_RIGHT,
        style: maps.ZoomControlStyle.SMALL,
      },
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

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = address;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setIsCopied(true);

    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }

    copiedTimerRef.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 1600);
  };

  const encodedVenueName = encodeURIComponent(venueName);
  const naverMapUrl = `https://map.naver.com/p/search/${encodedVenueName}`;

  return (
    <section
      ref={sectionRef}
      className={`${GowunDodum.className} flex w-full flex-col items-center bg-white px-5 pt-14 text-[#333333] transition-[opacity,transform] duration-800 max-[360px]:px-4 motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
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

      <Image
        className="mx-auto mb-5 block h-auto w-30.5 object-contain"
        src="/images/message/decoration_ribbon.png"
        alt=""
        width={134}
        height={40}
      />

      <h2
        id="wedding-location-title"
        className="m-0 text-center text-2xl font-semibold leading-normal tracking-[-0.045em]"
      >
        오시는 길
      </h2>

      <div className="mt-6.75 flex flex-col items-center gap-0.5 text-center">
        <p className="m-0 text-lg font-semibold leading-[1.65] tracking-[-0.04em]">
          {venueName}
        </p>
        <p className="m-0 text-lg font-normal leading-[1.65] tracking-[-0.04em]">
          {hallName}
        </p>
      </div>

      <div className="relative mt-3.5 flex items-center justify-center gap-1.25">
        <p className="m-0 text-lg font-normal leading-[1.65] tracking-[-0.04em]">
          {address}
        </p>
        <button
          type="button"
          className="m-0 flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#777777] [-webkit-tap-highlight-color:transparent] hover:text-[#333333] focus-visible:text-[#333333] focus-visible:outline-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-[1.45]"
          onClick={copyAddress}
          aria-label="식장 주소 복사"
        >
          <Copy />
        </button>

        <span
          className={`pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-4 -translate-x-1/2 whitespace-nowrap rounded bg-[rgba(51,51,51,0.92)] px-2.5 py-1.75 text-[11px] font-normal leading-none text-white transition-[opacity,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none ${
            isCopied ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
          }`}
          role="status"
          aria-live="polite"
        >
          주소가 복사되었습니다.
        </span>
      </div>

      <div className="relative mt-7 w-full overflow-hidden">
        <div
          ref={mapContainerRef}
          className="relative aspect-366/294 w-full rounded-md overflow-clip border border-gray-300 bg-[#ecebea]"
          aria-label={`${venueName} 네이버 지도`}
        />

        {mapStatus !== 'ready' ? (
          <div
            className="absolute inset-x-0 bottom-14 top-0 z-2 flex flex-col items-center justify-center gap-2 bg-[#f3f2f0] text-center text-[12px] font-normal leading-normal text-[#777777] [&_a]:font-medium [&_a]:text-[#333333] [&_a]:underline [&_a]:underline-offset-[3px]"
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

        <div className={`mt-3 space-y-3 ${GowunDodum.className}`}>
          <Link
            target="_blank"
            href="https://map.naver.com/p/directions/-/3AHG0P,2z9P1f,W%EC%9B%A8%EB%94%A9%20%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EC%9B%A8%EB%94%A9%ED%99%80,11881122,PLACE_POI/-/transit?c=15.00,0,0,0,dh"
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 overflow-clip"
          >
            <div className="px-5 py-3.5 w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-7.5 aspect-square rounded-sm overflow-clip">
                  <Image
                    src="/images/location/navermap.png"
                    alt="navermap"
                    fill
                  />
                </div>
                <span className="font-bold text-xl">네이버지도</span>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <span>바로가기</span>
                <ChevronsRight />
              </div>
            </div>
          </Link>

          <Link
            target="_blank"
            href="https://map.kakao.com/?map_type=TYPE_MAP&target=car&rt=,,972685.000000339,471972.00000000885&rt1=&rt2=W%EC%9B%A8%EB%94%A9%20%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%ED%99%80&rtIds=,11097221"
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 overflow-clip"
          >
            <div className="px-5 py-3.5 w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-7.5 aspect-square rounded-sm overflow-clip">
                  <Image
                    src="/images/location/kakaomap.png"
                    alt="kakaomap"
                    fill
                  />
                </div>
                <span className="font-bold text-xl">카카오맵</span>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <span>바로가기</span>
                <ChevronsRight />
              </div>
            </div>
          </Link>

          <Link
            target="_blank"
            href="https://apis.openapi.sk.com/tmap/app/routes?appKey=TJfHFoG4TQ3L1V2DNZ1Vj2sVFVVIvOWU6GlF3Oon&name=W웨딩국민연금웨딩홀&lon=129.0756194&lat=35.1778497"
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 overflow-clip"
          >
            <div className="px-5 py-3.5 w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-7.5 aspect-square rounded-sm overflow-clip">
                  <Image src="/images/location/tmap.png" alt="tmap" fill />
                </div>
                <span className="font-bold text-xl">티맵</span>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <span>바로가기</span>
                <ChevronsRight />
              </div>
            </div>
          </Link>

          <Link
            target="_blank"
            href="https://www.google.co.kr/maps/dir//%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C+%EC%97%B0%EC%A0%9C%EA%B5%AC+%EC%A4%91%EC%95%99%EB%8C%80%EB%A1%9C+1000+W%EC%9B%A8%EB%94%A9+%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EC%9B%A8%EB%94%A9%ED%99%80/data=!4m16!1m7!3m6!1s0x35689354a2ad7b81:0x8dccda5788b92fb1!2zV-ybqOuUqSDqta3rr7zsl7DquIjsm6jrlKntmYA!8m2!3d35.1779992!4d129.0757805!16s%2Fg%2F1vcq5gx3!4m7!1m0!1m5!1m1!1s0x35689354a2ad7b81:0x8dccda5788b92fb1!2m2!1d129.0757805!2d35.1779992?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D"
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 overflow-clip"
          >
            <div className="px-5 py-3.5 w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-7.5 aspect-square rounded-sm overflow-clip">
                  <Image
                    src="/images/location/googlemap.png"
                    alt="googlemap"
                    fill
                  />
                </div>
                <span className="font-bold text-xl">구글맵</span>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <span>바로가기</span>
                <ChevronsRight />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
