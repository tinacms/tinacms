import type { Collection } from 'tinacms';

const SEO: Collection = {
  label: 'SEO Defaults',
  name: 'seo',
  path: 'content/seo',
  format: 'json',
  ui: {
    global: true,
  },
  fields: [
    {
      type: 'string',
      label: 'Title Suffix',
      name: 'titleSuffix',
      description: 'Appended to every page title, e.g. " | Tina Kitchen Sink"',
    },
    {
      type: 'string',
      label: 'Default Description',
      name: 'description',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'string',
      label: 'Twitter Handle',
      name: 'twitter',
    },
  ],
};

export default SEO;
