import type { Collection } from 'tinacms';

const Page: Collection = {
  name: 'page',
  label: 'Pages',
  path: 'content/pages',
  format: 'json',
  fields: [
    {
      type: 'object',
      name: 'hero',
      label: 'Hero',
      fields: [
        { type: 'string', name: 'tagline', label: 'Tagline' },
        { type: 'string', name: 'headline', label: 'Headline' },
      ],
    },
    {
      type: 'object',
      name: 'features',
      label: 'Features',
      fields: [
        { type: 'string', name: 'title', label: 'Section title' },
        {
          type: 'object',
          name: 'items',
          label: 'Items',
          list: true,
          ui: { itemProps: (item) => ({ label: item?.name }) },
          fields: [
            { type: 'string', name: 'name', label: 'Name' },
            { type: 'string', name: 'description', label: 'Description' },
          ],
        },
      ],
    },
  ],
};

export default Page;
