/**

*/

import { Template, TinaField } from '@tinacms/schema-tools'

const cta: Template = {
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
