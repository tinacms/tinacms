import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'dropBox',
      label: 'DropBox',
      inline: true,
      fields: [
        {
          name: 'title',
          label: 'Short Description',
          type: 'string',
          required: true,
        },
        {
          name: 'body',
          label: 'Expanded Information',
          type: 'rich-text',
          required: true,
          templates: [
            {
              name: 'dropBox',
              label: 'DropBox',
              inline: true,
              fields: [
                {
                  name: 'title',
                  label: 'Short Description',
                  type: 'string',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
