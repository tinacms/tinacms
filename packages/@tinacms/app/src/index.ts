import react from '@vitejs/plugin-react'
import { build, InlineConfig } from 'vite'
import path from 'path'

export const viteBuild = async ({ rootPath }: { rootPath: string }) => {
  const root = path.resolve(__dirname, '..', 'appFiles')
  const pathToSchema = path.join(rootPath, '.tina', 'schema')

  const config: InlineConfig = {
    root,
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
      outDir: path.join(rootPath, 'public', 'tina'),
      emptyOutDir: false,
    },
  }
  await build(config)
}
