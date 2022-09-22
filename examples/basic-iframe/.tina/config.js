import schema from './schema'
import { defineStaticConfig } from 'tinacms'
import client from './__generated__/client'

export default defineStaticConfig({
  client,
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
