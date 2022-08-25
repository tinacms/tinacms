module.exports = {
  siteUrl: 'https://tina.io',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: ['/api/*', '/github/*', '/rss.xml', '/blog/page/*'],
      },
      { userAgent: '*', allow: '/' },
    ],
  },
  exclude: ['/api/*', '/github/*', '/rss.xml', '/blog/page/*'],
  sitemapSize: 7000,
  transform: async (config, path) => {
    const listOfMinorPaths = [
      '/privacy-notice',
      '/security',
      '/terms-of-service',
    ]
    if (listOfMinorPaths.includes(path)) {
      return {
        loc: path,
        priority: 0.3,
      }
    }
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
      }
    }
    if (path.indexOf('/docs/') > -1) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.5,
      }
    }
    if (path.indexOf('/guides/') > -1) {
      return {
        loc: path,
        priority: 0.5,
      }
    }
    if (path.indexOf('/blog/') > -1) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.5,
      }
    }
    return {
      loc: path,
      priority: 0.7,
      changefreq: 'weekly',
    }
  },
}
