/**
 * @type {import('next').NextConfig}
 */

const config = {
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ]
  },
}

module.exports = config
