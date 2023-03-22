import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Test',
      label: 'Two Column Layout',
      fields: [
        {
          name: 'leftColumn',
          label: 'Left Column',
          type: 'rich-text',
        },
        {
          name: 'rightColumn',
          label: 'Right Column',
          type: 'rich-text',
          templates: [
            {
              name: 'Highlight',
              label: 'Highlight block',
              fields: [{ name: 'content', label: 'Body', type: 'rich-text' }],
            },
          ],
        },
      ],
    },
  ],
}
