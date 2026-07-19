'use client';

import Image from 'next/image';
import Script from 'next/script';
import type { SyntheticEvent } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import FadeInUp from './components/common/FadeInUp';
import { GowunDodum } from './lib/fonts';

const DEFAULT_KAKAO_JAVASCRIPT_KEY = '310d015109a750e6c26da3906be21d48';
const DEFAULT_INVITATION_URL = 'https://wedding-invitation-web-drab.vercel.app';

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

const KAKAO_JAVASCRIPT_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? DEFAULT_KAKAO_JAVASCRIPT_KEY;

const INVITATION_URL = (
  process.env.NEXT_PUBLIC_INVITATION_URL ?? DEFAULT_INVITATION_URL
).replace(/\/$/, '');

function blockMediaInteraction(event: SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

export default function Signoff(): React.ReactElement {
  function initializeKakao(): void {
    const kakao = window.Kakao;

    if (!kakao) {
      return;
    }

    if (!KAKAO_JAVASCRIPT_KEY) {
      console.error(
        'NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 환경변수가 설정되지 않았습니다.',
      );
      return;
    }

    if (!kakao.isInitialized()) {
      kakao.init(KAKAO_JAVASCRIPT_KEY);
    }
  }

  function handleKakaoShare(): void {
    if (!INVITATION_URL) {
      window.alert(
        'NEXT_PUBLIC_INVITATION_URL 환경변수가 설정되지 않았습니다.',
      );
      return;
    }

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
          title: '저희 두 사람 결혼합니다',
          description: '소중한 분들을 저희의 시작에 초대합니다.',
          imageUrl: `${INVITATION_URL}/images/signoff/bowing.png`,
          link: {
            mobileWebUrl: INVITATION_URL,
            webUrl: INVITATION_URL,
          },
        },
        buttons: [
          {
            title: '모바일 청첩장 보기',
            link: {
              mobileWebUrl: INVITATION_URL,
              webUrl: INVITATION_URL,
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
              src="/images/signoff/bowing.png"
              alt="신랑과 신부가 인사하는 모습"
              fill
              draggable={false}
              className="pointer-events-none select-none object-cover [-webkit-user-drag:none] [-webkit-touch-callout:none]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 touch-pan-y select-none bg-transparent [-webkit-touch-callout:none]"
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
              className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-[#d8d6d2] bg-[#f1f2f6] px-5 py-4.5 text-left"
            >
              <Image
                src="/images/signoff/kakaotalk.png"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
              />

              <span>카카오톡 공유하기</span>
            </button>
          </FadeInUp>

          <FadeInUp>
            <CopyToClipboard text={INVITATION_URL} onCopy={handleCopy}>
              <button
                type="button"
                disabled={!INVITATION_URL}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-[#d8d6d2] bg-[#ededed] px-5 py-4.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Image
                  src="/images/signoff/link.png"
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden="true"
                />

                <span>청첩장 링크 복사하기</span>
              </button>
            </CopyToClipboard>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
