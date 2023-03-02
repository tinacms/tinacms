import { createServer as createViteServer } from 'vite'
import bodyParser from 'body-parser'
import cors from 'cors'
import { resolve as gqlResolve, Database } from '@tinacms/graphql'
import { tinaTailwind } from '../tailwind'
import { ConfigManager } from '../../config-manager'
import { createMediaRouter } from './routes'
import { parseMediaFolder } from './models/media'
import { transform } from 'esbuild'
import { pipeline } from 'readable-stream'
import { createServer } from 'net'
import { ManyLevelHost } from 'many-level'
import { MemoryLevel } from 'memory-level'

export const createDBServer = () => {
  const levelHost = new ManyLevelHost(
    // @ts-ignore
    new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    })
  )
  const dbserver = createServer(function (socket) {
    // Pipe socket into host stream and vice versa
    return pipeline(socket, levelHost.createRpcStream(), socket, () => {
      // Disconnected
    })
  })
  dbserver.listen(9000)

  return dbserver
}

export const createDevServer = async (
  configManager: ConfigManager,
  database: Database,
  apiURL: string
) => {
  const server = await createViteServer({
    root: configManager.spaRootPath,
    base: `/public/`,
    appType: 'spa',
    resolve: {
      alias: {
        TINA_IMPORT: configManager.tinaConfigFilePath,
        SCHEMA_IMPORT: configManager.generatedGraphQLJSONPath,
      },
    },
    define: {
      __API_URL__: `"${apiURL}"`,
    },
    plugins: [
      tinaTailwind(configManager.spaRootPath, configManager.tinaConfigFilePath),
      {
        name: 'transform-tsx',
        transform(code, id) {
          // Vite isn't picking up the right transform for tsx
          // files, we could opt-out of this if the file isn't
          // .tsx but seems to work ok for now.
          // TODO: other loaders needed (eg svg)?
          if (id === configManager.tinaConfigFilePath) {
            return transform(code, { loader: 'tsx' })
          }
          return {
            code,
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
                verbose: true,
              })
              res.end(JSON.stringify(result))
              return
            }

            next()
          })
        },
      },
    ],
  })

  return server
}
