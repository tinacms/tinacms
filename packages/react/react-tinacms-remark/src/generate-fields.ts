import { RemarkNode } from './remark-node'

export function generateFields(post: RemarkNode) {
  let usingRawFrontmatter = post.fields && post.rawFrontmatter
  let frontmatter = usingRawFrontmatter ? post.rawFrontmatter : post.frontmatter

  let prefix = usingRawFrontmatter ? 'rawFrontmatter' : 'frontmatter'

  let frontmatterFields = Object.keys(frontmatter).map(key => ({
    component: 'text',
    name: `${prefix}.${key}`,
  }))

  return [
    ...frontmatterFields,
    { component: 'textarea', name: 'rawMarkdownBody' },
  ]
}
