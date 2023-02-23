import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
  templates: [
    {
      name: 'featurePanel',
      label: 'Feature Panel',
      match: {
        start: '{{%',
        end: '%}}',
        name: 'feature-panel',
      },
      fields: [
        {
          name: '_value',
          required: true,
          isTitle: true,
          label: 'Value',
          type: 'string',
        },
      ],
    },
    {
      name: 'pullQuote',
      label: 'Pull Quote',
      match: {
        start: '{{%',
        name: 'pull-quote',
        end: '%}}',
      },
      fields: [
        {
          name: 'foo',
          label: 'foo label',
          type: 'string',
        },
        {
          name: 'children',
          label: 'Children',
          type: 'rich-text',
        },
      ],
    },
  ],
}
