#!/usr/bin/env node
// Seems like this is no longer necessary
import react from '@vitejs/plugin-react'
import { build, defineConfig, createServer } from 'vite'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pathToSchema = join(process.cwd(), '.tina', 'schema.ts')

export function pluginResolvePathToTina() {
  const moduleName = '../.tina/schema'

  return {
    name: 'my-plugin', // required, will show up in warnings and errors
    enforce: 'pre',
    resolveId(id) {
      if (id === moduleName) {
        return pathToSchema
      }
    },
  }
}

const config = defineConfig({
  root: __dirname,
  mode: 'development',
  base: '/tina/',
  plugins: [react(), pluginResolvePathToTina()],
  define: {
    'process.env': {},
  },
  server: {
    strictPort: true,
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
