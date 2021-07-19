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
      templates: [
        {
          label: 'Article',
          name: 'article',
          fields: [
            {
              type: 'text',
              label: 'Title',
              name: 'title',
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
              collection: 'authors',
            },
          ],
        },
      ],
    },
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
              type: 'text',
              label: 'Name',
              name: 'name',
            },
            {
              type: 'text',
              label: 'Avatar',
              name: 'avatar',
            },
          ],
        },
      ],
    },
    {
      label: 'Marketing Pages',
      name: 'marketingPages',
      path: 'content/marketing-pages',
      templates: [
        {
          label: 'Landing Page',
          name: 'landingPage',
          fields: [
            {
              type: 'blocks',
              name: 'blocks',
              label: 'Blocks',
              templates: [
                {
                  name: 'message',
                  label: 'Message',
                  fields: [
                    {
                      type: 'text',
                      label: 'Message Header',
                      name: 'messageHeader',
                    },
                    {
                      type: 'textarea',
                      label: 'Message Body',
                      name: 'messageBody',
                    },
                  ],
                },
                {
                  name: 'image',
                  label: 'Image',
                  fields: [
                    {
                      type: 'text',
                      label: 'Heading',
                      name: 'heading',
                    },
                    {
                      type: 'textarea',
                      label: 'Image Description',
                      name: 'imgDescription',
                    },
                    {
                      type: 'text',
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
    },
  ],
})
