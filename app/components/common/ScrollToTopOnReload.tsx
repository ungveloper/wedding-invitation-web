'use client';

import { useEffect } from 'react';

export default function ScrollToTopOnReload(): null {
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    const scrollToTop = () => {
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto',
        });
      });
    };

    scrollToTop();
    window.addEventListener('pageshow', scrollToTop);

    return () => {
      window.removeEventListener('pageshow', scrollToTop);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return null;
}
