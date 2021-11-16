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
      label: 'Author',
      name: 'author',
      path: 'content/authors',
      templates: [
        {
          name: 'author',
          label: 'Author',
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'string',
            },
            {
              name: 'socialMedia',
              label: 'Social Media',
              type: 'object',
              list: true,
              fields: [
                {
                  type: 'string',
                  name: 'platform',
                  label: 'Platform',
                  options: ['twitter', 'facebook', 'instagram'],
                },
                {
                  name: 'handle',
                  label: 'Handle',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: 'Post',
      name: 'post',
      path: 'content/posts',
      templates: [
        {
          name: 'post',
          label: 'Post',
          fields: [
            {
              type: 'string',
              label: 'Title',
              name: 'title',
            },
            {
              type: 'string',
              label: 'Body',
              name: 'body',
            },
            {
              type: 'reference',
              label: 'Author',
              name: 'author',
              collections: ['author'],
            },
          ],
        },
      ],
    },
  ],
}

export { tinaSchema }
