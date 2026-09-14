import type { Metadata } from 'next';
import './globals.css';
// The site's stylesheets, bundled by the build rather than linked from public/assets. That way
// they are minified, merged into as few files as possible, and served under a content hash with a
// year-long cache - where the linked copies were unminified, fetched as four separate
// render-blocking requests, and sent by the host with no cache lifetime at all.
// Order matters and is preserved: each later file overrides the ones before it, and ks-design.css
// must stay last so it wins over the template CSS.
import '../../public/assets/css/fontawesome.css';
import '../../public/assets/css/templatemo-scholar.css';
// The few admin-theme base rules the public pages rely on; the full admin theme loads in app/admin.
import '../../public/assets/css/site-base.css';
// Public-site layout and components (ks-* classes).
import '../../public/assets/css/ks-design.css';
import { resolveImageUrl } from '../utils/image-url';
import { apiUrl } from '../utils/api-url';
import { reachableImage, safeFetch } from '../utils/safe-fetch';
import { SITE_URL, parseSiteUrl } from '../utils/site';

async function fetchGlobalSeo() {
  return await safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } });
}

async function fetchSettings() {
  return await safeFetch(apiUrl('/settings'), null, { next: { revalidate: 60 } });
}

export async function generateMetadata(): Promise<Metadata> {
  const [globalSeo, settings] = await Promise.all([fetchGlobalSeo(), fetchSettings()]);
  // The share card ships with the site, so a link posted to WhatsApp or LinkedIn always has a
  // picture even if the media server is unreachable. A value set in Admin → SEO still wins.
  const SHIPPED_SHARE_IMAGE = '/og-image.jpg';
  // A share image set in Admin → SEO is used when it really loads; if that file has gone missing
  // the shipped card takes over, so a shared link never previews as an empty grey box.
  const configuredShareImage = globalSeo.default_og_image || settings?.default_og_image_url;
  const shareImage = configuredShareImage
    ? await reachableImage(resolveImageUrl(configuredShareImage), SHIPPED_SHARE_IMAGE)
    : SHIPPED_SHARE_IMAGE;
  // Only the shipped card has known dimensions; claiming them for an uploaded image would be a lie
  // to the networks that read these tags.
  const shareImageSize = shareImage === SHIPPED_SHARE_IMAGE ? { width: 1200, height: 630 } : {};

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
    // The tab icon deliberately comes from app/favicon.ico, app/icon.png and app/apple-icon.png,
    // which are part of the build. It must never depend on the media server being up.
    manifest: '/assets/images/favicon/site.webmanifest',
    openGraph: {
      images: [
        {
          url: shareImage,
          ...shareImageSize,
        },
      ],
      siteName: globalSeo.website_title || 'KN Softic',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      images: [shareImage],
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
        {/* Each extra origin costs a DNS lookup and a TLS handshake before its file can even start
            downloading. Warming the font origins here overlaps that setup with the HTML download. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
        {/* Conthrax, the headline font. Its @font-face is in ks-design.css; preloading the file here
            means the browser starts fetching it as soon as it reads the page, instead of only after
            discovering it inside a stylesheet. */}
        <link
          rel="preload"
          href="https://fonts.cdnfonts.com/s/17842/conthrax-sb.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
