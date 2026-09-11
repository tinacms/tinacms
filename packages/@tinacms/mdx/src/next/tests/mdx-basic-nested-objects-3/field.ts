import { RichTextField } from '@tinacms/schema-tools';

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: 'Table',
      fields: [
        {
          name: 'rows',
          type: 'object',
          list: true,
          fields: [
            {
              name: 'columns',
              type: 'object',
              list: true,
              fields: [
                {
                  name: 'content',
                  type: 'rich-text',
                  templates: [
                    {
                      name: 'World',
                      // A schema-valid template needs at least one field even
                      // though this element is used with none in this fixture's
                      // markdown (a bare self-closing `<World />`).
                      fields: [{ name: 'label', type: 'string' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
