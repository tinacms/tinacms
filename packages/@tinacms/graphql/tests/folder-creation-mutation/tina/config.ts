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
          required: true,
        },
        {
          name: 'content',
          label: 'Content',
          type: 'string',
        },
      ],
    },
  ],
};

export default { schema };
