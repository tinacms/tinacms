import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Quote',
      fields: [
        {
          name: 'description',
          type: 'rich-text',
        },
        {
          name: 'children',
          type: 'rich-text',
        },
      ],
    },
  ],
}
