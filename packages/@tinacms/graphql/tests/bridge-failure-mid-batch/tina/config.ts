import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Author',
      name: 'author',
      path: 'authors',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'string',
          required: true,
        },
      ],
    },
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
          name: 'author',
          label: 'Author',
          type: 'reference',
          collections: ['author'],
        },
      ],
    },
  ],
};

export default { schema };
