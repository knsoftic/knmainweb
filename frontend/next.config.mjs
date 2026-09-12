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