import { MetadataRoute } from 'next';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.knsoftic.com';
  
  let data: any = { pages: [], posts: [], projects: [], courses: [] };
  let sitemapStatus = true;
  
  const globalSeo = await safeFetch(apiUrl('/seo/global'), null, { next: { revalidate: 60 } });
  if (globalSeo && globalSeo.sitemap_status === 0) {
    sitemapStatus = false;
  }

  if (sitemapStatus) {
    const sitemapData = await safeFetch(apiUrl('/seo/sitemap-data'), null, { next: { revalidate: 60 } });
    if (sitemapData) {
      data = sitemapData;
    }
  }

  if (!sitemapStatus) {
    return []; // Return empty if disabled
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static Pages
  const standardPages = ['home', 'about', 'services', 'projects', 'products', 'blog', 'courses', 'team', 'contact'];
  
  for (const page of standardPages) {
    // Only include if not explicitly de-indexed
    if (!data.pages || data.pages.length === 0 || data.pages.includes(page)) {
      sitemapEntries.push({
        url: `${baseUrl}${page === 'home' ? '' : `/${page}`}`,
        lastModified: new Date(),
        changeFrequency: page === 'home' ? 'daily' : 'weekly',
        priority: page === 'home' ? 1.0 : 0.8,
      });
    }
  }

  // Dynamic Posts
  for (const post of data.posts as any[]) {
    sitemapEntries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return sitemapEntries;
}
