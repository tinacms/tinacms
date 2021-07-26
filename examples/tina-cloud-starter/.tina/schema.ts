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

import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'posts',
      path: 'content/posts',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'datetime',
          label: 'Created At',
          name: 'createdAt',
          dateFormat: 'M DD YYYY',
          timeFormat: '',
          ui: {
            dateFormat: 'MMMM DD YYYY',
            timeFormat: false,
          },
        },
        {
          type: 'boolean',
          label: 'Published',
          name: 'published',
        },
        {
          name: 'hero',
          type: 'image',
          label: 'Hero',
        },
        {
          type: 'reference',
          label: 'Author',
          name: 'author',
          collections: ['authors'],
        },
        {
          type: 'string',
          label: 'Body',
          name: 'body',
          isBody: true,
          ui: {
            component: 'markdown',
          },
        },
      ],
    },
    {
      label: 'Authors',
      name: 'authors',
      path: 'content/authors',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Avatar',
          name: 'avatar',
        },
      ],
    },
    {
      label: 'Marketing Pages',
      name: 'marketingPages',
      path: 'content/marketing-pages',
      fields: [
        {
          type: 'object',
          name: 'blocks',
          label: 'Blocks',
          list: true,
          templates: [
            {
              name: 'message',
              label: 'Message',
              fields: [
                {
                  type: 'string',
                  label: 'Message Header',
                  name: 'messageHeader',
                },
                {
                  type: 'string',
                  label: 'Message Body',
                  name: 'messageBody',
                },
                {
                  type: 'object',
                  label: 'Seo',
                  name: 'seo',
                  list: true,
                  fields: [
                    {
                      type: 'string',
                      label: 'SEO title',
                      name: 'seoTitle',
                    },
                  ],
                },
                {
                  type: 'object',
                  label: 'Nested Page',
                  name: 'nestedPage',
                  list: true,
                  templates: [
                    {
                      name: 'hero',
                      label: 'Hero',
                      fields: [
                        {
                          type: 'string',
                          label: 'Hero title',
                          name: 'herotitle',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'image',
              label: 'Image',
              fields: [
                {
                  type: 'string',
                  label: 'Heading',
                  name: 'heading',
                },
                {
                  type: 'string',
                  label: 'Image Description',
                  name: 'imgDescription',
                },
                {
                  type: 'string',
                  label: 'Image src',
                  name: 'src',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
