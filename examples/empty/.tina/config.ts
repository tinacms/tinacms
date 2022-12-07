import { defineConfig } from 'tinacms'

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'

export default defineConfig({
  branch,
  clientId: null, // Get this from tina.io
  token: null, // Get this from tina.io
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        label: 'Pages',
        name: 'pages',
        path: 'hugo/content',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
        ],
      },
      {
        label: 'Showcase',
        name: 'showcase',
        path: 'hugo/content/showcase',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
          {
            type: 'string',
            name: 'title',
            label: 'title',
          },
          {
            type: 'string',
            name: 'description',
            label: 'description',
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'date',
          },
          {
            type: 'boolean',
            name: 'featured',
            label: 'featured',
          },
          {
            type: 'string',
            name: 'permalink',
            label: 'permalink',
          },
        ],
      },
      {
        label: 'Blog',
        name: 'blog',
        path: 'hugo/content/blog',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
        ],
      },
      {
        label: 'Docs',
        name: 'docs',
        path: 'hugo/content/docs',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            required: true,
          },
          {
            type: 'datetime',
            name: 'publishdate',
            label: 'Publish Date',
            required: true,
          },
          {
            type: 'string',
            name: 'headline',
            label: 'Page Headline',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'textline',
            label: 'Page Textline',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'datetime',
            name: 'expirydate',
            label: 'Expiry Date',
          },
          {
            type: 'boolean',
            name: 'private',
            label: 'Exclude from sitemap?',
          },
          {
            type: 'number',
            name: 'weight',
            label: 'Weight',
          },
          {
            type: 'string',
            name: 'layout',
            label: 'Layout',
          },
        ],
      },
      {
        label: 'Changelog',
        name: 'changelog',
        path: 'hugo/content/docs/changelog',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
          {
            type: 'string',
            name: 'title',
            label: 'Title',
          },
          {
            type: 'string',
            name: 'authors',
            label: 'Authors',
            list: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Summary',
            ui: {
              component: 'textarea',
            },
          },
        ],
      },
      {
        label: 'Sunset Notices',
        name: 'sunset notices',
        path: 'hugo/content/docs/sunset',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
        ],
      },
      {
        label: 'FAQ',
        name: 'faq',
        path: 'hugo/content/docs/faqs',
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body of Document',
            description: 'This is the markdown body',
          },
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            required: true,
          },
          {
            type: 'datetime',
            name: 'publishdate',
            label: 'Publish Date',
            required: true,
          },
          {
            type: 'string',
            name: 'headline',
            label: 'Page Headline',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'textline',
            label: 'Page Textline',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'datetime',
            name: 'expirydate',
            label: 'Expiry Date',
          },
          {
            type: 'boolean',
            name: 'private',
            label: 'Exclude from sitemap?',
          },
          {
            type: 'number',
            name: 'weight',
            label: 'Weight',
          },
          {
            type: 'string',
            name: 'layout',
            label: 'Layout',
          },
        ],
      },
    ],
  },
})
