import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Users',
      name: 'user',
      path: 'content/users',
      format: 'json',
      isAuthCollection: true,
      fields: [
        {
          type: 'object',
          name: 'users',
          list: true,
          fields: [
            {
              type: 'string',
              label: 'Username',
              name: 'username',
              uid: true,
              required: true,
            },
            {
              type: 'string',
              label: 'Name',
              name: 'name',
            },
            {
              type: 'string',
              label: 'Email',
              name: 'email',
            },
            {
              type: 'password',
              label: 'Password',
              name: 'password',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

export default { schema };