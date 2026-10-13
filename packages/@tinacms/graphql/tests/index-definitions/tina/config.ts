import type { Schema } from '@tinacms/schema-tools';

const schema: Schema = {
  collections: [
    {
      label: 'Users',
      name: 'user',
      path: 'content/users',
      format: 'json',
      isAuthCollection: true,
      fields: [
        { type: 'string', name: 'username', uid: true, required: true },
        { type: 'string', name: 'title' },
        { type: 'number', name: 'rank' },
        { type: 'boolean', name: 'active' },
        { type: 'datetime', name: 'joined' },
        { type: 'image', name: 'avatar' },
        { type: 'password', name: 'password', required: true },
        {
          type: 'object',
          name: 'profile',
          fields: [{ type: 'string', name: 'bio' }],
        },
      ],
    },
  ],
};

export default { schema };
