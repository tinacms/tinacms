import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Table',
      fields: [
        {
          name: 'rows',
          type: 'object',
          list: true,
          fields: [
            {
              name: 'columns',
              type: 'object',
              list: true,
              fields: [
                {
                  name: 'content',
                  type: 'rich-text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
