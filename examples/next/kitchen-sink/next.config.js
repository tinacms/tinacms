/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts'],
  rewrites: async () => [
    {
      source: '/admin',
      destination: '/admin/index.html',
    },
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node:crypto': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
