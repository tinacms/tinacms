import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      name: 'directors',
      label: 'Directors',
      path: 'directors',
      fields: [
        {
          type: 'string',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'string',
          name: 'bio',
          label: 'Biography',
        },
        {
          type: 'number',
          name: 'yearsActive',
          label: 'Years Active',
        },
        {
          type: 'string',
          name: 'nationality',
          label: 'Nationality',
        },
      ],
    },
  ],
};

export default { schema };
