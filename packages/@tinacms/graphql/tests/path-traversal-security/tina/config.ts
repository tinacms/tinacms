import { Schema } from '@tinacms/schema-tools';

const config: { schema: Schema } = {
  schema: {
    collections: [
      {
        label: 'Post',
        name: 'post',
        path: 'posts',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'string',
            required: true,
          },
        ],
      },
    ],
  },
};

export default config;
