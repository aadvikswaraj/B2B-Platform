"use client";
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.08 });

    const isModifiedEvent = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

    const findAnchor = (el) => {
      while (el && el !== document.body) {
        if (el.tagName === 'A') return el;
        el = el.parentElement;
      }
      return null;
    };

    // Start NProgress on in-app link clicks (capture phase for reliability)
    const onClickCapture = (e) => {
      const a = findAnchor(e.target);
      if (!a) return;
      const href = a.getAttribute('href');
      const target = a.getAttribute('target');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      // External link? skip
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
      } catch { return; }
      if (isModifiedEvent(e)) return;
      if (target && target !== '_self') return;
      NProgress.start();
    };

    document.addEventListener('click', onClickCapture, true);

    // Fallback: show on beforeunload for hard navigations
    const onBeforeUnload = () => NProgress.start();
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  // Complete progress when the route (or query) changes
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
