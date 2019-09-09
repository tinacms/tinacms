import { RemarkNode } from './remark-node'
import * as yaml from 'js-yaml'

export function toMarkdownString(remark: RemarkNode) {
  let usingRawFrontmatter = remark.fields && remark.fields.rawFrontmatter
  let frontmatter = usingRawFrontmatter
    ? remark.fields.rawFrontmatter
    : remark.frontmatter

  return (
    '---\n' + yaml.dump(frontmatter) + '---\n' + (remark.rawMarkdownBody || '')
  )
}
