import { toJsonLd } from '../../utils/seo';
import { apiUrl } from '../../utils/api-url';
import { safeFetch } from '../../utils/safe-fetch';

export function JsonLd({ data }: { data: unknown }) {
  const json = toJsonLd(data);
  if (!json) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** Renders the page-level structured data entered in Admin → SEO → Pages. */
export async function PageSchema({ slug }: { slug: string }) {
  const pageSeo = await safeFetch(apiUrl(`/seo/pages/${slug}?_metadata=1`), null, { next: { revalidate: 60 } }, { optional: true });
  return <JsonLd data={pageSeo?.schema_markup} />;
}
