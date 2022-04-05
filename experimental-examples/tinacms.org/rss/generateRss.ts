require('dotenv').config()

import { fetchRelevantBlogs } from '../data-api/fetchBlogs'
import { formatExcerpt, orderPosts } from '../utils/blog_helpers'
const fs = require('fs')

const blogPostsRssXml = async (blogPosts) => {
  let latestPostDate: string = ''
  let rssItemsXml = ''
  for (let post of blogPosts) {
    const postDate = Date.parse(post.data.date)
    const excerpt = await formatExcerpt(post.content, 1000, '…')
    if (!latestPostDate || postDate > Date.parse(latestPostDate)) {
      latestPostDate = post.createdAt
    }
    rssItemsXml += `<item>
      <title>${post.data.title}</title>
      <link>https://tinacms.org/blog/${post.data.slug}</link>
      <pubDate>${post.data.date}</pubDate>
      <description><![CDATA[${excerpt}]]>
      </description>
    </item>`
  }
  return {
    rssItemsXml,
    latestPostDate,
  }
}

const getRssXml = async (blogPosts) => {
  const { rssItemsXml, latestPostDate } = await blogPostsRssXml(blogPosts)
  return `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>TinaCMS Blog RSS Feed</title>
      <link>https://tinacms.org/</link>
      <description>A site editor for the modern web</description>
      <language>en</language>
      <lastBuildDate>${latestPostDate}</lastBuildDate>
      ${rssItemsXml}
    </channel>
  </rss>`
}

const geerateRss = async () => {
  const relevantPosts = await fetchRelevantBlogs()
  fs.writeFileSync('public/rss.xml', await getRssXml(orderPosts(relevantPosts)))
}

try {
  geerateRss()
} catch (e) {
  console.error(e)
  process.kill(1)
}
