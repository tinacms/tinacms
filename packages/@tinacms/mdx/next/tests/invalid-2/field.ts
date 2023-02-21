import { RichTypeInner } from '@tinacms/schema-tools'

export const field: RichTypeInner = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
  templates: [
    {
      name: 'someFeature',
      label: 'Some feature',
      inline: true,
      match: { start: '{{%', end: '%}}', name: 'some-feature' },
      fields: [{ name: 'children', type: 'rich-text' }],
    },
  ],
}
