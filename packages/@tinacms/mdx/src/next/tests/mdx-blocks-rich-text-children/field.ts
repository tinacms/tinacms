import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Cta',
      label: 'Call-to-action',
      fields: [{ type: 'rich-text', name: 'children' }],
    },
  ],
}
