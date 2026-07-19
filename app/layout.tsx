import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import ScrollToTopOnReload from './components/common/ScrollToTopOnReload';
import './globals.css';
import { GowunDodum } from './lib/fonts';

const INVITATION_URL =
  process.env.NEXT_PUBLIC_INVITATION_URL ??
  'https://wedding-invitation-web-drab.vercel.app';

const INVITATION_TITLE = '웅재♥혜정, 결혼합니다!';

const INVITATION_DESCRIPTION =
  '2026년 9월 20일, 저희 두 사람의 새로운 시작에 소중한 분들을 초대합니다.';

export const metadata: Metadata = {
  metadataBase: new URL(INVITATION_URL),

  title: INVITATION_TITLE,
  description: INVITATION_DESCRIPTION,

  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: INVITATION_URL,
    siteName: '웅재♥혜정 모바일 청첩장',
    title: INVITATION_TITLE,
    description: INVITATION_DESCRIPTION,
    images: [
      {
        url: '/images/common/og-image.png',
        width: 1200,
        height: 630,
        alt: '웅재♥혜정의 모바일 청첩장',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: INVITATION_TITLE,
    description: INVITATION_DESCRIPTION,
    images: ['/images/common/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ScrollToTopOnReload />

        {children}

        <Toaster
          position="top-center"
          toastOptions={{
            className: GowunDodum.className,
          }}
        />
      </body>
    </html>
  );
}
