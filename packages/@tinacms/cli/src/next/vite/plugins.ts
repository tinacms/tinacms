import type { Plugin } from 'vite'
import { createFilter, FilterPattern } from '@rollup/pluginutils'
import type { Config } from '@svgr/core'
import fs from 'fs'
import { transformWithEsbuild } from 'vite'
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
import { createSearchIndexRouter } from '../commands/dev-command/server/searchIndex'

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
  searchIndex,
}: {
  apiURL: string
  database: Database
  configManager: ConfigManager
  searchIndex: any
}) => {
  const plug: Plugin = {
    name: 'graphql-endpoints',
    configureServer(server) {
      server.middlewares.use(cors())
      server.middlewares.use(bodyParser.json({ limit: '5mb' }))
      server.middlewares.use(async (req, res, next: Function) => {
        const mediaPaths = configManager.config.media?.tina
        const mediaRouter = createMediaRouter({
          rootPath: configManager.rootPath,
          apiURL,
          publicFolder: parseMediaFolder(mediaPaths?.publicFolder || ''),
          mediaRoot: parseMediaFolder(mediaPaths?.mediaRoot || ''),
        })
        const searchIndexRouter = createSearchIndexRouter({
          config: { apiURL, searchPath: 'searchIndex' },
          searchIndex,
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

        if (req.url.startsWith('/searchIndex')) {
          if (req.method === 'POST') {
            await searchIndexRouter.put(req, res)
          } else if (req.method === 'GET') {
            await searchIndexRouter.get(req, res)
          } else if (req.method === 'DELETE') {
            await searchIndexRouter.del(req, res)
          }
          return
        }

        next()
      })
    },
  }
  return plug
}

// Copied from https://github.com/pd4d10/vite-plugin-svgr/blob/main/src/index.ts and modified to suite our needs
export interface ViteSvgrOptions {
  /**
   * Export React component as default. Notice that it will overrides
   * the default behavior of Vite, which exports the URL as default
   *
   * @default false
   */
  exportAsDefault?: boolean
  svgrOptions?: Config
  esbuildOptions?: Parameters<typeof transformWithEsbuild>[2]
  exclude?: FilterPattern
  include?: FilterPattern
}

export function viteTransformExtension({
  exportAsDefault = true,
  svgrOptions,
  esbuildOptions,
  include = '**/*.svg',
  exclude,
}: ViteSvgrOptions = {}): Plugin {
  const filter = createFilter(include, exclude)
  return {
    name: 'vite-plugin-svgr',
    async transform(code, id) {
      if (filter(id)) {
        const { transform } = await import('@svgr/core')
        const svgCode = await fs.promises.readFile(
          id.replace(/\?.*$/, ''),
          'utf8'
        )

        const componentCode = await transform(svgCode, svgrOptions, {
          filePath: id,
          caller: {
            previousExport: exportAsDefault ? null : code,
          },
        })

        const res = await transformWithEsbuild(componentCode, id, {
          loader: 'jsx',
          ...esbuildOptions,
        })

        return {
          code: res.code,
          map: null, // TODO:
        }
      }
    },
  }
}
