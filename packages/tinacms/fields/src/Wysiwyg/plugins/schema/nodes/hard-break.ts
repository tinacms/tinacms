import { SchemaNodePlugin } from '../..'

/**
 * hard_break
 */
export const hard_break = {
  inline: true,
  group: 'inline',
  selectable: false,
  parseDOM: [{ tag: 'br' }],
  toDOM() {
    return ['br']
  },
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'hard_break',
  node: hard_break,
} as SchemaNodePlugin
