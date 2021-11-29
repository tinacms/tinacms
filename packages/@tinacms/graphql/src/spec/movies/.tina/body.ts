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

import { TinaTemplate, TinaField } from '../../..'

const cta: TinaTemplate = {
  name: 'Cta',
  label: 'CTA',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
    },
    {
      name: 'actions',
      label: 'Actions',
      type: 'object',
      list: true,
      templates: [
        {
          name: 'popup',
          label: 'Popup Dialog',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'string',
            },
            {
              name: 'body',
              label: 'Body',
              type: 'string',
            },
          ],
        },
        {
          name: 'externalLink',
          label: 'External Link',
          fields: [
            {
              name: 'url',
              label: 'URL',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
}

export const richBody: TinaField = {
  type: 'rich-text',
  label: 'Body',
  name: 'body',
  isBody: true,
  templates: [
    cta,
    {
      name: 'BlockQuote',
      label: 'Block Quote',
      fields: [
        {
          name: 'author',
          label: 'Author',
          type: 'string',
        },
        {
          name: 'categories',
          label: 'Categories',
          type: 'string',
          list: true,
          options: ['health', 'movies', 'sports'],
        },
        {
          name: 'children',
          label: 'Quote',
          type: 'rich-text',
        },
      ],
    },
    {
      name: 'Hero',
      label: 'Hero',
      fields: [
        {
          name: 'author',
          label: 'Author',
          type: 'string',
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'rich-text',
          templates: [cta],
        },
        {
          name: 'config',
          label: 'Config',
          type: 'object',
          fields: [
            {
              type: 'string',
              name: 'variant',
              label: 'Variant',
            },
          ],
        },
        {
          name: 'children',
          label: 'Body',
          type: 'rich-text',
          templates: [cta],
        },
      ],
    },
  ],
}
