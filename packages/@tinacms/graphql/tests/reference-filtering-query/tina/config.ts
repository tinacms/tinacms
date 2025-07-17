import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      name: 'movie',
      label: 'Movie',
      path: 'movies',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
        },
        {
          type: 'reference',
          name: 'director',
          label: 'Director',
          collections: ['director'],
        },
      ],
    },
    {
      name: 'director',
      label: 'Director',
      path: 'directors',
      fields: [
        {
          type: 'string',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'object',
          name: 'relatives',
          label: 'Relatives',
          list: false,
          fields: [
            {
              type: 'reference',
              name: 'child',
              label: 'Child',
              collections: ['relative'],
            },
          ],
        },
      ],
    },
    {
      name: 'relative',
      label: 'Relative',
      path: 'relatives',
      fields: [
        {
          type: 'string',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'reference',
          name: 'child',
          label: 'Child',
          collections: ['relative'],
        },
      ],
    },
  ],
};

export default { schema };
