import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Blockquote',
      label: 'Blockquote',
      fields: [
        { type: 'string', name: 'author' },
        { type: 'rich-text', name: 'children' },
      ],
    },
  ],
}
