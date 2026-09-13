import { defineConfig } from 'tinacms';

const branch = 'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: './',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: './',
    },
  },
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        ui: {
          router: () => '/',
        },
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [
              {
                name: 'PostPreview',
                label: 'Post Preview',
                fields: [
                  { type: 'string', name: 'title' },
                  { type: 'rich-text', name: 'children' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
