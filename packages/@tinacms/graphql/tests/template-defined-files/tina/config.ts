import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      name: 'author',
      label: 'Author',
      path: 'authors',
      templates: [
        {
          name: 'author',
          label: 'Author',
          fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'email', label: 'Email', type: 'string' },
            { name: 'bio', label: 'Bio', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'product',
      label: 'Product',
      path: 'products',
      templates: [
        {
          name: 'book',
          label: 'Book',
          fields: [
            { name: 'title', label: 'Title', type: 'string' },
            { name: 'isbn', label: 'ISBN', type: 'string' },
            { name: 'pages', label: 'Pages', type: 'number' },
          ],
        },
        {
          name: 'software',
          label: 'Software',
          fields: [
            { name: 'title', label: 'Title', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'platform', label: 'Platform', type: 'string' },
          ],
        },
      ],
    },
  ],
};

export default { schema };
