import { defineConfig } from '@strivemath/tinacms'
import schema from './schema'

export default defineConfig({
  schema,
  branch: 'main',
  build: { outputFolder: 'admin', publicFolder: 'public' },
  clientId: '***',
  token: '***',
})
