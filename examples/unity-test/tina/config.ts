import { Template, TinaField, defineConfig } from 'tinacms'

const links: TinaField = {
  label: 'Links',
  name: 'links',
  type: 'object',
  list: true,
  templates: [
    {
      name: 'label',
      label: 'Label',
      ui: {
        itemProps(item) {
          if (item) {
            return { label: item.title }
          }
        },
      },
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
        },
      ],
    },
    {
      name: 'page',
      label: 'Page Link',
      ui: {
        itemProps(item) {
          if (item) {
            return { label: item.reference }
          }
        },
      },
      fields: [
        {
          type: 'reference',
          name: 'reference',
          label: 'Reference',
          collections: ['page'],
        },
        {
          name: 'children',
          label: 'Children',
          type: 'object',
          list: true,
          fields: [
            {
              type: 'reference',
              name: 'reference',
              label: 'Reference',
              collections: ['page'],
            },
          ],
        },
      ],
    },
  ],
}

export default defineConfig({
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  branch: null,
  clientId: null,
  token: null,
  schema: {
    collections: [
      {
        name: 'sidebar',
        label: 'Sidebar',
        path: 'content/sidebar',
        format: 'json',
        ui: {
          async beforeSubmit(arg) {
            const values = arg.values
            console.log(arg)
            return values
          },
        },
        fields: [
          {
            name: 'title',
            type: 'string',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            name: 'version',
            type: 'string',
            label: 'Version',
          },
          {
            name: 'locale',
            type: 'string',
            label: 'Locale',
            options: ['en', 'sp'],
          },
          {
            name: 'type',
            type: 'string',
            label: 'Type',
            options: [
              { label: 'User Manual', value: 'manual' },
              { label: 'Reference', value: 'reference' },
              { label: 'Landing Page', value: 'landing' },
            ],
          },
          links,
        ],
      },
      {
        name: 'page',
        label: 'Page',
        path: 'content/pages',
        format: 'mdx',
        fields: [
          {
            name: 'title',
            type: 'string',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            name: 'body',
            label: 'Body',
            type: 'rich-text',
          },
          {
            name: 'slug',
            label: 'Slug',
            type: 'string',
          },
        ],
      },
    ],
  },
})
