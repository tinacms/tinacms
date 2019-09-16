import { SchemaMarkPlugin } from '..'

/**
 * Emphasis
 */
export default {
  __type: 'wysiwyg:schema:mark',
  name: 'em',
  mark: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      {
        style: 'font-style',
        // @ts-ignore
        getAttrs: (value: string): string => value == 'italic' && null,
      },
    ],
    toDOM() {
      return ['em']
    },
  },
} as SchemaMarkPlugin
