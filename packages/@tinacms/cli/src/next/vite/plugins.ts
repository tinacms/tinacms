import type { Plugin } from 'vite'
import { transform as esbuildTransform } from 'esbuild'
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import { resolve as gqlResolve } from '@tinacms/graphql'
import type { Database } from '@tinacms/graphql'
import {
  parseMediaFolder,
  createMediaRouter,
} from '../commands/dev-command/server/media'
import type { ConfigManager } from '../config-manager'

export const transformTsxPlugin = ({
  configManager: _configManager,
}: {
  configManager: ConfigManager
}) => {
  const plug: Plugin = {
    name: 'transform-tsx',
    async transform(code, id) {
      // FIXME: this seems to only happen in the monorepo
      // so it's not used in the vite build fro now
      //
      // Vite isn't picking up the right transform for tsx
      // files, we could opt-out of this if the file isn't
      // .tsx but seems to work ok for now.
      // TODO: other loaders needed (eg svg)?
      //   if (id.startsWith(configManager.rootPath)) {
      const extName = path.extname(id)
      if (extName.startsWith('.tsx') || extName.startsWith('.ts')) {
        const result = await esbuildTransform(code, { loader: 'tsx' })
        return {
          code: result.code,
        }
        // }
      }
    },
  }
  return plug
}

export const devServerEndPointsPlugin = ({
  configManager,
  apiURL,
  database,
}: {
  apiURL: string
  database: Database
  configManager: ConfigManager
}) => {
  const plug: Plugin = {
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
  }
  return plug
}
