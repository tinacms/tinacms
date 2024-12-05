import { defineConfig } from 'tinacms'

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main'

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        format: 'mdx',
        ui: {
          router({ document }) {
            return `/posts/${document._sys.filename}`
          },
        },
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
          },
          {
            type: 'rich-text',
            label: 'Test Templates',
            name: 'template',
            isBody: true,
            toolbarOverride: [
              'heading',
              'bold',
              'italic',
              'image',
              'link',
              'embed',
            ],
            templates: [
              {
                name: 'DateTime',
                label: 'Date & Time',
                inline: true,
                fields: [
                  {
                    name: 'format',
                    label: 'Format',
                    type: 'string',
                    options: ['utc', 'iso', 'local'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'author',
        label: 'authors',
        path: 'content/author',
        format: 'mdx',
        ui: {
          router({ document }) {
            return `/author/${document._sys.filename}`
          },
        },
        fields: [
          {
            type: 'rich-text',
            label: 'test rich text',
            name: 'testrich',
            isBody: true,
          },
        ],
      },
    ],
  },
})
