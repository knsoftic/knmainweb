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
    ],
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