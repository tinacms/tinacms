import matter from 'gray-matter'
const fg = require('fast-glob')
var fs = require('fs')
var path = require('path')

export default async function fetchGuides() {
  const directory = path.resolve('./content/guides')
  const files = await fg(directory + '/**/*.md')

  return files.map((fileName) => {
    const isIndex = fileName.endsWith('/index.md')
    const fullPath = path.resolve(directory, fileName)

    const slug = fullPath
      .match(new RegExp(`.+?\/guides\/(.+?)$`))[1]
      .split('.')
      .slice(0, -1)
      .join('.')

    const file = fs.readFileSync(fullPath)
    const doc = matter(file)
    let guideTitle = null
    if (!isIndex) {
      const guideMeta = JSON.parse(
        fs.readFileSync(`${path.dirname(fullPath)}/meta.json`)
      )
      guideTitle = guideMeta.title
    }
    return {
      data: { ...doc.data, slug, guideTitle },
      content: doc.content,
    }
  })
}
