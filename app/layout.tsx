import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import ScrollToTopOnReload from './components/common/ScrollToTopOnReload';
import './globals.css';
import { GowunDodum } from './lib/fonts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mocheong.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '모청모청 | 한 번 입력하고 골라보는 모바일 청첩장',
    template: '%s | 모청모청',
  },
  description:
    '정보는 한 번, 모청은 여러 번. 내 정보가 적용된 다양한 모바일 청첩장을 비교하고 골라보세요.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: '모청모청',
    title: '모청모청 | 한 번 입력하고 골라보는 모바일 청첩장',
    description:
      '정보는 한 번, 모청은 여러 번. 내 정보가 적용된 다양한 모바일 청첩장을 비교하고 골라보세요.',
    images: [
      {
        url: '/images/common/og-image.png',
        width: 1200,
        height: 630,
        alt: '모청모청 모바일 청첩장',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '모청모청 | 한 번 입력하고 골라보는 모바일 청첩장',
    description:
      '정보는 한 번, 모청은 여러 번. 내 정보가 적용된 다양한 모바일 청첩장을 비교하고 골라보세요.',
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
          toastOptions={{ className: GowunDodum.className }}
        />
      </body>
    </html>
  );
}
