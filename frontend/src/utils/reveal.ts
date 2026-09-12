import type { CSSProperties } from 'react';

/** Scroll-reveal delay for the item at `index` in a grid, staggered across each row of `columns`. */
export const revealDelay = (index: number, columns = 3): CSSProperties =>
  ({ '--reveal-delay': `${(index % columns) * 90}ms` }) as CSSProperties;
