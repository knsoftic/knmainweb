import { MetadataRoute } from 'next';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';
import { PAGE_DEFAULTS } from '../utils/seo';
import { SITE_URL, parseSiteUrl } from '../utils/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const globalSeo = await safeFetch(apiUrl('/seo/global'), null, { next: { revalidate: 60 } });
  if (globalSeo && (globalSeo.sitemap_status === 0 || globalSeo.sitemap_status === false)) {
    return []; // Return empty if disabled
  }

  const baseUrl = (parseSiteUrl(globalSeo?.site_url)?.origin || SITE_URL).replace(/\/+$/, '');
  const data = await safeFetch(apiUrl('/seo/sitemap-data'), null, { next: { revalidate: 60 } });

  // Every standard page is listed unless Admin → SEO explicitly marks it "no index".
  const hidden = new Set<string>(Array.isArray(data?.noindex) ? data.noindex : []);
  const sitemapEntries: MetadataRoute.Sitemap = Object.entries(PAGE_DEFAULTS)
    .filter(([slug]) => !hidden.has(slug))
    .map(([slug, page]) => ({
      url: `${baseUrl}${page.path === '/' ? '' : page.path}`,
      changeFrequency: slug === 'home' || slug === 'blog' ? 'daily' : 'weekly',
      priority: slug === 'home' ? 1.0 : 0.8,
    }));

  // Dynamic Posts
  for (const post of (Array.isArray(data?.posts) ? data.posts : []) as any[]) {
    const slug = String(post.slug || '').trim();
    if (!slug) continue;
    const updated = post.updated_at ? new Date(post.updated_at) : undefined;
    sitemapEntries.push({
      url: `${baseUrl}/blog/${encodeURIComponent(slug)}`,
      lastModified: updated && !Number.isNaN(updated.getTime()) ? updated : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Project pages (/projects/<id>), listed unless the projects page itself is hidden.
  if (!hidden.has('projects')) {
    const projects = await safeFetch(apiUrl('/projects'), [], { next: { revalidate: 60 } });
    for (const project of (Array.isArray(projects) ? projects : []) as any[]) {
      if (project.status !== 'active' || !project.id) continue;
      sitemapEntries.push({
        url: `${baseUrl}/projects/${encodeURIComponent(String(project.id))}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}
