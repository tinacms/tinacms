import { RemarkNode } from './remark-node'

export function generateFields(post: RemarkNode) {
  let frontmatterFields = Object.keys(post.rawfrontmatter).map(key => ({
    component: 'text',
    name: `rawFrontmatter.${key}`,
  }))

  return [
    ...frontmatterFields,
    { component: 'textarea', name: 'rawMarkdownBody' },
  ]
}
