import { MetadataRoute } from 'next';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.knsoftic.com';
  
  const globalSeo = await safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } });
  
  if (globalSeo?.robots_txt_content) {
    // Since MetadataRoute.Robots doesn't support raw string parsing easily,
    // we could just parse basic rules from their text, but standard object 
    // return is expected by Next.js.
    // Let's implement a safe default + user overrides if possible.
    // The easiest robust way for Next.js is returning static defaults,
    // BUT to fully honor the raw text, we'd need a dynamic API route instead of `robots.ts`.
    // However, `robots.ts` is standard. Let's map it.
  }

  // Safe Defaults
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
