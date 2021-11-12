/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { TinaCloudSchema } from '../../../types'
import { richBody } from './body'

const tinaSchema: TinaCloudSchema<false> = {
  collections: [
    {
      label: 'Movie',
      name: 'movie',
      path: 'content/movies',
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
