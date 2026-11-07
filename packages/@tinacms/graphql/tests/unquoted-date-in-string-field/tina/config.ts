import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Post',
      name: 'post',
      path: 'posts',
      fields: [
        { name: 'title', label: 'Title', type: 'string' },
        { name: 'publishedOn', label: 'Published On', type: 'string' },
        { name: 'publishedAt', label: 'Published At', type: 'string' },
        { name: 'revisions', label: 'Revisions', type: 'string', list: true },
      ],
    },
  ],
};

export default { schema };
