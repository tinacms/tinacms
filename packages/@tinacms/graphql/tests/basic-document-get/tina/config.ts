import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  
  collections: [
    {
      name: 'post',
      path: 'post',
      fields: [
        {
          type: 'string',
          name: 'title',
        },
      ],
    },
  ],
};

export default { schema };
