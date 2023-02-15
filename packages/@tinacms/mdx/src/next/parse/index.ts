import { RichTypeInner } from '@tinacms/schema-tools'
import { Root } from 'mdast'
import { fromMarkdown } from './markdown'
import { fromMarkdown as fromMDX } from './mdx'
import { compact } from 'mdast-util-compact'
import { postProcessor } from './post-processing'

export const parseMDX = (
  value: string,
  field: RichTypeInner,
  imageCallback?: (s: string) => string
) => {
  if (field.parser?.type === 'markdown') {
    const tree = fromMarkdown(value, field)
    return postProcess(tree)
  }
  const tree = fromMDX(value, field)
  return postProcess(tree)
}

const postProcess = (tree: Root) => {
  // Some of our processing results in adjacent nodes of the same type
  return postProcessor(compact(tree))
}
