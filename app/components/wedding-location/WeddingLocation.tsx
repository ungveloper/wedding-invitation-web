'use client';

import { Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import { GowunDodum } from '../../lib/fonts';
import type { InvitationMapLink } from '../../types/invitation';
import FadeInUp from '../common/FadeInUp';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

type KakaoLatLng = object;

type KakaoZoomControlInstance = object;

type KakaoMapInstance = {
  setCenter: (position: KakaoLatLng) => void;
  relayout: () => void;
  addControl: (control: KakaoZoomControlInstance, position: unknown) => void;
  removeControl: (control: KakaoZoomControlInstance) => void;
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
  ZoomControl: new () => KakaoZoomControlInstance;
  ControlPosition: {
    RIGHT: unknown;
  };
};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsNamespace;
    };
  }
}

type WeddingLocationProps = {
  title: string;
  venueName: string;
  hallName: string;
  address: string;
  latitude: number;
  longitude: number;
  mapLinks: InvitationMapLink[];
  kakaoMapJavaScriptKey?: string;
};

type MapStatus = 'loading' | 'ready' | 'error';

export default function WeddingLocation({
  title,
  venueName,
  hallName,
  address,
  latitude,
  longitude,
  mapLinks,
  kakaoMapJavaScriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? '',
}: WeddingLocationProps): React.ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [mapStatus, setMapStatus] = useState<MapStatus>(
    kakaoMapJavaScriptKey ? 'loading' : 'error',
  );

  const handleKakaoMapScriptReady = (): void => {
    const maps = window.kakao?.maps;

    if (!maps) {
      setMapStatus('error');
      return;
    }

    maps.load(() => {
      setMapStatus('ready');
    });
  };

  useEffect(() => {
    if (mapStatus !== 'ready' || !mapContainerRef.current) {
      return;
    }

    const maps = window.kakao?.maps;

    if (!maps) {
      setMapStatus('error');
      return;
    }

    const center = new maps.LatLng(latitude, longitude);

    const map = new maps.Map(mapContainerRef.current, {
      center,
      level: 4,
      draggable: false,
      scrollwheel: false,
      disableDoubleClick: true,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
    });

    const marker = new maps.Marker({
      position: center,
      map,
      title: venueName,
    });

    const zoomControl = new maps.ZoomControl();

    map.addControl(zoomControl, maps.ControlPosition.RIGHT);

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
      map.removeControl(zoomControl);
      marker.setMap(null);
    };
  }, [latitude, longitude, mapStatus, venueName]);

  const encodedVenueName = encodeURIComponent(venueName);

  const kakaoMapUrl =
    `https://map.kakao.com/link/map/` +
    `${encodedVenueName},${latitude},${longitude}`;

  return (
    <section
      className={`${GowunDodum.className} flex w-full flex-col items-center bg-[#f4f3f1] px-5 pt-12 pb-14`}
      aria-labelledby="wedding-location-title"
    >
      {kakaoMapJavaScriptKey ? (
        <Script
          id="kakao-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
            kakaoMapJavaScriptKey,
          )}&autoload=false`}
          strategy="afterInteractive"
          onReady={handleKakaoMapScriptReady}
          onError={() => {
            setMapStatus('error');
          }}
        />
      ) : null}

      <WeddingSectionHeader
        id="wedding-location-title"
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
              className="m-0 flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#777777] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.45] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]"
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
              className="relative aspect-366/294 w-full touch-pan-y overflow-clip rounded-md border border-gray-200 bg-[#ecebea]"
              aria-label={`${venueName} 카카오맵`}
            />
          </FadeInUp>

          {mapStatus !== 'ready' ? (
            <div
              className="absolute inset-x-0 top-0 bottom-14 z-2 flex flex-col items-center justify-center gap-2 bg-[#f3f2f0] text-center leading-normal text-[#777777] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-[3px]"
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
    </section>
  );
}
