"use client";

import { useEffect, useRef } from 'react';

export interface FunFactItem {
  id: string;
  target: number;
  label: string;
}

/**
 * The number is rendered in full on the server, so it is right without JavaScript and for search engines.
 * On the client it counts up from 0 the first time it scrolls into view (skipped for reduced motion).
 * The count writes straight to the text node, so it doesn't re-render React on every tick.
 */
export function CountUp({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const textNode = element?.firstChild;
    if (!element || !textNode) return;

    const show = (value: number) => {
      textNode.nodeValue = String(value);
    };

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || target <= 0) {
      show(target);
      return;
    }

    let frame = 0;
    show(0);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          show(Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      show(target);
    };
  }, [target]);

  return (
    <>
      <span ref={ref}>{target}</span>
      {suffix}
    </>
  );
}

type FunFactsVariant = 'dark' | 'strip';

// Shows only the numbers saved in Admin → Homepage → Fun Facts; nothing if there are none.
export function FunFactsSection({ stats, variant = 'dark' }: { stats: FunFactItem[]; variant?: FunFactsVariant }) {
  if (stats.length === 0) return null;

  return (
    <div className={variant === 'strip' ? 'ks-stats-strip' : 'ks-stats'} id="fun-facts" data-reveal="stagger">
      {stats.map((stat) => (
        <div className="ks-stat" key={stat.id}>
          <span className="ks-stat__num"><CountUp target={Number(stat.target) || 0} /></span>
          <span className="ks-stat__label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
