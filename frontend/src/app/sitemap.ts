import { MetadataRoute } from 'next';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';
import { PAGE_DEFAULTS } from '../utils/seo';
import { SITE_URL, parseSiteUrl } from '../utils/site';

// Google states plainly that it ignores <changefreq> and <priority>, so they are not produced
// here. It does read <lastmod>, which every entry below carries.
const toDate = (value: unknown) => {
  if (!value) return undefined;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const newest = (dates: (Date | undefined)[]) => {
  const valid = dates.filter(Boolean) as Date[];
  return valid.length ? new Date(Math.max(...valid.map((date) => date.getTime()))) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const globalSeo = await safeFetch(apiUrl('/seo/global'), null, { next: { revalidate: 60 } });
  if (globalSeo && (globalSeo.sitemap_status === 0 || globalSeo.sitemap_status === false)) {
    return []; // Return empty if disabled
  }

  const baseUrl = (parseSiteUrl(globalSeo?.site_url)?.origin || SITE_URL).replace(/\/+$/, '');
  const data = await safeFetch(apiUrl('/seo/sitemap-data'), null, { next: { revalidate: 60 } });

  const posts = (Array.isArray(data?.posts) ? data.posts : []) as any[];
  const projects = (await safeFetch(apiUrl('/projects'), [], { next: { revalidate: 60 } })) as any[];
  const activeProjects = (Array.isArray(projects) ? projects : []).filter(
    (project) => project?.id && project.status === 'active'
  );

  // The standard pages are assembled from content that has no single timestamp of its own, so they
  // report the most recent change anywhere on the site. That is honest and it is what tells a
  // crawler something has moved.
  const siteUpdated =
    newest([
      toDate(globalSeo?.updated_at),
      ...posts.map((post) => toDate(post.updated_at)),
      ...activeProjects.map((project) => toDate(project.updated_at || project.created_at)),
    ]) || new Date();

  // Every standard page is listed unless Admin → SEO explicitly marks it "no index".
  const hidden = new Set<string>(Array.isArray(data?.noindex) ? data.noindex : []);
  const sitemapEntries: MetadataRoute.Sitemap = Object.entries(PAGE_DEFAULTS)
    .filter(([slug]) => !hidden.has(slug))
    .map(([, page]) => ({
      url: `${baseUrl}${page.path === '/' ? '' : page.path}`,
      lastModified: siteUpdated,
    }));

  for (const post of posts) {
    const slug = String(post.slug || '').trim();
    if (!slug) continue;
    sitemapEntries.push({
      url: `${baseUrl}/blog/${encodeURIComponent(slug)}`,
      lastModified: toDate(post.updated_at) || siteUpdated,
    });
  }

  // Project pages (/projects/<id>), listed unless the projects page itself is hidden.
  if (!hidden.has('projects')) {
    for (const project of activeProjects) {
      sitemapEntries.push({
        url: `${baseUrl}/projects/${encodeURIComponent(String(project.id))}`,
        lastModified: toDate(project.updated_at || project.created_at) || siteUpdated,
      });
    }
  }

  return sitemapEntries;
}
