import schema from './schema'
import { defineConfig } from 'tinacms'
import client from './__generated__/client'

export default defineConfig({
  client,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  schema,
})
