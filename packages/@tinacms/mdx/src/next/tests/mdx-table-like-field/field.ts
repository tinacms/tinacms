import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'TestComponent',
      label: 'Test component',
      fields: [
        {
          label: 'Rows',
          name: 'rows',
          type: 'object',
          list: true,
          fields: [
            {
              label: 'Cells',
              name: 'celss',
              list: true,
              type: 'string',
            },
            {
              label: 'Is Header',
              name: 'isHeader',
              type: 'boolean',
            },
          ],
        },
      ],
    },
    {
      name: 'TestComponent2',
      label: 'Test component 2',
      fields: [
        {
          label: 'Rows',
          name: 'rows',
          type: 'object',
          list: true,
          fields: [
            {
              label: 'Cells',
              name: 'celss',
              list: true,
              type: 'number',
            },
            {
              label: 'Is Header',
              name: 'isHeader',
              type: 'boolean',
            },
          ],
        },
      ],
    },
  ],
}
