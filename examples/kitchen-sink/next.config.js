/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts'],
  rewrites: async () => [
    {
      source: '/admin',
      destination: '/admin/index.html',
    },
  ],
};

module.exports = nextConfig;
