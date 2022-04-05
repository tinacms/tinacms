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

import { heroTemplate } from '../components/blocks/Hero'
import { featuresTemplate } from '../components/blocks/Features'
import { flyingTemplate } from '../components/blocks/Flying'
import { pricingTemplate } from '../components/blocks/Pricing'
import { faqTemplate } from '../components/blocks/FAQ'
import { contentTemplate } from '../components/blocks/Content'
import { columnsTemplate } from '../components/blocks/Columns'

export default defineSchema({
  collections: [
    {
      label: 'Pages',
      name: 'page',
      path: 'content/blocksPages',
      format: 'json',
      fields: [
        {
          type: 'object',
          name: 'seo',
          label: 'SEO Information',
          fields: [
            { type: 'string', label: 'Title', name: 'title' },
            {
              type: 'string',
              label: ' Description',
              name: 'description',
              ui: {
                component: 'textarea',
              },
            },
          ],
        },
        {
          label: 'Page Sections',
          name: 'blocks',
          type: 'object',
          list: true,
          ui: {
            visualSelector: true,
          },
          templates: [
            heroTemplate,
            featuresTemplate,
            flyingTemplate,
            pricingTemplate,
            faqTemplate,
            contentTemplate,
            columnsTemplate,
          ],
        },
      ],
    },
    {
      name: 'post',
      label: 'Blog Posts',
      path: 'content/blog',
      format: 'md',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
        },
        {
          // note: default to current date/time
          type: 'datetime',
          name: 'date',
          label: 'Date Created',
        },
        {
          // note: this should be a hidden field that auto-updates
          type: 'datetime',
          name: 'last_edited',
          label: 'Last Edited',
        },
        {
          // TODO create an authors collection and make this a relation field
          type: 'string',
          name: 'author',
          label: 'Author',
        },
        {
          type: 'reference',
          name: 'prev',
          label: 'Previous Post',
          description:
            '(Optional) link to an earlier post at the bottom of this one',
          collections: ['post'],
        },
        {
          type: 'reference',
          name: 'next',
          label: 'Next Post',
          description:
            '(Optional) link to a later post at the bottom of this one',
          collections: ['post'],
        },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Body',
          isBody: true,
          templates: [
            {
              name: 'Youtube',
              label: 'Youtube Embed',
              fields: [
                {
                  type: 'string',
                  name: 'embedSrc',
                  label: 'Embed URL',
                },
              ],
            },
            {
              name: 'CreateAppCta',
              label: '"Create Tina App" Call-to-action',
              fields: [
                {
                  type: 'string',
                  name: 'ctaText',
                  label: 'Button Text',
                },
                {
                  type: 'string',
                  name: 'cliText',
                  label: 'CLI Command Example',
                },
              ],
            },
            {
              name: 'Callout',
              label: 'Callout',
              fields: [
                {
                  type: 'string',
                  name: 'title',
                  label: 'Title',
                },
                {
                  type: 'string',
                  name: 'description',
                  label: 'Description',
                },
                {
                  type: 'string',
                  name: 'url',
                  label: 'URL',
                },
                {
                  type: 'string',
                  name: 'buttonText',
                  label: 'Button Text',
                },
              ],
            },
            {
              name: 'Codesandbox',
              label: 'Codesandbox embed',
              fields: [
                {
                  type: 'string',
                  name: 'embedSrc',
                  label: 'Embed URL',
                },
                {
                  type: 'string',
                  name: 'title',
                  label: 'A11y Title',
                },
              ],
            },
            {
              name: 'Diagram',
              label: 'Diagram',
              fields: [
                {
                  type: 'string',
                  name: 'src',
                },
                {
                  type: 'string',
                  name: 'alt',
                },
              ],
            },
            {
              name: 'CustomFieldComponentDemo',
              label: 'Field Component Demo [do not use]',
              fields: [],
            },
          ],
        },
      ],
    },
  ],
})
