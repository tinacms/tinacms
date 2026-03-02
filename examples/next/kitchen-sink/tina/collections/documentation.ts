import type { Collection } from 'tinacms';

const Documentation: Collection = {
  label: 'Documentation',
  name: 'documentation',
  path: 'content/documentation',
  format: 'mdx',
  ui: {
    router: ({ document }) =>
      `/documentation/${document._sys.breadcrumbs.join('/')}`,
    filename: {
      slugify: (values) =>
        `${(values?.title || `doc-${Date.now()}`).toLowerCase().split(' ').join('-')}`,
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'object',
      label: 'Tags',
      name: 'tags',
      list: true,
      fields: [
        {
          type: 'reference',
          label: 'Tag',
          name: 'tag',
          collections: ['tag'],
        },
      ],
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default Documentation;
