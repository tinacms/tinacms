/**

*/

import { Schema } from '@tinacms/schema-tools'
import { richBody } from './body'

const tinaSchema: Schema = {
  collections: [
    {
      label: 'Movie',
      name: 'movie',
      path: 'content/movies',
      format: 'mdx',
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
        {
          name: 'rating',
          label: 'Rating',
          type: 'number',
        },
        {
          name: 'archived',
          label: 'Archived',
          type: 'boolean',
        },
        {
          name: 'genre',
          label: 'Genre',
          type: 'string',
          options: ['scifi', 'mystery', 'drama', 'comedy', 'action'],
        },
        {
          type: 'reference',
          label: 'Director',
          name: 'director',
          collections: ['director'],
        },
        richBody,
      ],
    },
    {
      label: 'Director',
      name: 'director',
      path: 'content/directors',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
      ],
    },
    {
      label: 'Actor',
      name: 'actor',
      path: 'content/actors',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Body',
          name: 'body',
        },
      ],
    },
  ],
}

export { tinaSchema }
