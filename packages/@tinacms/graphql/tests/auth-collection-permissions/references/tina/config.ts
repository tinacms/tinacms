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
            { type: 'string', label: 'Name', name: 'name' },
            { type: 'string', label: 'Email', name: 'email' },
            {
              type: 'password',
              label: 'Password',
              name: 'password',
              required: true,
            },
            {
              type: 'reference',
              label: 'Favorite post',
              name: 'favoritePost',
              collections: ['post'],
            },
          ],
        },
      ],
    },
    {
      label: 'Posts',
      name: 'post',
      path: 'content/posts',
      format: 'md',
      fields: [
        { type: 'string', label: 'Title', name: 'title' },
        {
          type: 'reference',
          label: 'Author',
          name: 'author',
          collections: ['user'],
        },
      ],
    },
  ],
};

export default { schema };
