import { SchemaMarkPlugin } from '../..'

/**
 * code
 */
const code = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return ['code']
  },
}

export default {
  __type: 'wysiwyg:schema:mark',
  name: 'code',
  mark: code,
} as SchemaMarkPlugin
