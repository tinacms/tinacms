const path = require('path')
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    // This app is using React 18 (and Next 13). This shouldn't be an issue outside
    // of the monorepo, but since `tinacms` has a devDependency on React, it loads the wrong version
    config.resolve.alias['react'] = path.resolve('./node_modules/react')

    return config
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ]
  },
}
