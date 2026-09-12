"use client";

import { useEffect } from 'react';

const REVEAL_PENDING = '[data-reveal]:not([data-revealed]):not([data-reveal-done]):not([data-reveal-watch])';

/**
 * Site-wide motion, mounted once by SiteShell (renders nothing):
 * - Scroll reveal: elements with `data-reveal` animate in the first time they scroll into view.
 *   Anything already on screen when it is found is left as it is, and content is only hidden
 *   after this has run, so pages never flicker and stay readable without JavaScript.
 *   New content (route changes, filters) is picked up automatically.
 * - Card glow: `.ks-card--hover` cards get the pointer position as --mx / --my.
 * Both are skipped for visitors who prefer reduced motion.
 */
export function MotionEffects() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const cleanups: Array<() => void> = [];

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.setAttribute('data-revealed', '');
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -8% 0px' }
      );

      const scan = () => {
        document.querySelectorAll<HTMLElement>(REVEAL_PENDING).forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
            element.setAttribute('data-reveal-done', '');
          } else {
            element.setAttribute('data-reveal-watch', '');
            observer.observe(element);
          }
        });
      };

      scan();
      root.classList.add('ks-reveal-ready');

      // Runs before the browser paints the new nodes, so fresh on-screen content never blinks.
      const mutations = new MutationObserver(scan);
      mutations.observe(document.body, { childList: true, subtree: true });

      cleanups.push(() => {
        mutations.disconnect();
        observer.disconnect();
        root.classList.remove('ks-reveal-ready');
        document.querySelectorAll('[data-reveal-watch]:not([data-revealed])').forEach((element) => element.removeAttribute('data-reveal-watch'));
      });
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      const onPointerMove = (event: PointerEvent) => {
        const card = (event.target as Element | null)?.closest?.<HTMLElement>('.ks-card--hover');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      };
      document.addEventListener('pointermove', onPointerMove, { passive: true });
      cleanups.push(() => document.removeEventListener('pointermove', onPointerMove));
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
