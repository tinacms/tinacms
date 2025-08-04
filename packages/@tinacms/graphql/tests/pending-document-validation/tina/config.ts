import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      name: 'post',
      label: 'Posts',
      path: 'posts',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
        },
      ],
    },
  ],
};

export default { schema };
