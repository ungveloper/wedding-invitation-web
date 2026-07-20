'use client';

import Image from 'next/image';
import Script from 'next/script';
import type { SyntheticEvent } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import FadeInUp from './components/common/FadeInUp';
import HeartImage from './components/heart-image/HeartImage';
import { GowunDodum } from './lib/fonts';

const DEFAULT_KAKAO_JAVASCRIPT_KEY = '310d015109a750e6c26da3906be21d48';

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

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

type SignoffProps = {
  invitationUrl: string;
  imageSrc: string;
  imageAlt: string;
  kakaoTitle: string;
  kakaoDescription: string;
  kakaoImage: string;
  kakaoButtonLabel: string;
  shareButtonLabel: string;
  copyButtonLabel: string;
};

const KAKAO_JAVASCRIPT_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? DEFAULT_KAKAO_JAVASCRIPT_KEY;

function blockMediaInteraction(event: SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

export default function Signoff({
  invitationUrl,
  imageSrc,
  imageAlt,
  kakaoTitle,
  kakaoDescription,
  kakaoImage,
  kakaoButtonLabel,
  shareButtonLabel,
  copyButtonLabel,
}: SignoffProps): React.ReactElement {
  function initializeKakao(): void {
    const kakao = window.Kakao;

    if (!kakao || !KAKAO_JAVASCRIPT_KEY) {
      return;
    }

    if (!kakao.isInitialized()) {
      kakao.init(KAKAO_JAVASCRIPT_KEY);
    }
  }

  function handleKakaoShare(): void {
    initializeKakao();

    const kakao = window.Kakao;

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
          title: kakaoTitle,
          description: kakaoDescription,
          imageUrl: new URL(kakaoImage, invitationUrl).toString(),
          link: {
            mobileWebUrl: invitationUrl,
            webUrl: invitationUrl,
          },
        },
        buttons: [
          {
            title: kakaoButtonLabel,
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

  function handleCopy(_: string, copied: boolean): void {
    if (copied) {
      toast.success('청첩장 링크가 복사되었습니다.');
      return;
    }

    toast.error('청첩장 링크 복사에 실패했습니다.');
  }

  return (
    <>
      <Script
        id="kakao-javascript-sdk"
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
              src={imageSrc}
              alt={imageAlt}
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
              <span>{shareButtonLabel}</span>
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
            <CopyToClipboard text={invitationUrl} onCopy={handleCopy}>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[#0000000d] bg-[#F4F3F1] px-5 py-4.5"
              >
                <span>{copyButtonLabel}</span>
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

          <HeartImage />
        </div>
      </section>
    </>
  );
}
