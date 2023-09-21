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

const sidebar = {
  name: 'sidebar',
  label: 'Sidebar',
  type: 'object',
  fields: [
    {
      name: 'sections',
      label: 'Section',
      type: 'object',
      list: true,
      ui: {
        itemProps: (item) => {
          if (item) {
            return { label: item.title }
          }
        },
      },
      fields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'items',
          type: 'object',
          list: true,
          templates: [
            {
              name: 'dropdownLink',
              ui: {
                itemProps: (item) => {
                  if (item) {
                    return { label: item.label }
                  }
                },
              },
              fields: [
                { type: 'string', name: 'label' },
                {
                  type: 'object',
                  list: true,
                  name: 'children',
                  ui: {
                    itemProps: (item) => {
                      if (item) {
                        return { label: item.reference }
                      }
                    },
                  },
                  fields: [
                    { type: 'string', name: 'label' },
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
            {
              name: 'directPageLink',
              ui: {
                itemProps: (item) => {
                  if (item) {
                    return { label: item.label }
                  }
                },
              },
              fields: [
                { type: 'string', name: 'label' },
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
    },
  ],
}

const versionedSidebar = {
  name: 'versionedSidebar',
  label: 'Versioned Sidebar',
  type: 'object',
  fields: [
    { name: 'tags', type: 'string', list: true, ui: { component: 'tags' } },
    {
      name: 'versions',
      list: true,
      type: 'object',
      fields: [{ name: 'name', type: 'string' }, sidebar],
    },
  ],
}

const pageFields: Partial<Collection> = {
  ui: {
    filename: {
      slugify: (values, meta) => {
        if (meta.template.name === 'overview') {
          return `_overview`
        }
        if (meta.template.name === 'versionedSidebar') {
          return `_sidebar`
        }
        if (meta.template.name === 'sidebar') {
          return `_sidebar`
        }
        return ''
      },
    },
  },
  templates: [
    {
      name: 'overview',
      label: 'Overview',
      fields: [
        { name: 'title', type: 'string', required: true, isTitle: true },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Body',
          isBody: true,
        },
      ],
    },
    {
      name: 'sidebar',
      label: 'Sidebar',
      fields: [
        { name: 'title', type: 'string', required: true },
        {
          name: 'type_title',
          type: 'string',
          required: true,
          isTitle: true,
        },
        sidebar,
      ],
    },
    {
      name: 'versionedSidebar',
      label: 'Versioned Sidebar',
      fields: [
        { name: 'title', type: 'string', required: true },
        {
          name: 'type_title',
          type: 'string',
          required: true,
          isTitle: true,
        },
        versionedSidebar,
      ],
    },
    {
      name: 'content',
      label: 'Content',
      fields: [
        { name: 'title', type: 'string', isTitle: true, required: true },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Body',
          isBody: true,
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
        name: 'page',
        label: 'Page',
        path: 'content/pages',
        format: 'mdx',
        ...pageFields,
      },
    ],
  },
})
