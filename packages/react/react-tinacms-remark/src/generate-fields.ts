import { RemarkNode } from './remark-node'
import { Field } from '@tinacms/core'

export function generateFields(post: RemarkNode): Field[] {
  let frontmatterFields = Object.keys(post.rawFrontmatter).map(key => ({
    component: 'text',
    name: `rawFrontmatter.${key}`,
  }))

  return [
    ...frontmatterFields,
    { component: 'markdown', name: 'rawMarkdownBody' },
  ]
}
