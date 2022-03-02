import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      label: 'Page Content',
      name: 'page',
      path: 'content/pages',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'string',
        },
        {
          name: 'body',
          label: 'Main Content',
          type: 'string',
          isBody: true,
        },
        {
          label: 'Related Page',
          name: 'relatedPage',
          type: 'reference',
          collections: ['blockPage'],
        },
      ],
    },
    {
      label: 'Block Page',
      name: 'blockPage',
      path: 'content/block-pages',
      fields: [
        {
          label: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          label: 'SEO',
          name: 'seo',
          type: 'object',
          fields: [
            {
              label: 'OG Title',
              name: 'ogTitle',
              type: 'string',
            },
          ],
        },
        {
          label: 'Social',
          name: 'social',
          list: true,
          type: 'object',
          fields: [
            {
              label: 'Handle',
              name: 'handle',
              type: 'string',
            },
            {
              label: 'Platform',
              name: 'platform',
              type: 'string',
            },
            {
              label: 'Related Page',
              name: 'relatedPage',
              type: 'reference',
              collections: ['page'],
            },
          ],
        },
        {
          label: 'Related Page',
          name: 'relatedPage',
          type: 'reference',
          collections: ['page'],
        },
        {
          label: 'Blocks',
          name: 'blocks',
          type: 'object',
          list: true,
          templates: [
            {
              name: 'hero',
              label: 'Hero',
              fields: [
                {
                  label: 'Title',
                  name: 'title',
                  type: 'string',
                },
                {
                  label: 'Description',
                  name: 'description',
                  type: 'string',
                },
                {
                  label: 'Relation',
                  name: 'relation',
                  type: 'reference',
                  collections: ['page'],
                },
              ],
            },
            {
              name: 'cta',
              label: 'Cta',
              fields: [
                {
                  label: 'Title',
                  name: 'title',
                  type: 'string',
                },
                {
                  label: 'Action',
                  name: 'action',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
