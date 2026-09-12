import Script from 'next/script';
import { JsonLd } from './json-ld';
import { getRealSocialLinks, getSetting, toOpeningHours, toPostalAddress } from '../../utils/settings';
import { SITE_NAME, SITE_URL, parseSiteUrl } from '../../utils/site';

// Tracking IDs are interpolated into inline scripts, so only well-formed IDs are accepted.
const validId = (value: unknown, pattern: RegExp) => {
  const id = typeof value === 'string' ? value.trim() : '';
  return pattern.test(id) ? id : null;
};

type SiteScriptsProps = { globalSeo: any; settings: any };

/** Structured data and analytics for public pages only (the admin panel doesn't render this). */
export function SiteScripts({ globalSeo, settings }: SiteScriptsProps) {
  const gaId = validId(globalSeo?.google_analytics_id, /^(G|UA|AW|GT)-[A-Z0-9-]+$/i);
  const gtmId = validId(globalSeo?.gtm_id, /^GTM-[A-Z0-9]+$/i);
  const clarityId = validId(globalSeo?.clarity_id, /^[a-z0-9]+$/i);
  const pixelId = validId(globalSeo?.facebook_pixel_id, /^\d+$/);

  const siteUrl = parseSiteUrl(globalSeo?.site_url)?.origin || SITE_URL;
  const name = globalSeo?.website_title || getSetting(settings, ['site_name', 'company_name'], SITE_NAME);
  // Google reads this logo for knowledge panels and search results, so it points at a square image
  // shipped with the site rather than one on the media server, which would take the entry down
  // with it if that server were ever unreachable.
  const logo = `${siteUrl}/assets/images/kn-softic-mark.png`;

  // The number quoted here must be the one on the page: Google cross-checks it against the
  // business profile, and a mismatch weakens local ranking. The footer shows contact_phone first.
  const primaryPhone = getSetting(settings, ['contact_phone', 'whatsapp_number', 'customer_care_number', 'phone_number']);
  const landline = getSetting(settings, ['phone_number']);

  const addressText = getSetting(settings, ['office_address', 'contact_address', 'company_address']);
  const postalAddress = toPostalAddress(addressText, name);
  const openingHours = toOpeningHours(getSetting(settings, ['working_hours']));

  const organization = globalSeo?.schema_organization || {
    '@context': 'https://schema.org',
    // A software house that also runs a training institute is both of these.
    '@type': ['LocalBusiness', 'EducationalOrganization'],
    '@id': `${siteUrl}/#organization`,
    name,
    url: siteUrl,
    logo,
    image: logo,
    description: getSetting(settings, ['company_description', 'website_tagline']) || undefined,
    email: getSetting(settings, ['primary_email', 'contact_email']) || undefined,
    telephone: primaryPhone || undefined,
    address: postalAddress || addressText || undefined,
    ...(openingHours ? { openingHours } : {}),
    ...(landline && landline !== primaryPhone
      ? {
          contactPoint: [
            { '@type': 'ContactPoint', telephone: primaryPhone, contactType: 'customer support', areaServed: 'PK' },
            { '@type': 'ContactPoint', telephone: landline, contactType: 'sales', areaServed: 'PK' },
          ],
        }
      : {}),
    // Only profiles that actually exist: a link to a network's front page is an invalid signal.
    sameAs: getRealSocialLinks(settings).map((link) => link.url),
  };

  const website = globalSeo?.schema_website || {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: siteUrl,
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={globalSeo?.schema_local_business} />
      <JsonLd data={website} />

      {clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}

      {gtmId && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {pixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
    </>
  );
}
