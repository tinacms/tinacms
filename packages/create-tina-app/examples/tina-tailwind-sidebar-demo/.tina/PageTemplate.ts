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

import { TinaTemplate } from '@tinacms/cli'

export const PageTemplate: TinaTemplate = {
  name: 'homepage',
  label: 'Homepage',
  fields: [
    {
      name: 'nav',
      type: 'object',
      label: 'Navbar',
      fields: [
        {
          label: 'Wordmark',
          name: 'wordmark',
          type: 'object',
          fields: [
            {
              label: 'Icon',
              name: 'icon',
              type: 'object',
              fields: [
                {
                  name: 'color',
                  label: 'Color',
                  type: 'string',
                  options: [
                    'primary',
                    'blue',
                    'teal',
                    'green',
                    'red',
                    'pink',
                    'purple',
                    'orange',
                    'yellow',
                  ],
                },
                {
                  name: 'name',
                  label: 'Icon',
                  type: 'string',
                  options: [
                    'random',
                    'FiAperture',
                    'BiCodeBlock',
                    'BiLike',
                    'BiMapAlt',
                    'BiPalette',
                    'BiPieChartAlt2',
                    'BiPin',
                    'BiShield',
                    'BiSlider',
                    'BiStore',
                    'BiTennisBall',
                    'BiTestTube',
                    'BiTrophy',
                    'BiUserCircle',
                    'BiBeer',
                    'BiChat',
                    'BiCloud',
                    'BiCoffeeTogo',
                    'BiWorld',
                  ],
                },
                {
                  name: 'style',
                  label: 'Style',
                  type: 'string',
                  options: ['circle', 'float'],
                },
              ],
            },
            {
              label: 'Name',
              name: 'name',
              type: 'string',
            },
          ],
        },
        {
          label: 'Nav Items',
          name: 'items',
          type: 'object',
          list: true,
          fields: [
            {
              label: 'Label',
              name: 'label',
              type: 'string',
            },
            {
              label: 'Link',
              name: 'link',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'blocks',
      type: 'object',
      label: 'Page Sections',
      list: true,
      templates: [
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            {
              name: 'tagline',
              label: 'Tagline',
              type: 'string',
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'string',
            },
            {
              name: 'paragraph',
              label: 'Paragraph',
              type: 'string',
            },
            {
              name: 'string',
              label: 'Text',
              type: 'object',
              fields: [
                {
                  name: 'color',
                  label: 'Color',
                  type: 'string',
                  options: ['default', 'tint', 'primary'],
                },
              ],
            },
            {
              name: 'image',
              label: 'Image',
              type: 'object',
              fields: [
                {
                  name: 'src',
                  label: 'Image Source',
                  type: 'string',
                },
                {
                  name: 'alt',
                  label: 'Alt Text',
                  type: 'string',
                },
              ],
            },
            {
              label: 'Actions',
              name: 'actions',
              type: 'object',
              list: true,
              fields: [
                {
                  label: 'Label',
                  name: 'label',
                  type: 'string',
                },
                {
                  label: 'Type',
                  name: 'type',
                  type: 'string',
                  options: ['button', 'link'],
                },
                {
                  label: 'Icon',
                  name: 'icon',
                  type: 'boolean',
                },
              ],
            },
            {
              name: 'style',
              label: 'Style',
              type: 'object',
              fields: [
                {
                  name: 'color',
                  label: 'Color',
                  type: 'string',
                  options: ['default', 'tint', 'primary'],
                },
              ],
            },
          ],
        },
        {
          name: 'testimonial',
          label: 'Testimonial',
          fields: [
            {
              name: 'quote',
              label: 'Quote',
              type: 'string',
            },
            {
              name: 'author',
              label: 'Author',
              type: 'string',
            },
            {
              name: 'style',
              label: 'Style',
              type: 'object',
              fields: [
                {
                  name: 'color',
                  label: 'Color',
                  type: 'string',
                  options: ['default', 'tint', 'primary'],
                },
              ],
            },
          ],
        },
        {
          name: 'features',
          label: 'Features',
          fields: [
            {
              label: 'Features',
              name: 'items',
              type: 'object',
              list: true,
              fields: [
                {
                  label: 'Icon',
                  name: 'icon',
                  type: 'object',
                  fields: [
                    {
                      name: 'color',
                      label: 'Color',
                      type: 'string',
                      options: [
                        'primary',
                        'blue',
                        'teal',
                        'green',
                        'red',
                        'pink',
                        'purple',
                        'orange',
                        'yellow',
                      ],
                    },
                    {
                      name: 'name',
                      label: 'Icon',
                      type: 'string',
                      options: [
                        'random',
                        'Aperture',
                        'BiCodeBlock',
                        'BiLike',
                        'BiMapAlt',
                        'BiPalette',
                        'BiPieChartAlt2',
                        'BiPin',
                        'BiShield',
                        'BiSlider',
                        'BiStore',
                        'BiTennisBall',
                        'BiTestTube',
                        'BiTrophy',
                        'BiUserCircle',
                        'BiBeer',
                        'BiChat',
                        'BiCloud',
                        'BiCoffeeTogo',
                        'BiWorld',
                      ],
                    },
                    {
                      name: 'style',
                      label: 'Style',
                      type: 'string',
                      options: ['circle', 'float'],
                    },
                  ],
                },
                {
                  name: 'title',
                  label: 'Title',
                  type: 'string',
                },
                {
                  name: 'text',
                  label: 'Text',
                  type: 'string',
                },
                {
                  label: 'Actions',
                  name: 'actions',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      label: 'Label',
                      name: 'label',
                      type: 'string',
                    },
                    {
                      label: 'Type',
                      name: 'type',
                      type: 'string',
                      options: ['button', 'link'],
                    },
                    {
                      label: 'Icon',
                      name: 'icon',
                      type: 'boolean',
                    },
                  ],
                },
              ],
            },
            {
              name: 'style',
              label: 'Style',
              type: 'object',
              fields: [
                {
                  name: 'color',
                  label: 'Color',
                  type: 'string',
                  options: ['default', 'tint', 'primary'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: 'Nav List',
      name: 'navlist',
      type: 'object',
      list: true,
      templates: [
        {
          name: 'nav',
          label: 'Foooter nav',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'string',
            },
            {
              name: 'items',
              label: 'Nav Items',
              type: 'object',
              list: true,
              fields: [
                {
                  name: 'label',
                  label: 'Label',
                  type: 'string',
                },
                {
                  name: 'link',
                  label: 'Link',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      label: 'Footer',
      type: 'object',
      fields: [
        {
          name: 'social',
          label: 'Social Media',
          type: 'object',
          fields: [
            {
              name: 'facebook',
              label: 'Facebook',
              type: 'string',
            },
            {
              name: 'twitter',
              label: 'Twitter',
              type: 'string',
            },
            {
              name: 'instagram',
              label: 'Instagram',
              type: 'string',
            },
            {
              name: 'github',
              label: 'Github',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
}
