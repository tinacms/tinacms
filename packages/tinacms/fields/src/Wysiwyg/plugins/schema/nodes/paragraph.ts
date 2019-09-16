import { Node } from 'prosemirror-model'
import { docAttrs, getAttrs, domAttrs } from '../../../schema/nodes/utils'
import { SchemaNodePlugin } from '../..'

export const paragraph = {
  content: 'inline*',
  marks: '_',
  attrs: {
    class: { default: '' },
    id: { default: '' },
  },
  group: 'block',
  parseDOM: [{ tag: 'p', getAttrs }],
  toDocument(node: Node) {
    return ['p', docAttrs(node.attrs), 0]
  },
  toDOM(node: Node) {
    return ['p', domAttrs(node.attrs), 0]
  },
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'paragraph',
  node: paragraph,
} as SchemaNodePlugin
