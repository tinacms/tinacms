import { RichTypeInner } from '@tinacms/schema-tools'

export const field: RichTypeInner = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown', skipEscaping: 'html' },
  templates: [
    {
      name: 'someFeature',
      label: 'Some feature',
      match: { start: '{{<', end: '>}}', name: 'some-feature' },
      fields: [{ name: '_value', type: 'string' }],
    },
  ],
}
