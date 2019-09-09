import { RemarkNode } from './remark-node'

export function generateFields(post: RemarkNode) {
  let usingRawFrontmatter = post.fields && post.fields.rawFrontmatter
  let frontmatter = usingRawFrontmatter
    ? post.fields.rawFrontmatter
    : post.frontmatter

  let prefix = usingRawFrontmatter ? 'fields.rawFrontmatter' : 'frontmatter'

  let frontmatterFields = Object.keys(frontmatter).map(key => ({
    component: 'text',
    name: `${prefix}.${key}`,
  }))

  return [
    ...frontmatterFields,
    { component: 'textarea', name: 'rawMarkdownBody' },
  ]
}
