import type { Viewport } from 'next';
import { Toaster } from 'sonner';
import ScrollToTopOnReload from './components/common/ScrollToTopOnReload';
import './globals.css';
import { GowunDodum } from './lib/fonts';

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
            className: `${GowunDodum.className}`,
          }}
        />
      </body>
    </html>
  );
}
