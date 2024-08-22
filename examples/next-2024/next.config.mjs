/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: '/admin',
      destination: '/admin/index.html',
    },
  ],
}

export default nextConfig
