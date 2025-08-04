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
          name: 'director',
          label: 'Director',
          type: 'string',
        },
        {
          name: 'rating',
          label: 'Rating',
          type: 'number',
        },
        {
          name: 'releaseYear',
          label: 'Release Year',
          type: 'number',
        },
        {
          name: 'isClassic',
          label: 'Is Classic',
          type: 'boolean',
        },
        {
          name: 'releaseDate',
          label: 'Release Date',
          type: 'datetime',
        },
        {
          name: 'genre',
          label: 'Genre',
          type: 'string',
          options: ['action', 'comedy', 'drama', 'horror', 'sci-fi'],
        },
        {
          name: 'poster',
          label: 'Poster',
          type: 'image',
        },
        {
          name: 'tags',
          label: 'Tags',
          type: 'string',
          list: true,
        },
        {
          name: 'cast',
          label: 'Cast Members',
          type: 'object',
          list: true,
          fields: [
            {
              name: 'actor',
              label: 'Actor Name',
              type: 'string',
            },
            {
              name: 'character',
              label: 'Character Name',
              type: 'string',
            },
          ],
        },
        {
          name: 'studio',
          label: 'Studio',
          type: 'reference',
          collections: ['studio'],
        },
        {
          name: 'description',
          label: 'Description',
          type: 'rich-text',
          isBody: true,
        },
      ],
    },
    {
      label: 'Studio',
      name: 'studio',
      path: 'studios',
      fields: [
        {
          name: 'name',
          label: 'Studio Name',
          type: 'string',
        },
        {
          name: 'founded',
          label: 'Founded Year',
          type: 'number',
        },
      ],
    },
  ],
};

export default { schema };
