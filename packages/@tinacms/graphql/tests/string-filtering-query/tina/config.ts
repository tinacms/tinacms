import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Movie',
      name: 'movie',
      path: 'movies',
      fields: [
        {
          name: 'title',
          label: 'Title',
          required: true,
          type: 'string',
        },
      ],
    },
  ],
};

export default { schema };
