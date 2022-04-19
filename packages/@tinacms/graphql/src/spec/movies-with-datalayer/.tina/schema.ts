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
          required: true,
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
        // {
        //   type: 'reference',
        //   label: 'Actors',
        //   name: 'actors',
        //   list: true,
        //   collections: ['actor'],
        // },
        {
          name: 'body',
          label: 'Body',
          type: 'string',
          isBody: true,
        },
      ],
      indexes: [
        {
          name: 'archived-releaseDate',
          fields: [{ name: 'archived' }, { name: 'releaseDate' }],
        },
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
        {
          type: 'datetime',
          label: 'Birthday',
          name: 'birthday',
        },
        {
          type: 'number',
          label: 'Height',
          name: 'height',
        },
        {
          label: 'Relatives',
          name: 'relatives',
          type: 'object',
          list: false,
          fields: [
            {
              type: 'reference',
              label: 'Spouses',
              name: 'spouse',
              collections: ['relative'],
            },
            {
              type: 'reference',
              label: 'Child',
              name: 'child',
              collections: ['relative'],
            },
          ],
        },
      ],
    },
    {
      label: 'Crew',
      name: 'crew',
      path: 'content/crew',
      templates: [
        {
          label: 'Costume Designer',
          name: 'costumeDesigner',
          fields: [
            {
              name: 'favoriteColor',
              label: 'Favorite Color',
              type: 'string',
            },
          ],
        },
        {
          label: 'Stunt Person',
          name: 'stuntPerson',
          fields: [
            {
              name: 'bestMove',
              label: 'Best Move',
              type: 'string',
              options: ['frontFlip', 'backFlip'],
            },
          ],
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
    {
      label: 'Relative',
      name: 'relative',
      path: 'content/relative',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
      ],
    },
  ],
}

export { tinaSchema }
