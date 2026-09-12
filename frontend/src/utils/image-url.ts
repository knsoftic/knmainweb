import { API_BASE } from './api-url';

const BACKEND_URL = (API_BASE || '').replace(/\/api\/?$/, '');

// Widths Next's image optimizer accepts out of the box (imageSizes + deviceSizes). Asking for any
// other width is rejected with a 400, so this list must only contain values from that set.
const OPTIMIZER_WIDTHS = [384, 640, 828, 1200, 1920];

const optimizerUrl = (src: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

/**
 * Attributes for an `<img>` that loads through Next's image optimizer, which sends the browser a
 * WebP copy scaled to the size it will actually be displayed at. Uploads are often 1.5 MB PNGs;
 * this typically turns one into well under 100 KB without touching the stored file.
 *
 * `sizes` describes how wide the image is on screen (e.g. '(max-width: 700px) 100vw, 33vw') so the
 * browser can pick the right width from the set below.
 *
 * SVGs, GIFs and data URLs are passed through untouched: the optimizer cannot improve them, and
 * rasterising an SVG or flattening an animation would make things worse.
 */
export const optimizedImage = (src: string, sizes: string, widths: number[] = OPTIMIZER_WIDTHS) => {
  if (!src || src.startsWith('data:') || /\.(svg|gif)(\?|$)/i.test(src)) {
    return { src };
  }

  return {
    src: optimizerUrl(src, widths[widths.length - 1]),
    srcSet: widths.map((width) => `${optimizerUrl(src, width)} ${width}w`).join(', '),
    sizes,
  };
};

export const resolveImageUrl = (value?: string | null, fallback = '') => {
  if (!value) {
    return fallback;
  }

  if (value.startsWith('http')) {
    return value;
  }

  if (value.startsWith('/uploads')) {
    return `${BACKEND_URL}${value}`;
  }

  if (value.startsWith('/')) {
    return value;
  }

  return `${BACKEND_URL}/${value}`;
};