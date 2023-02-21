import { RichTypeInner } from '@tinacms/schema-tools'

export const field: RichTypeInner = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
  templates: [
    {
      name: 'callout',
      label: 'Callout',
      match: { start: '{%', end: '%}' },
      fields: [
        { name: 'type', type: 'string', options: ['note', 'warning'] },
        {
          name: 'children',
          type: 'rich-text',
        },
      ],
    },
  ],
}
