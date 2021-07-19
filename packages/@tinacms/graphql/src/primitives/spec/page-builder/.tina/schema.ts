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
      label: 'Page',
      name: 'page',
      path: 'content/pages',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'object',
          label: 'SEO',
          name: 'seo',
          fields: [
            {
              type: 'string',
              name: 'seoTitle',
              label: 'SEO Title',
            },
            {
              type: 'image',
              name: 'ogImage',
              label: 'Open Graph Image',
            },
            {
              type: 'string',
              name: 'ogDescription',
              label: 'Open Graph Description',
            },
          ],
        },
        {
          type: 'object',
          list: true,
          label: 'Blocks',
          name: 'blocks',
          templates: [
            {
              label: 'Hero',
              name: 'hero',
              fields: [
                {
                  type: 'string',
                  label: 'Description',
                  name: 'description',
                },
                {
                  type: 'image',
                  label: 'Background Image',
                  name: 'backgroundImage',
                },
              ],
            },
            {
              label: 'Call to Action',
              name: 'cta',
              fields: [
                {
                  type: 'string',
                  label: 'CTA Text',
                  name: 'ctaText',
                },
                {
                  type: 'string',
                  label: 'Style',
                  name: 'ctaStyle',
                  options: [
                    {
                      label: 'Minimal',
                      value: 'minimal',
                    },
                    {
                      label: 'Flat',
                      value: 'flat',
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
}

export { tinaSchema }
