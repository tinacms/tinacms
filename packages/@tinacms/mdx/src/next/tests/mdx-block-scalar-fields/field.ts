import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Greeting',
      label: 'Greeting',
      inline: true,
      fields: [{ type: 'string', name: 'message' }],
    },
    {
      name: 'MaybeShow',
      label: 'Maybe Show',
      fields: [{ type: 'boolean', name: 'toggle' }],
    },
    {
      name: 'Tags',
      label: 'Tags',
      fields: [{ type: 'string', name: 'items', list: true }],
    },
    {
      name: 'Count',
      label: 'Count',
      fields: [{ type: 'number', name: 'number' }],
    },
    {
      name: 'Date',
      label: 'Date',
      fields: [{ type: 'datetime', name: 'here' }],
    },
    {
      name: 'Ratings',
      label: 'Ratings',
      fields: [{ type: 'number', name: 'value', list: true }],
    },
  ],
}
