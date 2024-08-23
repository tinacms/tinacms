import { defineConfig } from 'tinacms'

export default defineConfig({
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  schema: {
    collections: [
      {
        label: 'Posts',
        name: 'posts',
        path: 'content/posts',
        fields: [{ name: 'title', label: 'Title', type: 'string' }],
      },
    ],
  },
})
