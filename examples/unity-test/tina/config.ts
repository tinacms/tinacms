import { Collection, Template, TinaField, defineConfig } from 'tinacms'

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
          return {}
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
          return {}
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

const pageFields: Partial<Collection> = {
  ui: {
    filename: {
      slugify: (values, meta) => {
        if (meta.template.name === 'toc') {
          return `_index`
        }
        return ''
      },
    },
  },
  templates: [
    {
      name: 'toc',
      label: 'Table of Contents',
      fields: [{ name: 'title', type: 'string' }],
    },
    {
      name: 'landing',
      label: 'Landing Page',
      fields: [{ name: 'title', type: 'string' }],
    },
    {
      name: 'manual',
      label: 'Manual Page',
      fields: [{ name: 'title', type: 'string' }],
    },
    {
      name: 'reference',
      label: 'Reference Page',
      fields: [{ name: 'title', type: 'string' }],
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
        name: 'page',
        label: 'Page',
        path: 'content/pages',
        format: 'mdx',
        ...pageFields,
      },
      {
        name: 'manual',
        label: 'Manual',
        path: 'content/manual',
        format: 'mdx',
        ...pageFields,
      },
    ],
  },
})
