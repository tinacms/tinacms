import { RemarkNode } from './remark-node'

export function generateFields(post: RemarkNode) {
  let frontmatterFields = Object.keys(post.frontmatter).map(key => ({
    component: 'text',
    name: `frontmatter.${key}`,
  }))

  return [
    ...frontmatterFields,
    { component: 'textarea', name: 'rawMarkdownBody' },
  ]
}
