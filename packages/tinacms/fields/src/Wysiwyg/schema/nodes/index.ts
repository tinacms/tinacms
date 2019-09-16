import { tables } from '../../plugins/schema/nodes/tables'

import blockquote from '../../plugins/schema/nodes/blockquote'
import bullet_list from '../../plugins/schema/nodes/list-bullet'
import code_block from '../../plugins/schema/nodes/code-block'
import hard_break from '../../plugins/schema/nodes/hard-break'
import heading from '../../plugins/schema/nodes/heading'
import horizontal_rule from '../../plugins/schema/nodes/hr'
import image from '../../plugins/schema/nodes/image'
import list_item from '../../plugins/schema/nodes/list-item'
import ordered_list from '../../plugins/schema/nodes/list-ordered'
import paragraph from '../../plugins/schema/nodes/paragraph'
import text from '../../plugins/schema/nodes/text'

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
  ...tables,

  // Plugins
  paragraph: paragraph.node,
  blockquote: blockquote.node,
  horizontal_rule: horizontal_rule.node,
  heading: heading.node,
  image: image.node,
  code_block: code_block.node,
  text: text.node,
  hard_break: hard_break.node,
  ordered_list: ordered_list.node,
  bullet_list: bullet_list.node,
  list_item: list_item.node,
}
