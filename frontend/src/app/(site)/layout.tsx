import { SiteShell } from '../../components/layout/site-shell';
import { SiteScripts } from '../../components/seo/site-scripts';
import { apiUrl } from '../../utils/api-url';
import { safeFetch } from '../../utils/safe-fetch';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Loaded on the server so the first HTML already has the real logo, contact details and WhatsApp number.
  const [settings, globalSeo, services] = await Promise.all([
    safeFetch(apiUrl('/settings'), null, { next: { revalidate: 60 } }),
    safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } }),
    // Used for the footer's service links, so they name services that actually exist.
    safeFetch(apiUrl('/services'), [], { next: { revalidate: 60 } }, { optional: true }),
  ]);

  return (
    <>
      <SiteShell initialSettings={settings} services={services}>{children}</SiteShell>
      <SiteScripts globalSeo={globalSeo} settings={settings} />
    </>
  );
}
