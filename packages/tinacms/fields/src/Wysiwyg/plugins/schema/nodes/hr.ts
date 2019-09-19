import { SchemaNodePlugin } from '../..'

/**
 * horizontal_rule
 */
export const horizontal_rule = {
  group: 'block',
  allowGapCursor: true,
  parseDOM: [{ tag: 'hr' }],
  toDOM() {
    return ['hr']
  },
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'horizontal_rule',
  node: horizontal_rule,
} as SchemaNodePlugin
