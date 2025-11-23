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
          name: 'genre',
          label: 'Genre',
          type: 'string',
        },
        {
          name: 'rating',
          label: 'Rating',
          type: 'number',
        },
        {
          name: 'body',
          label: 'Body',
          type: 'rich-text',
          isBody: true,
        },
      ],
    },
  ],
};

export default { schema };
