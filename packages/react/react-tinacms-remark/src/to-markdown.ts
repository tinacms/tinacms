import { RemarkNode } from './remark-node'
import * as yaml from 'js-yaml'

export function toMarkdownString(remark: RemarkNode) {
  return (
    '---\n' +
    yaml.dump(remark.rawFrontmatter) +
    '---\n' +
    (remark.rawMarkdownBody || '')
  )
}
