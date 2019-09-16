import { Node } from 'prosemirror-model'
import { getAttrsWith, docAttrs, domAttrs } from '../../../schema/nodes/utils'
import { SchemaNodePlugin } from '../..'

/**
 * heading
 */
export const heading = {
  attrs: {
    level: { default: 1 },
    class: { default: '' },
    id: { default: '' },
  },
  content: 'inline*',
  marks: '_',
  group: 'block',
  defining: true,
  parseDOM: [
    { tag: 'h1', getAttrs: getAttrsWith({ level: 1 }) },
    { tag: 'h2', getAttrs: getAttrsWith({ level: 2 }) },
    { tag: 'h3', getAttrs: getAttrsWith({ level: 3 }) },
    { tag: 'h4', getAttrs: getAttrsWith({ level: 4 }) },
    { tag: 'h5', getAttrs: getAttrsWith({ level: 5 }) },
    { tag: 'h6', getAttrs: getAttrsWith({ level: 6 }) },
  ],
  toDocument(node: Node) {
    const { level, ...other } = node.attrs
    return ['h' + level, docAttrs(other), 0]
  },
  toDOM(node: Node) {
    const { level, ...other } = node.attrs
    return ['h' + level, domAttrs(other), 0]
  },
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'heading',
  node: heading,
} as SchemaNodePlugin
