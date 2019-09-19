import { SchemaNodePlugin } from '../..'

/**
 * text
 */
export const doc = {
  content: 'block+',
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'doc',
  node: doc,
} as SchemaNodePlugin
