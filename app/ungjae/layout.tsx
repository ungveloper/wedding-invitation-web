import type { Metadata } from 'next';

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mocheong.com').replace(
    /\/$/,
    '',
  );
}

const invitationUrl = `${getSiteUrl()}/ungjae`;

export const metadata: Metadata = {
  title: '웅재♥혜정, 결혼합니다!',
  description:
    '2026년 9월 20일, 저희 두 사람의 새로운 시작에 소중한 분들을 초대합니다.',

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: invitationUrl,
    siteName: '웅재♥혜정 모바일 청첩장',
    title: '웅재♥혜정, 결혼합니다!',
    description:
      '2026년 9월 20일, 저희 두 사람의 새로운 시작에 소중한 분들을 초대합니다.',
    images: [
      {
        url: '/images/common/og-image.png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: '웅재♥혜정, 결혼합니다!',
    description:
      '2026년 9월 20일, 저희 두 사람의 새로운 시작에 소중한 분들을 초대합니다.',
    images: ['/images/common/og-image.png'],
  },
};

type UngjaeLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function UngjaeLayout({
  children,
}: UngjaeLayoutProps): React.ReactElement {
  return <>{children}</>;
}
