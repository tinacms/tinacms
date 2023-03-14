import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown', skipEscaping: 'html' },
  templates: [
    {
      name: 'center',
      label: 'Centered HTML',
      match: {
        start: '{{<',
        name: 'center',
        end: '>}}',
      },
      fields: [
        {
          name: 'children',
          label: 'Children',
          type: 'rich-text',
        },
      ],
    },
  ],
}
