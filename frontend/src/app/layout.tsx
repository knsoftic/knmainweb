import type { Metadata } from 'next';
import './globals.css';
import { resolveImageUrl } from '../utils/image-url';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';
import { SITE_URL, parseSiteUrl } from '../utils/site';

async function fetchGlobalSeo() {
  return await safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } });
}

async function fetchSettings() {
  return await safeFetch(apiUrl('/settings'), null, { next: { revalidate: 60 } });
}

export async function generateMetadata(): Promise<Metadata> {
  const [globalSeo, settings] = await Promise.all([fetchGlobalSeo(), fetchSettings()]);
  const favicon = globalSeo.favicon_url || settings?.favicon_url;
  const shareImage = globalSeo.default_og_image || settings?.default_og_image_url;

  // Pages set their own canonical URL (see utils/seo.ts); a site-wide one would point every page at the homepage.
  return {
    title: {
      template: `%s | ${globalSeo.website_title || 'KN Softic'}`,
      default: globalSeo.meta_title || globalSeo.website_title || 'KN Softic | Top Software House & IT Training Institute',
    },
    description: globalSeo.meta_description || 'KN Softic is a professional software house and IT institute. We provide top-notch web development, app development, and professional IT training courses.',
    keywords: globalSeo.keywords ? globalSeo.keywords.split(',').map((k: string) => k.trim()) : undefined,
    // A malformed Site URL in Admin → SEO must not take the whole site down.
    metadataBase: parseSiteUrl(globalSeo.site_url) || parseSiteUrl(SITE_URL) || new URL('https://knsoftic.com'),
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: favicon ? resolveImageUrl(favicon) : '/assets/images/favicon/favicon-32x32.png',
      apple: '/assets/images/favicon/apple-touch-icon.png',
    },
    manifest: '/assets/images/favicon/site.webmanifest',
    openGraph: {
      images: [
        {
          url: shareImage ? resolveImageUrl(shareImage) : '/assets/images/cover-object.png',
        },
      ],
      siteName: globalSeo.website_title || 'KN Softic',
    },
    verification: {
      google: globalSeo.search_console_code || undefined,
      other: globalSeo.bing_verification ? { 'msvalidate.01': globalSeo.bing_verification } : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Every stylesheet below blocks the first paint, and each extra origin costs a DNS lookup
            and a TLS handshake before its file even starts downloading. Warming all four here
            overlaps that setup with the HTML download instead of paying for it one after another. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/conthrax" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" />
        <link rel="stylesheet" href="/assets/css/fontawesome.css" />
        <link rel="stylesheet" href="/assets/css/templatemo-scholar.css" />
        <link rel="stylesheet" href="/assets/css/custom.css" />
        {/* The few admin-theme base rules the public pages rely on; the full admin theme loads in app/admin/layout.tsx. */}
        <link rel="stylesheet" href="/assets/css/site-base.css" />
        {/* Public-site layout and components (ks-* classes); loads last so it wins over the template CSS. */}
        <link rel="stylesheet" href="/assets/css/ks-design.css" />

      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
