import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
  templates: [
    {
      name: 'someFeature',
      label: 'Some feature',
      match: { start: '[', end: ']', name: 'recent-posts' },
      fields: [{ name: '_value', type: 'string' }],
    },
  ],
}
