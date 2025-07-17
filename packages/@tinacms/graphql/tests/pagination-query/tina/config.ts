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
          type: 'string',
        },
        {
          name: 'releaseDate',
          label: 'Release Date',
          type: 'datetime',
        },
      ],
    },
  ],
};

export default { schema };
