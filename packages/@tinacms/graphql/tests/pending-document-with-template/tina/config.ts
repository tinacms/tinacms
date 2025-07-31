import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Page',
      name: 'page',
      path: 'pages',
      templates: [
        {
          label: 'Article',
          name: 'article',
          fields: [
            {
              type: 'string',
              label: 'Title',
              name: 'title',
            },
          ],
        },
        {
          label: 'Product',
          name: 'product',
          fields: [
            {
              type: 'string',
              label: 'Name',
              name: 'name',
            },
          ],
        },
      ],
    },
  ],
};

export default { schema };
