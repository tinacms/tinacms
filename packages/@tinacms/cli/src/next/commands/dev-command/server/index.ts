import { createServer as createViteServer } from 'vite'
import bodyParser from 'body-parser'
import cors from 'cors'
import { resolve as gqlResolve, Database } from '@tinacms/graphql'
import { tinaTailwind } from '../tailwind'
import { ConfigManager } from '../../../config-manager'
import { createMediaRouter } from './routes'
import { parseMediaFolder } from './models/media'
import { transform as esbuildTransform } from 'esbuild'
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
  // TODO: make this configurable
  const publicEnv: Record<string, string> = {}
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith('TINA_PUBLIC_') ||
      key.startsWith('NEXT_PUBLIC_') ||
      key === 'NODE_ENV' ||
      key === 'HEAD'
    ) {
      try {
        // if the value is a string, we can just use it
        if (typeof process.env[key] === 'string') {
          publicEnv[key] = process.env[key] as string
        } else {
          // otherwise, we need to stringify it
          publicEnv[key] = JSON.stringify(process.env[key])
        }
      } catch (error) {
        // if we can't stringify it, we'll just warn the user
        console.warn(
          `Could not stringify public env process.env.${key} env variable`
        )
        console.warn(error)
      }
    }
  })
  const server = await createViteServer({
    root: configManager.spaRootPath,
    base: `/public/`,
    appType: 'spa',
    resolve: {
      alias: {
        TINA_IMPORT: configManager.tinaConfigFilePath,
        SCHEMA_IMPORT: configManager.generatedGraphQLJSONPath,
      },
      dedupe: ['graphql', 'tinacms', '@tinacms/toolkit', 'react', 'react-dom'],
    },
    define: {
      /**
       * Since we prebuild the config.ts, it's possible for modules to be loaded which make
       * use of `process`. The main scenario where this is an issue is when co-locating schema
       * definitions with source files, and specifically source files which impor from NextJS.
       *
       * Some examples of what NextJS uses for `process.env` are:
       *  - `process.env.__NEXT_TRAILING_SLASH`
       *  - `process.env.__NEXT_CROSS_ORIGIN`
       *  - `process.env.__NEXT_I18N_SUPPORT`
       *
       * Also, interestingly some of the advice for handling this doesn't work, references to replacing
       * `process.env` with `{}` are problematic, because browsers don't understand the `{}.` syntax,
       * but node does. This was a surprise, but using `new Object()` seems to do the trick.
       */
      'process.env': `new Object(${JSON.stringify(publicEnv)})`,
      __API_URL__: `"${apiURL}"`,
    },
    server: {
      fs: {
        strict: false,
      },
    },
    plugins: [
      tinaTailwind(configManager.spaRootPath, configManager.tinaConfigFilePath),
      {
        name: 'transform-tsx',
        async transform(code, id) {
          // Vite isn't picking up the right transform for tsx
          // files, we could opt-out of this if the file isn't
          // .tsx but seems to work ok for now.
          // TODO: other loaders needed (eg svg)?
          if (id === configManager.tinaConfigFilePath) {
            const result = await esbuildTransform(code, { loader: 'tsx' })
            return {
              code: result.code,
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
