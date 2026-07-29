import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { resolveImageUrl } from '../utils/image-url';
import { apiUrl } from '../utils/api-url';
import { safeFetch } from '../utils/safe-fetch';

async function fetchGlobalSeo() {
  return await safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } });
}

export async function generateMetadata(): Promise<Metadata> {
  const globalSeo = await fetchGlobalSeo();
  
  return {
    title: {
      template: `%s | ${globalSeo.website_title || 'KN Softic'}`,
      default: globalSeo.meta_title || globalSeo.website_title || 'KN Softic | Top Software House & IT Training Institute',
    },
    description: globalSeo.meta_description || 'KN Softic is a professional software house and IT institute. We provide top-notch web development, app development, and professional IT training courses.',
    keywords: globalSeo.keywords ? globalSeo.keywords.split(',').map((k: string) => k.trim()) : undefined,
    metadataBase: new URL(globalSeo.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.knsoftic.com'),
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: globalSeo.favicon_url ? resolveImageUrl(globalSeo.favicon_url) : '/assets/images/favicon/favicon-32x32.png',
      apple: '/assets/images/favicon/apple-touch-icon.png',
    },
    openGraph: {
      images: [
        {
          url: globalSeo.default_og_image ? resolveImageUrl(globalSeo.default_og_image) : '/assets/images/cover-object.png',
        },
      ],
      siteName: globalSeo.website_title || 'KN Softic',
    },
    verification: {
      google: globalSeo.search_console_code || undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const globalSeo = await fetchGlobalSeo();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="csrf-token" content="" />
        <link rel="manifest" href="/assets/images/favicon/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/conthrax" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" />
        <link rel="stylesheet" href="/assets/css/fontawesome.css" />
        <link rel="stylesheet" href="/assets/css/templatemo-scholar.css" />
        <link rel="stylesheet" href="/assets/css/owl.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/css/custom.css" />
        <link rel="stylesheet" href="/admin/fonts/phosphor/duotone/style.css" />
        <link rel="stylesheet" href="/admin/fonts/tabler-icons.min.css" />
        <link rel="stylesheet" href="/admin/fonts/feather.css" />
        <link rel="stylesheet" href="/admin/fonts/fontawesome.css" />
        <link rel="stylesheet" href="/admin/fonts/material.css" />
        <link rel="stylesheet" href="/admin/css/style.css" />
        <link rel="stylesheet" href="/admin/css/custom.css" />
        <link rel="stylesheet" href="https://unpkg.com/swiper@7/swiper-bundle.min.css" />

        {/* Global Schemas */}
        {globalSeo.schema_organization && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: globalSeo.schema_organization }} />
        )}
        {globalSeo.schema_local_business && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: globalSeo.schema_local_business }} />
        )}
        {globalSeo.schema_website && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: globalSeo.schema_website }} />
        )}

        {/* Bing Webmaster */}
        {globalSeo.bing_verification && (
          <meta name="msvalidate.01" content={globalSeo.bing_verification} />
        )}

        {/* Microsoft Clarity */}
        {globalSeo.clarity_id && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${globalSeo.clarity_id}");
            `}
          </Script>
        )}
        
        {/* Google Tag Manager - Head */}
        {globalSeo.gtm_id && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${globalSeo.gtm_id}');
            `}
          </Script>
        )}
      </head>
      <body>
        {/* Google Tag Manager - Body */}
        {globalSeo.gtm_id && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${globalSeo.gtm_id}`}
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
          </noscript>
        )}

        {/* Facebook Pixel */}
        {globalSeo.facebook_pixel_id && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${globalSeo.facebook_pixel_id}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* Google Analytics */}
        {globalSeo.google_analytics_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${globalSeo.google_analytics_id}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${globalSeo.google_analytics_id}');
              `}
            </Script>
          </>
        )}

        {children}
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}