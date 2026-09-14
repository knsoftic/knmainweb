const isDev = process.env.NODE_ENV !== 'production';

// In development the API (and its /uploads) runs on the local machine, which next/image blocks by default.
const devImagePatterns = isDev
  ? [
      { protocol: 'http', hostname: '127.0.0.1', port: '5000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
    ]
  : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Don't advertise the framework and its version to anyone probing for known weaknesses.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.knsoftic.com',
      },
      ...devImagePatterns,
    ],
    ...(isDev ? { dangerouslyAllowLocalIP: true } : {}),
    // The defaults plus 480. Cards and the hero display at roughly 370-470px on laptops and
    // monitors; without a step between 384 and 640 they all rounded up to 640, sending well over
    // twice the pixels needed. Must stay below the smallest device size (640).
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480],
  },
  async headers() {
    // Sent on every page. Deliberately conservative: each one closes a specific hole without
    // being able to block a script, style or image the site actually needs.
    const securityHeaders = [
      // Only ever reach this site over HTTPS, for a year, including subdomains.
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      // Treat every file as the type the server declared - an upload cannot pose as a script.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // No other site may embed these pages, so the site cannot be used for clickjacking.
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      // Send the full address only to ourselves; other sites see the domain alone.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // The site needs none of these, so refuse them outright.
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // The template's CSS, fonts and images in public/assets. Their names never change, so a
        // visitor should download them once rather than on every page. A deployment that changes
        // one is picked up because the file's timestamp changes and the browser revalidates.
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/portfolio',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/admin/portfolio-products',
        destination: '/admin/projects',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;