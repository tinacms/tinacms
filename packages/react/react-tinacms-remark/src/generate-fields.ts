import { RemarkNode } from './remark-node'

export function generateFields(post: RemarkNode) {
  let frontmatterFields = Object.keys(post.fields.rawFrontmatter).map(key => ({
    component: 'text',
    name: `fields.rawFrontmatter.${key}`,
  }))

  return [
    ...frontmatterFields,
    { component: 'textarea', name: 'rawMarkdownBody' },
  ]
}
