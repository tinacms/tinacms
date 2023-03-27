import bodyParser from 'body-parser'
import path from 'path'
import cors from 'cors'
import { createServer as createViteServer } from 'vite'
import type { Plugin } from 'vite'
import { resolve as gqlResolve, Database } from '@tinacms/graphql'
import { ConfigManager } from '../../../config-manager'
import { parseMediaFolder, createMediaRouter } from './media'
import { transform as esbuildTransform } from 'esbuild'
import { createConfig } from '../../../vite'

export const createDevServer = async (
  configManager: ConfigManager,
  database: Database,
  apiURL: string,
  noWatch: boolean
) => {
  const plugins: Plugin[] = [
    {
      name: 'transform-tsx',
      async transform(code, id) {
        // FIXME: this seems to only happen in the monorepo
        // so it's not used in the vite build fro now
        //
        // Vite isn't picking up the right transform for tsx
        // files, we could opt-out of this if the file isn't
        // .tsx but seems to work ok for now.
        // TODO: other loaders needed (eg svg)?
        if (id.startsWith(configManager.rootPath)) {
          const extName = path.extname(id)
          if (extName.startsWith('.tsx') || extName.startsWith('.ts')) {
            const result = await esbuildTransform(code, { loader: 'tsx' })
            return {
              code: result.code,
            }
          }
        }
      },
    },
    {
      name: 'graphql-endpoints',
      configureServer(server) {
        server.middlewares.use(cors())
        server.middlewares.use(bodyParser.json())
        server.middlewares.use(async (req, res, next: Function) => {
          const mediaPaths = configManager.config.media?.tina
          const mediaRouter = createMediaRouter({
            rootPath: configManager.rootPath,
            apiURL,
            publicFolder: parseMediaFolder(mediaPaths?.publicFolder || ''),
            mediaRoot: parseMediaFolder(mediaPaths?.mediaRoot || ''),
          })
          if (req.url.startsWith('/media/upload')) {
            await mediaRouter.handlePost(req, res)
            return
          }
          if (req.url.startsWith('/media')) {
            if (req.method === 'DELETE') {
              await mediaRouter.handleDelete(req, res)
              return
            }
          }
          if (req.url.startsWith('/media/list')) {
            await mediaRouter.handleList(req, res)
            return
          }
          if (req.url === '/altair') {
            res.end(
              JSON.stringify({
                status:
                  'The GraphQL playground has moved to <your-dev-url>/index.html#/graphql',
              })
            )
            return
          }
          if (req.url === '/graphql') {
            // @ts-ignore FIXME: req type doesn't match
            const { query, variables } = req.body
            const result = await gqlResolve({
              config: {
                useRelativeMedia: true,
              },
              database,
              query,
              variables,
              verbose: false,
            })
            res.end(JSON.stringify(result))
            return
          }

          next()
        })
      },
    },
  ]
  return createViteServer(
    await createConfig({
      configManager,
      database,
      apiURL,
      plugins,
      noWatch,
      /**
       * Ensure Vite's import scan uses the spaMainPath as the input
       * so it properly finds everything. This is for dev only, and when
       * running the server outside of this monorepo vite fails to find
       * and optimize the imports, so you get errors about it not being
       * able to find an export from a module, and it's always a CJS
       * module that Vite would usually transform to an ES module.
       */
      rollupOptions: {
        input: configManager.spaMainPath,
      },
    })
  )
}
