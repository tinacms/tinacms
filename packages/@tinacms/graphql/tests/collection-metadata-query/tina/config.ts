import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Article',
      name: 'article',
      path: 'content',
      defaultItem: {
        title: 'New Article',
        author: 'Anonymous',
        date: '2024-01-01T00:00:00.000Z',
      },
      frontmatterFormat: 'yaml',
      frontmatterDelimiters: '---',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Author',
          name: 'author',
        },
        {
          type: 'datetime',
          label: 'Date',
          name: 'date',
        },
        {
          type: 'rich-text',
          label: 'Content',
          name: 'content',
        },
      ],
    },
  ],
};

export default { schema };
