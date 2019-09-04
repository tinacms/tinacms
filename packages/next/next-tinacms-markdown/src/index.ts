// @ts-ignore the types are wrong?
import matter from 'gray-matter'

interface MarkdownCollection {
  path: string
  ctx: {
    (filename: string): string
    keys(): string[]
  }
}

/**
 * Parses markdown files retrieved via webpack context.
 *
 * TODO: Some form of this could be generic.
 */
export function loadMarkdown({ ctx, path }: MarkdownCollection) {
  // Get posts from folder
  const filenames = ctx.keys()
  const files = filenames.map(ctx)

  return filenames.map((filename, index) => {
    const slug = slugify(filename)
    const document = matter(files[index])
    return {
      filename: `${path}/${filename.replace('./', '')}`,
      document: {
        content: document.content,
        frontmatter: document.data,
      },
      slug,
    }
  })
}

/**
 * Generates a slug based on the filename
 */
function slugify(filename: string) {
  return filename
    .replace(/^.*[\\\/]/, '')
    .split('.')
    .slice(0, -1)
    .join('.')
}
