import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
  templates: [
    {
      name: 'someFeature',
      label: 'Some feature',
      inline: true,
      match: { start: '{{<', end: '>}}', name: 'some-feature' },
      fields: [
        { name: '_value', type: 'string' },
        { name: 'children', type: 'rich-text' },
      ],
    },
  ],
}
