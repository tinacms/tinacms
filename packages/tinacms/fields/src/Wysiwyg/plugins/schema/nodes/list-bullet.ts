import { Node } from 'prosemirror-model'
import { SchemaNodePlugin } from '../..'

/**
 * bullet_list
 */
export const bullet_list = {
  content: 'list_item+',
  group: 'block',
  attrs: { tight: { default: false } },
  parseDOM: [
    {
      tag: 'ul',
      getAttrs: (dom: Element) => ({ tight: dom.hasAttribute('data-tight') }),
    },
  ],
  toDOM(node: Node) {
    return ['ul', { 'data-tight': node.attrs.tight ? 'true' : null }, 0]
  },
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'bullet_list',
  node: bullet_list,
} as SchemaNodePlugin
