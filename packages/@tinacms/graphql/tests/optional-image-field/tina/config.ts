import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Post',
      name: 'post',
      path: 'posts',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'string',
        },
        {
          name: 'coverImage',
          label: 'Cover Image',
          type: 'image',
        },
        {
          name: 'heroImage',
          label: 'Hero Image',
          type: 'image',
          required: true,
        },
        {
          name: 'hero',
          label: 'Hero',
          type: 'object',
          fields: [{ name: 'image', label: 'Image', type: 'image' }],
        },
        {
          name: 'blocks',
          label: 'Blocks',
          type: 'object',
          list: true,
          templates: [
            {
              name: 'feature',
              label: 'Feature',
              fields: [
                { name: 'title', label: 'Title', type: 'string' },
                { name: 'image', label: 'Image', type: 'image' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default { schema };
