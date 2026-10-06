import type { Schema } from '@tinacms/schema-tools';

const schema: Schema = {
  collections: [
    {
      label: 'Users',
      name: 'user',
      path: 'content/users',
      format: 'json',
      isAuthCollection: true,
      templates: [
        {
          label: 'Team',
          name: 'team',
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
    },
  ],
};

export default { schema };
