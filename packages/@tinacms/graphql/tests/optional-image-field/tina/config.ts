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
      ],
    },
  ],
};

export default { schema };
