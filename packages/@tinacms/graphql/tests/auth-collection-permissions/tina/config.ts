import type { Schema } from '@tinacms/schema-tools';

export const buildConfig = ({ isDetached }: { isDetached: boolean }) => {
  const schema: Schema = {
    collections: [
      {
        label: 'Users',
        name: 'user',
        path: 'content/users',
        format: 'json',
        isAuthCollection: true,
        isDetached,
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
            ],
          },
        ],
      },
      {
        label: 'Posts',
        name: 'post',
        path: 'content/posts',
        format: 'md',
        fields: [{ type: 'string', label: 'Title', name: 'title' }],
      },
      {
        label: 'Data',
        name: 'data',
        path: 'content',
        format: 'json',
        fields: [{ type: 'string', label: 'Title', name: 'title' }],
      },
    ],
  };
  return { schema };
};

export default buildConfig({ isDetached: true });
