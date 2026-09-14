import { cache } from 'react';

export type ImageSize = { width: number; height: number };

// Enough to reach the dimensions of any of the formats below. A camera JPEG can carry a large EXIF
// block (with its own thumbnail) before the frame header, which is why this is not smaller.
const HEADER_BYTES = 131072;

const pngSize = (b: Buffer): ImageSize | null =>
  b.length >= 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString('ascii', 12, 16) === 'IHDR'
    ? { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
    : null;

const gifSize = (b: Buffer): ImageSize | null =>
  b.length >= 10 && b.toString('ascii', 0, 3) === 'GIF'
    ? { width: b.readUInt16LE(6), height: b.readUInt16LE(8) }
    : null;

const webpSize = (b: Buffer): ImageSize | null => {
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8L' && b[20] === 0x2f) {
    return {
      width: 1 + (b[21] | ((b[22] & 0x3f) << 8)),
      height: 1 + (((b[22] & 0xc0) >> 6) | (b[23] << 2) | ((b[24] & 0x0f) << 10)),
    };
  }
  if (chunk === 'VP8 ' && b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a) {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  return null;
};

// EXIF orientations 5-8 mean the photo is stored on its side. Browsers (and the image optimizer)
// rotate it upright when showing it, so its width and height swap.
const exifTurnsSideways = (b: Buffer, start: number, end: number) => {
  if (b.toString('ascii', start, start + 6) !== 'Exif\0\0') return false;
  const tiff = start + 6;
  if (tiff + 8 > end) return false;
  const little = b.toString('ascii', tiff, tiff + 2) === 'II';
  const u16 = (at: number) => (little ? b.readUInt16LE(at) : b.readUInt16BE(at));
  const u32 = (at: number) => (little ? b.readUInt32LE(at) : b.readUInt32BE(at));
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > end) return false;
  const entries = u16(ifd);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) return false;
    if (u16(entry) === 0x0112) return u16(entry + 8) >= 5;
  }
  return false;
};

const jpegSize = (b: Buffer): ImageSize | null => {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;

  let sideways = false;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    // Markers that carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0xff) {
      i += marker === 0xff ? 1 : 2;
      continue;
    }
    const length = b.readUInt16BE(i + 2);
    if (marker === 0xe1) {
      sideways = sideways || exifTurnsSideways(b, i + 4, Math.min(b.length, i + 2 + length));
    }
    // Start-of-frame markers hold the dimensions (C4, C8 and CC are other tables, not frames).
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      const height = b.readUInt16BE(i + 5);
      const width = b.readUInt16BE(i + 7);
      return sideways ? { width: height, height: width } : { width, height };
    }
    i += 2 + length;
  }
  return null;
};

/**
 * The pixel dimensions of an image, read from the first bytes of the file rather than by
 * downloading and decoding all of it.
 *
 * Lets images uploaded through the admin panel carry their real width and height, so the browser
 * reserves the right space before the file arrives and the declared shape matches the actual one.
 * Upload filenames are unique and never reused, so the answer is kept for a day.
 *
 * Returns null for SVGs (which scale), unsupported formats, or anything that fails to load; callers
 * then simply leave the attributes off.
 */
export const getImageSize = cache(async (url?: string | null): Promise<ImageSize | null> => {
  if (!url || /\.svg(\?|$)/i.test(url) || url.startsWith('data:')) {
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: { Range: `bytes=0-${HEADER_BYTES - 1}` },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const bytes = Buffer.from(await res.arrayBuffer());
    const size = pngSize(bytes) || webpSize(bytes) || jpegSize(bytes) || gifSize(bytes);
    return size && size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  }
});
