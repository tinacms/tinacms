import schema from './schema'
import { defineStaticConfig } from 'tinacms'

export default defineStaticConfig({
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
  schema,
})
