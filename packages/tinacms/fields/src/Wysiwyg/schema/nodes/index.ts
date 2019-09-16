import { image } from './image'
import { tables } from './tables'
import { paragraph } from './paragraph'
import { blockquote } from './blockquote'
import { horizontal_rule } from './hr'
import { list_item } from './list-item'
import { bullet_list } from './list-bullet'
import { ordered_list } from './list-ordered'
import { hard_break } from './hard-break'
import { heading } from './heading'
import { code_block } from './code-block'
import { text } from './text'

/**
 * buildNodes
 */
export interface NodesOptions {
  code_block?: boolean
  blockquote?: boolean
  horizontal_rule?: boolean
  heading?: boolean
  image?: boolean
  table?: boolean
}

export function buildNodes(blockContent?: boolean, options: NodesOptions = {}) {
  let _nodes: any = {
    text: NODES.text,
    hard_break: NODES.hard_break,
  }

  if (options.image) _nodes.image = NODES.image

  if (blockContent) {
    _nodes.doc = blockDoc
    _nodes.paragraph = NODES.paragraph

    if (options.code_block) _nodes.code_block = NODES.code_block
    if (options.blockquote) _nodes.blockquote = NODES.blockquote
    if (options.horizontal_rule) _nodes.horizontal_rule = NODES.horizontal_rule
    if (options.heading) _nodes.heading = NODES.heading
    if (options.table) {
      _nodes.table = NODES.table
      _nodes.table_row = NODES.table_row
      _nodes.table_header = NODES.table_header
      _nodes.table_cell = NODES.table_cell
    }
  } else {
    _nodes.doc = inlineDoc
  }

  return _nodes
}

/**
 * inlineDoc
 */
const inlineDoc = { content: 'inline*', marks: '_' }

const blockDoc = { content: 'block+' }

/**
 * nodes
 */
export const NODES = {
  doc: blockDoc,
  paragraph,
  blockquote,
  horizontal_rule,
  heading,
  image,
  code_block,
  text,
  hard_break,
  ordered_list,
  bullet_list,
  list_item,
  ...tables,
}
