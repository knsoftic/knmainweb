import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiUrl } from './utils/api-url';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip API routes, static files, Next.js internals, admin panel, uploads, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(.*)$/) // Static files (e.g. .jpg, .css)
  ) {
    return NextResponse.next();
  }

  try {
    // Fetch redirects from backend
    // Since middleware runs on edge, we should ideally cache this heavily or use a KV store.
    // For this implementation, we will fetch it with a Next.js revalidation cache (e.g., every 60 seconds)
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(apiUrl('/seo/redirects'), {
      next: { revalidate: 60 }, // Cache for 60 seconds to avoid slamming the DB on every request
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (res.ok) {
      const redirects = await res.json();
      
      const match = redirects.find((r: any) => r.source_url === pathname || r.source_url === pathname + '/');
      
      if (match) {
        const url = request.nextUrl.clone();
        
        if (match.target_url.startsWith('http')) {
          // Absolute redirect
          return NextResponse.redirect(match.target_url, { status: match.status_code || 301 });
        } else {
          // Relative redirect
          url.pathname = match.target_url;
          return NextResponse.redirect(url, { status: match.status_code || 301 });
        }
      }
    }
  } catch (error) {
    console.error('Middleware redirect fetch failed', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
