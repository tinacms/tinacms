/**
 Copyright 2021 Forestry.io Holdings, Inc.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import retry from 'async-retry'
import fs from 'fs-extra'

import { Bridge, buildSchema, createDatabase, Database } from '@tinacms/graphql'
import {
  AuditFileSystemBridge,
  FilesystemBridge,
  IsomorphicBridge,
  LevelStore,
  Store,
} from '@tinacms/datalayer'
import path from 'path'

import { compileSchema, resetGeneratedFolder } from '../cmds/compile'
import { genClient, genTypes } from '../cmds/query-gen'
import { makeIsomorphicOptions } from './git'
import type { GraphQLSchema } from 'graphql'
import { viteBuild } from '@tinacms/app'
import { logger } from '../logger'
import { spin } from '../utils/spinner'

interface BuildOptions {
  ctx: any
  database: Database
  store: Store
  bridge: Bridge
  noWatch?: boolean
  isomorphicGitBridge?: boolean
  verbose?: boolean
  dev?: boolean
  local?: boolean
  noSDK?: boolean
  beforeBuild?: () => Promise<any>
  afterBuild?: () => Promise<any>
  skipIndex?: boolean
}

interface BuildSetupOptions {
  isomorphicGitBridge?: boolean
  experimentalData?: boolean
}

export const buildSetupCmdBuild = async (
  ctx: any,
  next: () => void,
  opts: BuildSetupOptions
) => {
  const rootPath = ctx.rootPath as string
  const { bridge, database, store } = await buildSetup({
    ...opts,
    rootPath,
    useMemoryStore: true,
  })
  // attach to context
  ctx.bridge = bridge
  ctx.database = database
  ctx.store = store
  ctx.builder = new Builder(bridge)

  next()
}

export const buildSetupCmdServerStart = async (
  ctx: any,
  next: () => void,
  opts: BuildSetupOptions
) => {
  const rootPath = ctx.rootPath as string
  const { bridge, database, store } = await buildSetup({
    ...opts,
    rootPath,
    useMemoryStore: false,
  })
  // attach to context
  ctx.bridge = bridge
  ctx.database = database
  ctx.store = store
  ctx.builder = new Builder(ctx.bridge)

  next()
}
export const buildSetupCmdAudit = async (
  ctx: any,
  next: () => void,
  options: { clean: boolean }
) => {
  const rootPath = ctx.rootPath as string
  const bridge = options.clean
    ? new FilesystemBridge(rootPath)
    : new AuditFileSystemBridge(rootPath)

  const store = new LevelStore(rootPath, false)

  const database = await createDatabase({ store, bridge })

  // attach to context
  ctx.bridge = bridge
  ctx.database = database
  ctx.store = store
  ctx.builder = new Builder(bridge)

  next()
}

const buildSetup = async ({
  isomorphicGitBridge,
  experimentalData,
  rootPath,
  useMemoryStore,
}: BuildSetupOptions & {
  rootPath: string
  useMemoryStore: boolean
}) => {
  const fsBridge = new FilesystemBridge(rootPath)
  const isomorphicOptions =
    isomorphicGitBridge && (await makeIsomorphicOptions(fsBridge))

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

  const bridge = isomorphicGitBridge
    ? new IsomorphicBridge(rootPath, isomorphicOptions)
    : fsBridge

  // const store = experimentalData
  //   ? new LevelStore(rootPath, useMemoryStore)
  //   : new FilesystemStore({ rootPath })

  const store = new LevelStore(rootPath, useMemoryStore)

  const database = await createDatabase({ store, bridge })

  return { database, bridge, store }
}

export const buildCmdBuild = async (
  ctx: any,
  next: () => void,
  options: Omit<
    BuildOptions & BuildSetupOptions,
    'bridge' | 'database' | 'store'
  >
) => {
  const bridge: Bridge = ctx.bridge
  const database: Database = ctx.database
  const store: Store = ctx.store
  // always skip indexing in the "build" command
  await ctx.builder.build({
    ...options,
    database,
    store,
    ctx: ctx,
    skipIndex: true,
  })
  next()
}

export const auditCmdBuild = async (
  ctx: any,
  next: () => void,
  options: Omit<
    BuildOptions & BuildSetupOptions,
    'bridge' | 'database' | 'store'
  >
) => {
  const bridge: Bridge = ctx.bridge
  const database: Database = ctx.database
  const store: Store = ctx.store
  await ctx.builder.build({
    ...options,
    local: true,
    verbose: true,
    database,
    store,
    ctx: ctx,
  })
  next()
}

class Builder {
  constructor(private bridge: IsomorphicBridge | FilesystemBridge) {}

  async build({
    noWatch,
    ctx,
    database,
    store,
    beforeBuild,
    afterBuild,
    dev,
    local,
    verbose,
    noSDK,
    skipIndex,
  }: BuildOptions) {
    const rootPath = ctx.rootPath as string
    if (!rootPath) {
      throw new Error('Root path has not been attached')
    }
    const tinaGeneratedPath = path.join(rootPath, '.tina', '__generated__')

    // Clear the cache of the DB passed to the GQL server
    database.clearCache()

    if (beforeBuild) {
      await beforeBuild()
    }

    try {
      await fs.mkdirp(tinaGeneratedPath)
      await store.close()
      await resetGeneratedFolder({
        tinaGeneratedPath,
        usingTs: ctx.usingTs,
      })
      await store.open()
      const cliFlags = []
      // always enable experimentalData and isomorphicGitBridge on the  backend
      cliFlags.push('experimentalData')
      cliFlags.push('isomorphicGitBridge')
      const database = await createDatabase({ store, bridge: this.bridge })
      await compileSchema(ctx, null, { verbose, dev })

      // This retry is in place to allow retrying when another process is building at the same time. This causes a race condition when cretin files might be deleted
      const schema: GraphQLSchema = await retry(
        async () => await buildSchema(rootPath, database, cliFlags, skipIndex)
      )
      await genTypes({ schema, usingTs: ctx.usingTs }, () => {}, {
        noSDK,
        verbose,
      })
      await genClient(
        { tinaSchema: ctx.schema, usingTs: ctx.usingTs },
        () => {},
        {
          local,
        }
      )
      if (ctx.schema?.config?.build) {
        await spin({
          text: 'Building static site',
          waitFor: async () => {
            await viteBuild({
              local,
              rootPath,
              outputFolder: ctx.schema?.config?.build?.outputFolder as string,
              publicFolder: ctx.schema?.config?.build?.publicFolder as string,
            })
          },
        })
        console.log('\nDone building static site')
      }
    } catch (error) {
      throw error
    } finally {
      if (afterBuild) {
        await afterBuild()
      }
    }
  }
}
