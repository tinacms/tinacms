#!/usr/bin/env node
// Seems like this is no longer necessary
import react from '@vitejs/plugin-react'
import { build, defineConfig, createServer } from 'vite'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pathToSchema = join(process.cwd(), '.tina', 'schema')

const config = defineConfig({
  root: __dirname,
  mode: 'development',
  base: '/tina/',
  plugins: [react()],
  define: {
    'process.env': {},
  },
  server: {
    strictPort: true,
  },
  resolve: {
    alias: {
      TINA_IMPORT: pathToSchema,
    },
  },
  build: {
    sourcemap: true,
    outDir: join(process.cwd(), 'public', 'tina'),
    emptyOutDir: false,
  },
})

const serve = async (config) => {
  const server = await createServer({
    ...config,
  })
  await server.listen()
  await server.printUrls()
}

if (process.argv[2] === '--dev') {
  serve(config)
} else {
  build(config)
}
