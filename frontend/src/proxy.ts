import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiUrl } from './utils/api-url';

type Redirect = { source_url: string; target_url: string; status_code?: number };

// Next.js ignores fetch caching options inside Proxy, so redirect rules are cached here in memory
// instead of hitting the API on every page view.
const CACHE_TTL_MS = 60 * 1000;
let cachedRedirects: Redirect[] = [];
let cachedAt = 0;
let pendingFetch: Promise<Redirect[]> | null = null;

async function loadRedirects(): Promise<Redirect[]> {
  if (Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRedirects;
  }

  if (!pendingFetch) {
    pendingFetch = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      try {
        const res = await fetch(apiUrl('/seo/redirects'), { signal: controller.signal, cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          cachedRedirects = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        // Keep serving the last known rules if the API is slow or down.
        console.error('Proxy redirect fetch failed', error);
      } finally {
        clearTimeout(timeout);
        cachedAt = Date.now();
        pendingFetch = null;
      }
      return cachedRedirects;
    })();
  }

  return pendingFetch;
}

// Admin-entered sources may be full URLs or lack the leading slash; compare paths only.
const normalizePath = (value: string) => {
  let path = value.trim();
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
  } catch {
    return '';
  }
  if (!path.startsWith('/')) path = `/${path}`;
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
};

const STATIC_FILE = /\.(?:css|js|mjs|map|json|xml|txt|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot|otf|mp4|webm|pdf)$/i;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // One canonical host: send www.knsoftic.com to knsoftic.com.
  const host = request.headers.get('host') || '';
  if (host.toLowerCase().startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // Skip API routes, static files, Next.js internals, admin panel, uploads, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/uploads') ||
    STATIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const redirects = await loadRedirects();
  if (redirects.length === 0) {
    return NextResponse.next();
  }

  const current = normalizePath(pathname);
  const match = redirects.find((r) => r.source_url && normalizePath(r.source_url) === current);
  if (!match?.target_url) {
    return NextResponse.next();
  }

  const status = REDIRECT_STATUSES.has(Number(match.status_code)) ? Number(match.status_code) : 301;
  try {
    // Relative targets (with optional query string) resolve against this site; absolute ones are used as-is.
    const target = new URL(match.target_url.trim(), request.nextUrl.origin);
    if (target.href === request.nextUrl.href) {
      return NextResponse.next();
    }
    return NextResponse.redirect(target, status);
  } catch {
    console.error('Ignoring redirect with invalid target', match.target_url);
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
