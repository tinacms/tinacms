export function orderPosts(posts) {
  function sortByDate(a, b) {
    const dateA = new Date(a.data.date).getTime()
    const dateB = new Date(b.data.date).getTime()
    return dateB - dateA
  }
  return posts.slice().sort(sortByDate)
}

const detectShortcodes = /\{\{(.*?)\}\}/gm
const preStrip = (content) => {
  return content.replace(detectShortcodes, '')
}

export async function stripMarkdown(content): Promise<string> {
  const remark = require('remark')
  const strip = require('strip-markdown')
  const preprocessedContent = preStrip(content)
  return new Promise((resolve, reject) => {
    remark()
      .use(strip)
      .process(preprocessedContent, (err, processedContent) => {
        if (err) reject(err)
        resolve(String(processedContent))
      })
  })
}

function removeEndingPunctuation(content: string): string {
  return content.replace(/[^A-Za-z0-9]$/, '')
}

function truncateAtWordBoundary(content: string, length: Number): string {
  let truncatedLength = 0
  let truncatedContent = ''
  for (let word of content.split(/\s+/)) {
    if (truncatedContent.length + word.length < length) {
      truncatedContent += ` ${word}`
    } else {
      return truncatedContent
    }
  }
  return truncatedContent
}

const whitespace = /\s+/gm

export async function formatExcerpt(
  content,
  length = 200,
  ellipsis = '&hellip;'
) {
  const plain = await (await stripMarkdown(content)).replace(whitespace, ' ')
  const plainTextExcerpt = truncateAtWordBoundary(plain, length)

  if (plain.length > plainTextExcerpt.length) {
    return removeEndingPunctuation(plainTextExcerpt) + ellipsis
  }

  return plainTextExcerpt
}

export function formatDate(fullDate) {
  let date = new Date(fullDate)
  // normalizes UTC with local timezone
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  const dateOptions: Intl.DateTimeFormatOptions = {
    formatMatcher: 'best fit',
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', dateOptions)
}

export const isRelevantPost = (post: { date: string; last_edited: string }) => {
  if (post.last_edited) {
    return (
      new Date(post.last_edited).getTime() >= new Date('2021-04-01').getTime()
    )
  }
  return new Date(post.date).getTime() >= new Date('2021-04-01').getTime()
}
