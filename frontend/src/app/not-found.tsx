import { SiteShell } from '../components/layout/site-shell';
import SiteNotFound from './(site)/not-found';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';

// Unmatched URLs render here, outside the (site) layout, so wrap the branded 404 in the site's header and footer.
export default async function NotFound() {
  const settings = await safeFetch(apiUrl('/settings'), null, { next: { revalidate: 60 } }, { optional: true });

  return (
    <SiteShell initialSettings={settings}>
      <SiteNotFound />
    </SiteShell>
  );
}
