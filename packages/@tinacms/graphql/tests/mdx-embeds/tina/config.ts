import { Schema } from '@tinacms/schema-tools'

export const schema: Schema = {
  collections: [
    {
      name: 'post',
      path: '',
      fields: [
        {
          name: 'body',
          type: 'rich-text',
          isBody: true,
          parser: { type: 'mdx' },
          templates: [
            {
              name: 'Quote',
              fields: [
                {
                  name: 'description',
                  type: 'rich-text',
                },
                {
                  name: 'children',
                  type: 'rich-text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default { schema }
