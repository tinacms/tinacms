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

import { Bridge, buildSchema, createDatabase, Database } from '@tinacms/graphql'
import {
  FilesystemBridge,
  FilesystemStore,
  IsomorphicBridge,
  LevelStore,
  Store,
} from '@tinacms/datalayer'

import { compileSchema, resetGeneratedFolder } from '../cmds/compile'
import { genClient, genTypes } from '../cmds/query-gen'
import { makeIsomorphicOptions } from './git'

interface BuildOptions {
  rootPath: string
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
}

interface BuildSetupOptions {
  rootPath: string
  isomorphicGitBridge?: boolean
  experimentalData?: boolean
}

export const buildSetup = async ({
  rootPath,
  isomorphicGitBridge,
  experimentalData,
}: BuildSetupOptions) => {
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

  const store = experimentalData
    ? new LevelStore(rootPath)
    : new FilesystemStore({ rootPath })

  const database = await createDatabase({ store, bridge })

  return { bridge, database, store }
}

export const build = async ({
  noWatch,
  rootPath,
  ctx,
  bridge,
  database,
  store,
  beforeBuild,
  afterBuild,
  dev,
  isomorphicGitBridge,
  local,
  verbose,
  noSDK,
}: BuildOptions) => {
  // Clear the cache of the DB passed to the GQL server
  database.clearCache()

  if (beforeBuild) {
    await beforeBuild()
  }

  try {
    if (!process.env.CI && !noWatch) {
      await store.close()
      await resetGeneratedFolder()
      await store.open()
    }
    const cliFlags = []
    if (isomorphicGitBridge) {
      cliFlags.push('isomorphicGitBridge')
    }
    const database = await createDatabase({ store, bridge })
    await compileSchema(ctx, null, { verbose, dev })
    const schema = await buildSchema(rootPath, database, cliFlags)
    await genTypes({ schema }, () => {}, { noSDK, verbose })
    await genClient({ tinaSchema: ctx.schema }, () => {}, { local })
  } catch (error) {
    throw error
  } finally {
    if (afterBuild) {
      await afterBuild()
    }
  }
}

export async function setupAndBuild(
  args: Omit<BuildOptions & BuildSetupOptions, 'bridge' | 'database' | 'store'>
) {
  const { bridge, database, store } = await buildSetup({ ...args })
  await build({ ...args, bridge, database, store })
}
