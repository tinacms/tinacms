import { defineConfig } from 'tinacms';

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

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
  // Uncomment to allow cross-origin requests from non-localhost origins
  // during local development (e.g. GitHub Codespaces, Gitpod, Docker).
  // Use 'private' to allow all private-network IPs (WSL2, Docker, etc.)
  // server: {
  //   allowedOrigins: ['https://your-codespace.github.dev'],
  // },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        fields: [
          {
            type: 'string',
            name: 'eyebrow',
            label: 'Eyebrow',
          },
          {
            type: 'string',
            name: 'title',
            label: 'Headline',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Tagline',
            isBody: true,
          },
          {
            type: 'object',
            name: 'ctaPrimary',
            label: 'Primary button',
            fields: [
              { type: 'string', name: 'label', label: 'Label' },
              { type: 'string', name: 'href', label: 'Link' },
            ],
          },
          {
            type: 'object',
            name: 'ctaSecondary',
            label: 'Secondary button',
            fields: [
              { type: 'string', name: 'label', label: 'Label' },
              { type: 'string', name: 'href', label: 'Link' },
            ],
          },
        ],
        ui: {
          // Opens the /tinacms-demo page for visual editing. Change or remove to fit your site.
          router: () => '/tinacms-demo',
        },
      },
    ],
  },
});
