import { apiUrl } from '../../utils/api-url';
import { safeFetch } from '../../utils/safe-fetch';
import { SITE_URL, parseSiteUrl } from '../../utils/site';

export const revalidate = 60;

// A route handler (rather than app/robots.ts) so the raw text from Admin → SEO → robots.txt is served as written.
export async function GET() {
  const globalSeo = await safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } });
  const baseUrl = (parseSiteUrl(globalSeo?.site_url)?.origin || SITE_URL).replace(/\/+$/, '');
  const sitemapLine = `Sitemap: ${baseUrl}/sitemap.xml`;

  const custom = typeof globalSeo?.robots_txt_content === 'string' ? globalSeo.robots_txt_content.trim() : '';
  const body = custom
    ? (/^sitemap:/im.test(custom) ? custom : `${custom}\n\n${sitemapLine}`)
    : ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /api/', '', sitemapLine].join('\n');

  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
