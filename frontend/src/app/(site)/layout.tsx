import { SiteShell } from '../../components/layout/site-shell';
import { SiteScripts } from '../../components/seo/site-scripts';
import { apiUrl } from '../../utils/api-url';
import { safeFetch } from '../../utils/safe-fetch';
import { getImageSize } from '../../utils/image-size';
import { resolveImageUrl } from '../../utils/image-url';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Loaded on the server so the first HTML already has the real logo, contact details and WhatsApp number.
  const [settings, globalSeo, services] = await Promise.all([
    safeFetch(apiUrl('/settings'), null, { next: { revalidate: 60 } }),
    safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } }),
    // Used for the footer's service links, so they name services that actually exist.
    safeFetch(apiUrl('/services'), [], { next: { revalidate: 60 } }, { optional: true }),
  ]);

  // The logo is uploaded through the admin panel, so its shape is only known by looking at it.
  // Giving it its real width and height lets the header and footer reserve the right space before
  // it arrives - otherwise the layout shifts the moment it loads.
  const logoSize = await getImageSize(resolveImageUrl(settings?.light_logo_url || settings?.logo_url));

  return (
    <>
      <SiteShell initialSettings={settings} services={services} logoSize={logoSize}>{children}</SiteShell>
      <SiteScripts globalSeo={globalSeo} settings={settings} />
    </>
  );
}
