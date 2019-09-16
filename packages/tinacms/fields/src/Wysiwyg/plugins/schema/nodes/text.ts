import { SchemaNodePlugin } from '../..'

/**
 * text
 */
export const text = {
  group: 'inline',
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'text',
  node: text,
} as SchemaNodePlugin
