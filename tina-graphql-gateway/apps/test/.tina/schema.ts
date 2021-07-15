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

import { defineSchema } from 'tina-graphql-gateway-cli'

export default defineSchema({
  collections: [
    {
      label: 'Authors',
      name: 'authors',
      path: 'content/authors',
      templates: [
        {
          name: 'author',
          label: 'Author',
          fields: [
            {
              type: 'text',
              label: 'Name',
              name: 'name',
            },
          ],
        },
      ],
    },
    {
      label: 'Posts',
      name: 'posts',
      path: 'content/posts',
      templates: [
        {
          name: 'post',
          label: 'Post',
          fields: [
            {
              type: 'text',
              label: 'Title',
              name: 'title',
            },
            {
              type: 'group',
              label: 'Details',
              name: 'details',
              fields: [
                {
                  name: 'reading_time',
                  label: 'Reading Time',
                  type: 'text',
                },
              ],
            },
            {
              type: 'reference',
              label: 'Author',
              name: 'author',
              collection: 'authors',
            },
          ],
        },
      ],
    },
  ],
})
