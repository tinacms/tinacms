import { createServer, build as viteBuild, InlineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const root = path.resolve(__dirname, '../src/cmds/standAlone/app/')
let config: InlineConfig = {
  root,
  build: {
    outDir: path.resolve(process.cwd(), 'out'),
  },
  plugins: [react],
}

if (process.env.TINA_INTERNAL_MONOREPO === 'true') {
  // if we are building in the mono repo resolve locally because PNP does not seem to work with vite
  config = {
    ...config,
    resolve: {
      alias: {
        /// internal
        'tinacms/dist/edit-state': path.resolve(
          __dirname,
          '../../../tinacms/dist/edit-state.es'
        ),
        tinacms: path.resolve(__dirname, '../../../tinacms/dist/index.es'),
        '@tinacms/toolkit': path.resolve(
          __dirname,
          '../../toolkit/dist/index.es'
        ),
        '@tinacms/sharedctx': path.resolve(
          __dirname,
          '../../sharedctx/dist/index.es'
        ),
        '@tinacms/schema-tools': path.resolve(
          __dirname,
          '../../schema-tools/dist/index.es'
        ),
      },
    },
  }
}

export const createViteServer = async () => {
  // this will have to be updated for prod

  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    ...config,
    server: {
      port: 3000,
    },
  })
  await server.listen()

  server.printUrls()
}

export const buildStandAlone = async () => {
  const out = await viteBuild(config)
}
