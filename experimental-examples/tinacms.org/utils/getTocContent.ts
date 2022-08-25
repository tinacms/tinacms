import toc from 'markdown-toc'

export default function getTocContent(markdown, options) {
  const tocItems = toc(markdown, options)

  const content = tocItems.json
    .map((item) => {
      const itemContent = stripMarkdownLinks(item.content)
      return `${'  '.repeat(item.lvl - 1)}- [${itemContent}](#${item.slug})\n`
    })
    .join('')

  return content
}

export function stripMarkdownLinks(markdown) {
  // strip out links if present
  const links = Array.from(markdown.matchAll(/\[(.*?)\)/g)).map(
    (link) => link[0]
  )

  links.forEach((link) => {
    // replace markdown link with link's text
    markdown = markdown.replace(link, /(?<=\[)(.*?)(?=\])/.exec(link)[0])
  })

  return markdown
}
