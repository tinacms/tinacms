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
          label: 'Author',
          name: 'author',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Name',
            },
            {
              name: 'isAuthor',
              type: 'toggle',
              label: 'is Author',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
            },
            {
              name: 'image',
              type: 'text',
              label: 'Image',
            },
            {
              name: 'accolades',
              type: 'group-list',
              label: 'Accolades',
              fields: [
                {
                  type: 'text',
                  label: 'Figure',
                  name: 'figure',
                },
                {
                  type: 'text',
                  label: 'Description',
                  name: 'description',
                },
              ],
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
          label: 'Post',
          name: 'post',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'myHero',
              type: 'image',
              label: 'Hero',
            },
            {
              name: 'image',
              label: 'Image',
              type: 'text',
            },
            {
              name: 'author',
              label: 'Author',
              type: 'reference',
              collection: 'authors',
            },
          ],
        },
      ],
    },
  ],
})
