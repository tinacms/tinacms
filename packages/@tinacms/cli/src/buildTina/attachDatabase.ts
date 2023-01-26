/**

 */

import { getPath } from '../lib'
import * as path from 'path'
import { transpile } from '../cmds/compile'
import { BuildSchemaError } from '../cmds/start-server/errors'
import { FilesystemBridge, IsomorphicBridge } from '@tinacms/datalayer'
import { createDatabase, TinaLevelClient } from '@tinacms/graphql'
import fs from 'fs-extra'
import { makeIsomorphicOptions } from './git'
import { MemoryLevel } from 'memory-level'
import { ManyLevelHost } from 'many-level'
import { pipeline } from 'readable-stream'
import { createServer } from 'net'

export const attachDatabase = async (
  ctx: any,
  next: () => void,
  _options: {
    isomorphicGitBridge: boolean
    dev: boolean
    verbose: boolean
  }
) => {
  const tinaPath = path.join(ctx.rootPath, '.tina')
  const tinaGeneratedPath = path.join(tinaPath, '__generated__')
  const tinaTempPath = path.join(tinaGeneratedPath, `temp_database`)
  const define = {}
  if (!process.env.NODE_ENV) {
    define['process.env.NODE_ENV'] = _options.dev
      ? '"development"'
      : '"production"'
  }
  const inputFile = getPath({
    projectDir: path.join(ctx.rootPath, '.tina'),
    filename: 'database',
    allowedTypes: ['js', 'jsx', 'tsx', 'ts'],
  })
  const fsBridge = new FilesystemBridge(ctx.rootPath)

  console.log('init level host')

  const levelHost = new ManyLevelHost(
    // @ts-ignore
    new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    })
  )

  const server = createServer(function (socket) {
    // Pipe socket into host stream and vice versa
    pipeline(socket, levelHost.createRpcStream(), socket, () => {
      // Disconnected
    })
  })
  console.log('done init level host')

  server.listen(9000)
  ctx.dbServer = server

  if (inputFile) {
    try {
      await transpile(
        inputFile,
        'database.cjs',
        tinaTempPath,
        _options.verbose,
        define,
        path.join(ctx.rootPath, 'package.json'),
        'node'
      )
    } catch (e) {
      await fs.remove(tinaTempPath)
      throw new BuildSchemaError(e)
    }

    // Delete the node require cache for .tina temp folder
    Object.keys(require.cache).map((key) => {
      if (key.startsWith(tinaTempPath)) {
        delete require.cache[require.resolve(key)]
      }
    })

    try {
      const databaseFunc = require(path.join(tinaTempPath, `database.cjs`))
      ctx.database = databaseFunc.default
      ctx.database.bridge = fsBridge
      ctx.bridge = ctx.database.bridge
      ctx.isSelfHostedDatabase = true
      await fs.remove(tinaTempPath)
    } catch (e) {
      // Always remove the temp code
      await fs.remove(tinaTempPath)

      throw e
    }
  } else {
    /**
     * To work with Github directly, replace the Bridge and Store
     * and ensure you've provided your access token.
     * NOTE: when talking the the tinacms repo, you must
     * give your personal access token access to the TinaCMS org
     */
    // const ghConfig = {
    //   rootPath: 'examples/tina-cloud-starter',
    //   accessToken: '<my-token>',
    //   owner: 'tinacms',
    //   repo: 'tinacms',
    //   ref: 'add-data-store',
    // }
    // const bridge = new GithubBridge(ghConfig)
    // const store = new GithubStore(ghConfig)

    const bridge = _options.isomorphicGitBridge
      ? new IsomorphicBridge(
          ctx.rootPath,
          _options.isomorphicGitBridge &&
            (await makeIsomorphicOptions(fsBridge))
        )
      : fsBridge

    const level = new TinaLevelClient()
    level.openConnection()

    ctx.database = await createDatabase({ level, bridge })
    ctx.bridge = bridge
  }
  next()
}
