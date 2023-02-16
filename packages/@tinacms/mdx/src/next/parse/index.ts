import { RichTypeInner } from '@tinacms/schema-tools'
import { Root } from 'mdast'
import { fromMarkdown } from './markdown'
import { fromMarkdown as fromMDX } from './mdx'
import { compact } from 'mdast-util-compact'
import { postProcessor } from './post-processing'
import { remarkToSlate } from '../../parse/remarkToPlate'

export const parseMDX = (
  value: string,
  field: RichTypeInner,
  imageCallback?: (s: string) => string
) => {
  if (field.parser?.type === 'markdown') {
    const tree = fromMarkdown(value, field)
    return postProcess(tree, field)
  }
  const tree = fromMDX(value, field)
  return postProcess(tree, field)
}

const postProcess = (tree: Root, field: RichTypeInner) => {
  // Some of our processing results in adjacent nodes of the same type
  return postProcessor(compact(tree), field)
}
