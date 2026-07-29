import type { Metadata } from 'next';
import { resolveImageUrl } from './image-url';
import { apiUrl } from './api-url';
import { safeFetch } from './safe-fetch';

export async function generatePageMetadata(slug: string, dynamicOverrides?: Partial<Metadata>): Promise<Metadata> {
  const pageSeo = await safeFetch(apiUrl(`/seo/pages/${slug}?_metadata=1`), null, { next: { revalidate: 60 } });

  if (!pageSeo) return dynamicOverrides || {};

  const metadata: Metadata = {};

  if (pageSeo.seo_title) metadata.title = pageSeo.seo_title;
  if (pageSeo.meta_description) metadata.description = pageSeo.meta_description;
  if (pageSeo.keywords) metadata.keywords = pageSeo.keywords.split(',').map((k: string) => k.trim());

  if (pageSeo.canonical_url) {
    metadata.alternates = {
      canonical: pageSeo.canonical_url,
    };
  }

  metadata.robots = {
    index: pageSeo.is_index === 1,
    follow: pageSeo.is_follow === 1,
  };

  if (pageSeo.og_title || pageSeo.og_description || pageSeo.og_image) {
    metadata.openGraph = {
      title: pageSeo.og_title || pageSeo.seo_title,
      description: pageSeo.og_description || pageSeo.meta_description,
      images: pageSeo.og_image ? [{ url: resolveImageUrl(pageSeo.og_image) }] : undefined,
    };
  }

  if (pageSeo.twitter_title || pageSeo.twitter_description || pageSeo.twitter_image) {
    metadata.twitter = {
      card: 'summary_large_image',
      title: pageSeo.twitter_title || pageSeo.seo_title,
      description: pageSeo.twitter_description || pageSeo.meta_description,
      images: pageSeo.twitter_image ? [resolveImageUrl(pageSeo.twitter_image)] : undefined,
    };
  }

  // Merge with any dynamic overrides (e.g. blog post title if not set in admin)
  return { ...metadata, ...dynamicOverrides };
}

export async function getImageSeo(url: string) {
  const media = await safeFetch(apiUrl('/media'), [], { next: { revalidate: 60 } });
  if (media && media.length > 0) {
    const apiUrlBase = apiUrl('').replace(/\/api$/, '');
    const match = media.find((m: any) => m.url === url || (url && m.url === url.replace(apiUrlBase, '')));
    if (match) return match;
  }
  return { alt_text: '', title: '', description: '' };
}
