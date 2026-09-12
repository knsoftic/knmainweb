export const SITE_NAME = 'KN Softic';

/** Public site origin, without a trailing slash. The bare domain is canonical; www redirects to it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://knsoftic.com').replace(/\/+$/, '');

/** Used only when settings haven't loaded; matches the number stored in settings. */
export const DEFAULT_WHATSAPP_NUMBER = '923452470250';

/** Returns the value as an absolute http(s) URL, or null if it isn't one. */
export function parseSiteUrl(value?: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}
