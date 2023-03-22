import { defineConfig } from 'tinacms'

export default defineConfig({
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  branch: null,
  clientId: null,
  token: null,
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Page',
        path: 'content/pages',
        ui: {
          router: ({ document, collection }) => {
            return `/${collection.name}/${document._sys.filename}`
          },
        },
        fields: [
          {
            name: 'title',
            type: 'string',
            required: true,
            isTitle: true,
          },
        ],
      },
    ],
  },
})
