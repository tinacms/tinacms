import { SchemaMarkPlugin } from '..'

export default {
  __type: 'wysiwyg:schema:mark',
  name: 'strong',
  mark: {
    parseDOM: [
      { tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      {
        tag: 'b',
        getAttrs: (node: HTMLElement) => {
          return node.style.fontWeight != 'normal' && null
        },
      },
      {
        style: 'font-weight',
        getAttrs: (value: string) => {
          return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
        },
      },
    ],
    toDOM() {
      return ['strong']
    },
  },
} as SchemaMarkPlugin
