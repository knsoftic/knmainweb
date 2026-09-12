import type { Metadata } from 'next';
import { resolveImageUrl } from './image-url';
import { apiUrl } from './api-url';
import { safeFetch } from './safe-fetch';
import { SITE_NAME } from './site';

type PageDefaults = { path: string; title?: string; description: string };

/**
 * Used when a page has no row in Admin → SEO (or leaves a field empty), so every
 * page still gets its own canonical URL, title and description.
 */
export const PAGE_DEFAULTS: Record<string, PageDefaults> = {
  home: {
    path: '/',
    description: 'KN Softic is a software house and IT institute in Faisalabad, Pakistan. We build websites, apps and software, and teach industry-focused IT courses.',
  },
  about: {
    path: '/about',
    title: 'About Us',
    description: 'Learn about KN Softic, a software house and IT training institute in Faisalabad, Pakistan, and the team behind our projects and courses.',
  },
  services: {
    path: '/services',
    title: 'Our Services',
    description: 'Web development, UI/UX and graphic design, digital marketing, SEO, WordPress, Shopify, e-commerce and custom software from KN Softic.',
  },
  courses: {
    path: '/courses',
    title: 'IT Courses',
    description: 'Hands-on IT courses at KN Softic: web development, graphic design, UI/UX, digital marketing, SEO, WordPress, Shopify, video editing and more.',
  },
  projects: {
    path: '/projects',
    title: 'Projects & Products',
    description: 'Websites, software and mobile apps built by KN Softic for clients, plus ready-to-deploy products.',
  },
  team: {
    path: '/team',
    title: 'Our Team',
    description: 'Meet the developers, designers and trainers at KN Softic.',
  },
  blog: {
    path: '/blog',
    title: 'Blog',
    description: 'Articles on web development, SEO and growing your business online from the KN Softic team.',
  },
  contact: {
    path: '/contact',
    title: 'Contact Us',
    description: 'Contact KN Softic in Faisalabad about a software project, digital services or joining a course.',
  },
};

// Anything other than an explicit 0/false means "index" (older databases lack these columns).
const isEnabled = (value: unknown) => !(value === 0 || value === false || value === '0');

export async function generatePageMetadata(slug: string, dynamicOverrides?: Partial<Metadata>): Promise<Metadata> {
  const defaults = PAGE_DEFAULTS[slug] || { path: `/${slug}`, description: '' };
  const [pageSeo, globalSeo] = await Promise.all([
    safeFetch(apiUrl(`/seo/pages/${slug}?_metadata=1`), null, { next: { revalidate: 60 } }),
    safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } }),
  ]);

  const title: string | undefined = pageSeo?.seo_title || defaults.title;
  const description: string | undefined = pageSeo?.meta_description || defaults.description || undefined;
  const canonical: string = pageSeo?.canonical_url || defaults.path;
  const siteName: string = globalSeo?.website_title || SITE_NAME;
  const shareTitle = pageSeo?.og_title || (title ? `${title} | ${siteName}` : globalSeo?.meta_title || siteName);
  const shareImage = resolveImageUrl(pageSeo?.og_image || globalSeo?.default_og_image, '/assets/images/cover-object.png');

  const metadata: Metadata = {
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName,
      title: shareTitle,
      description: pageSeo?.og_description || description,
      images: [{ url: shareImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageSeo?.twitter_title || shareTitle,
      description: pageSeo?.twitter_description || pageSeo?.og_description || description,
      images: [resolveImageUrl(pageSeo?.twitter_image, shareImage)],
    },
  };

  if (title) metadata.title = title;
  if (description) metadata.description = description;
  if (pageSeo?.keywords) metadata.keywords = pageSeo.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
  if (pageSeo) {
    metadata.robots = { index: isEnabled(pageSeo.is_index), follow: isEnabled(pageSeo.is_follow) };
  }

  return { ...metadata, ...dynamicOverrides };
}

/**
 * Turns admin-entered JSON-LD into a string that is safe inside a <script> tag.
 * Accepts raw JSON or JSON wrapped in its own <script> tag; returns null if it isn't valid JSON.
 */
export function toJsonLd(raw: unknown): string | null {
  if (!raw) return null;

  let value: unknown = raw;
  if (typeof raw === 'string') {
    const text = raw.trim().replace(/^<script[^>]*>/i, '').replace(/<\/script>\s*$/i, '').trim();
    if (!text) return null;
    try {
      value = JSON.parse(text);
    } catch {
      console.warn('[toJsonLd] Ignoring structured data that is not valid JSON.');
      return null;
    }
  }

  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export async function getImageSeo(url: string) {
  const media = await safeFetch(apiUrl('/media'), [], { next: { revalidate: 60 } }, { optional: true });
  if (media && media.length > 0) {
    const apiUrlBase = apiUrl('').replace(/\/api$/, '');
    const match = media.find((m: any) => m.url === url || (url && m.url === url.replace(apiUrlBase, '')));
    if (match) return match;
  }
  return { alt_text: '', title: '', description: '' };
}
