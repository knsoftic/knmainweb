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
        const pending = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_PENDING));
        if (!pending.length) return;

        // Every position is read first and every attribute written afterwards. Alternating the two
        // made the browser recalculate styles once per element - each attribute below changes
        // which CSS rules apply, and the next position read has to wait for that to be worked out.
        // The attributes only affect opacity, so no position can differ between the two orders.
        const limit = window.innerHeight * 0.92;
        const onScreen = pending.map((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top < limit && rect.bottom > 0;
        });

        pending.forEach((element, index) => {
          if (onScreen[index]) {
            element.setAttribute('data-reveal-done', '');
          } else {
            element.setAttribute('data-reveal-watch', '');
            observer.observe(element);
          }
        });
      };

      scan();
      root.classList.add('ks-reveal-ready');

      // React can insert many nodes in one go (hydration, a route change, a filter), and each
      // insertion is its own mutation. Coalescing them into one scan per frame avoids querying the
      // whole page dozens of times; the frame callback still runs before the browser paints, so
      // fresh on-screen content never blinks.
      let scanFrame = 0;
      const scheduleScan = () => {
        if (!scanFrame) {
          scanFrame = requestAnimationFrame(() => {
            scanFrame = 0;
            scan();
          });
        }
      };
      const mutations = new MutationObserver(scheduleScan);
      mutations.observe(document.body, { childList: true, subtree: true });

      cleanups.push(() => {
        cancelAnimationFrame(scanFrame);
        mutations.disconnect();
        observer.disconnect();
        root.classList.remove('ks-reveal-ready');
        document.querySelectorAll('[data-reveal-watch]:not([data-revealed])').forEach((element) => element.removeAttribute('data-reveal-watch'));
      });
    }

    // The hero animates continuously - rings, drifting blobs, a glow, floating cards. None of that
    // is worth a frame's work once it has scrolled out of sight, and stopping it leaves more room
    // for the scrolling itself. Animations resume from where they paused.
    if ('IntersectionObserver' in window) {
      const hero = document.querySelector<HTMLElement>('.ks-hero');
      if (hero) {
        const idleObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) hero.removeAttribute('data-idle');
            else hero.setAttribute('data-idle', '');
          },
          { rootMargin: '120px' }
        );
        idleObserver.observe(hero);
        cleanups.push(() => {
          idleObserver.disconnect();
          hero.removeAttribute('data-idle');
        });
      }
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      // A pointer can report well over a hundred moves a second, and each write here repaints that
      // card's glow. Coalescing to one write per frame keeps the effect and drops the rest.
      let frame = 0;
      let pending: { card: HTMLElement; x: number; y: number } | null = null;

      const flush = () => {
        frame = 0;
        if (!pending) return;
        const { card, x, y } = pending;
        pending = null;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${x - rect.left}px`);
        card.style.setProperty('--my', `${y - rect.top}px`);
      };

      const onPointerMove = (event: PointerEvent) => {
        const card = (event.target as Element | null)?.closest?.<HTMLElement>('.ks-card--hover');
        if (!card) return;
        pending = { card, x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(flush);
      };

      document.addEventListener('pointermove', onPointerMove, { passive: true });
      cleanups.push(() => {
        document.removeEventListener('pointermove', onPointerMove);
        cancelAnimationFrame(frame);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
