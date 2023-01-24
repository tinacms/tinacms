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

import fs from 'fs-extra'

import {
  Bridge,
  buildSchema,
  createDatabase,
  Database,
  getASTSchema,
} from '@tinacms/graphql'
import {
  AuditFileSystemBridge,
  FilesystemBridge,
  IsomorphicBridge,
  LevelStore,
} from '@tinacms/datalayer'
import path from 'path'
import { DocumentNode } from 'graphql'
import { compileSchema, resetGeneratedFolder } from '../cmds/compile'
import { genClient, genTypes } from '../cmds/query-gen'
import { makeIsomorphicOptions } from './git'
import { viteBuild } from '@tinacms/app'
import { spin } from '../utils/spinner'
import { isProjectTs } from './attachPath'
import { logger } from '../logger'
import { logText, warnText } from '../utils/theme'

interface ClientGenOptions {
  noSDK?: boolean
  local?: boolean
  verbose?: boolean
  port?: string
  rootPath?: string
  tinaDirectory: string
}

interface BuildOptions {
  local?: boolean
  dev?: boolean
  verbose?: boolean
  rootPath?: string
  tinaDirectory?: string
}

interface BuildSetupOptions {
  isomorphicGitBridge?: boolean
  experimentalData?: boolean
}

export const buildSetupCmdBuild = async <
  C extends { rootPath: string; tinaDirectory: string }
>(args: {
  context: C
  options: BuildSetupOptions
}) => {
  const rootPath = args.context.rootPath
  const { bridge, database } = await buildSetup({
    ...args.options,
    rootPath,
    tinaDirectory: args.context.tinaDirectory,
    useMemoryStore: true,
  })
  // attach to context
  const builder = new ConfigBuilder(database)

  return {
    ...args.context,
    bridge,
    database,
    builder,
  }
}

export const buildSetupCmdServerStart = async <
  C extends { rootPath: string; tinaDirectory: string }
>(args: {
  context: C
  options: BuildSetupOptions
}): Promise<
  C & {
    bridge: Bridge
    database: Database
    builder: ConfigBuilder
  }
> => {
  const rootPath = args.context.rootPath as string
  const { bridge, database } = await buildSetup({
    ...args.options,
    rootPath,
    tinaDirectory: args.context.tinaDirectory,
    useMemoryStore: false,
  })
  const builder = new ConfigBuilder(database)
  return {
    ...args.context,
    bridge,
    database,
    builder,
  }
}
export const buildSetupCmdAudit = async (args: {
  context: { rootPath: string; tinaDirectory: string }
  options: { clean?: boolean }
}) => {
  const rootPath = args.context.rootPath as string
  const bridge = args.options.clean
    ? new FilesystemBridge(rootPath)
    : new AuditFileSystemBridge(rootPath)

  await fs.ensureDirSync(
    path.join(rootPath, args.context.tinaDirectory, '__generated__')
  )
  const store = new LevelStore(rootPath, false)

  const database = await createDatabase({
    store,
    bridge,
    tinaDirectory: args.context.tinaDirectory,
  })

  const builder = new ConfigBuilder(database)

  return {
    ...args.context,
    bridge,
    database,
    builder,
  }
}

const buildSetup = async ({
  isomorphicGitBridge,
  rootPath,
  tinaDirectory,
  useMemoryStore,
}: BuildSetupOptions & {
  rootPath: string
  tinaDirectory: string
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

  await fs.ensureDirSync(path.join(rootPath, tinaDirectory, '__generated__'))

  const store = new LevelStore(rootPath, useMemoryStore, tinaDirectory)

  const database = await createDatabase({ store, bridge, tinaDirectory })

  return { database, bridge, store }
}

export const buildCmdBuild = async <C extends object>(args: {
  context: C & {
    builder: ConfigBuilder
    rootPath: string
    tinaDirectory: string
    usingTs: boolean
  }
  options: Omit<
    BuildOptions & BuildSetupOptions & ClientGenOptions,
    'bridge' | 'database' | 'store'
  >
}) => {
  // always skip indexing in the "build" command
  const { schema } = await args.context.builder.build({
    rootPath: args.context.rootPath,
    ...args.options,
  })
  // .schema = schema
  const apiUrl = await args.context.builder.genTypedClient({
    compiledSchema: schema,
    local: args.options.local,
    noSDK: args.options.noSDK,
    verbose: args.options.verbose,
    usingTs: args.context.usingTs,
    rootPath: args.context.rootPath,
    tinaDirectory: args.context.tinaDirectory,
    port: args.options.port,
  })
  await buildAdmin({
    local: args.options.local,
    rootPath: args.context.rootPath,
    tinaDirectory: args.context.tinaDirectory,
    schema,
    apiUrl,
  })
  return {
    ...args.context,
    schema,
    apiUrl,
  }
}

export const auditCmdBuild = async (args: {
  context: { builder: ConfigBuilder; rootPath: string; database: Database }
  options: Omit<
    BuildOptions & BuildSetupOptions,
    'bridge' | 'database' | 'store'
  >
}) => {
  const { graphQLSchema, tinaSchema, lookup } =
    await args.context.builder.build({
      rootPath: args.context.rootPath,
      ...args.options,
      verbose: true,
    })

  await spin({
    waitFor: async () => {
      await args.context.database.indexContent({
        graphQLSchema,
        tinaSchema,
        lookup,
      })
    },
    text: 'Indexing local files',
  })

  return {
    ...args.context,
  }
}

export class ConfigBuilder {
  constructor(private database: Database) {}

  async build({
    dev,
    verbose,
    rootPath,
    tinaDirectory,
    local,
  }: BuildOptions): Promise<{
    schema: any
    graphQLSchema: DocumentNode
    tinaSchema: any
    lookup: object
  }> {
    const usingTs = await isProjectTs(rootPath, tinaDirectory)

    if (!rootPath) {
      throw new Error('Root path has not been attached')
    }
    const tinaGeneratedPath = path.join(
      rootPath!,
      tinaDirectory,
      '__generated__'
    )

    // Clear the cache of the DB passed to the GQL server
    this.database.clearCache()

    await fs.mkdirp(tinaGeneratedPath)
    await this.database.store.close()
    await resetGeneratedFolder({
      tinaGeneratedPath,
      usingTs,
      isBuild: !local,
    })
    await this.database.store.open()

    const compiledSchema = await compileSchema({
      verbose,
      dev,
      rootPath,
      tinaDirectory,
    })
    // FIXME: the bridge is initialized before we have access to the config,
    // ideally this is available to us during Bridge init but as a workaround
    // we add it here.
    if (
      this.database.bridge.addOutputPath &&
      compiledSchema.config?.localContentPath
    ) {
      if (compiledSchema?.config?.media?.tina) {
        throw new Error(
          `"media.tina" is not supported when the "localContentPath" property is present.`
        )
      }
      let localContentPath = compiledSchema.config.localContentPath
      if (!localContentPath.startsWith('/')) {
        localContentPath = path.join(rootPath, tinaDirectory, localContentPath)
      }
      if (await fs.pathExists(localContentPath)) {
        logger.info(logText(`Using separate content path ${localContentPath}`))
      } else {
        logger.warn(
          warnText(
            `Using separate content path ${localContentPath}
  but no directory was found at that location, creating one...`
          )
        )
        await fs.mkdir(localContentPath)
      }
      this.database.bridge.addOutputPath(localContentPath)
    }

    const { graphQLSchema, tinaSchema, fragString, queriesString } =
      await buildSchema(rootPath, tinaDirectory, this.database, [
        'experimentalData',
        'isomorphicGitBridge',
      ])

    const fragPath = path.join(
      rootPath,
      tinaDirectory,
      '__generated__',
      'frags.gql'
    )
    await fs.outputFileSync(fragPath, fragString)
    if (
      (await (await fs.stat(fragPath)).size) >
      // convert to 100 kb to bytes
      100 * 1024
    ) {
      console.warn(
        'Warning: frags.gql is very large (>100kb). Consider setting the reference depth to 1 or 0. See code snippet below.'
      )
      console.log(
        `const schema = defineSchema({
          config: {
              client: {
                  referenceDepth: 1,
              },
          }
          // ...
      })`
      )
    }
    await fs.outputFileSync(
      path.join(rootPath, tinaDirectory, '__generated__', 'queries.gql'),
      queriesString
    )
    if (tinaDirectory === 'tina') {
      const schemaJSON = await fs
        .readFileSync(
          path.join(rootPath, tinaDirectory, '__generated__', '_schema.json')
        )
        .toString()
      const lookupJSON = await fs
        .readFileSync(
          path.join(rootPath, tinaDirectory, '__generated__', '_lookup.json')
        )
        .toString()
      const graphqlJSON = await fs
        .readFileSync(
          path.join(rootPath, tinaDirectory, '__generated__', '_graphql.json')
        )
        .toString()
      await fs.outputFileSync(
        path.join(rootPath, tinaDirectory, 'tina-lock.json'),
        JSON.stringify({
          schemaJSON: JSON.parse(schemaJSON),
          lookupJSON: JSON.parse(lookupJSON),
          graphqlJSON: JSON.parse(graphqlJSON),
        })
      )
    }

    return {
      schema: compiledSchema,
      graphQLSchema,
      tinaSchema,
      lookup: JSON.parse(lookupJSON),
    }
  }

  async genTypedClient({
    usingTs,
    compiledSchema,
    noSDK,
    verbose,
    local,
    port,
    rootPath,
    tinaDirectory,
  }: ClientGenOptions & {
    usingTs: boolean
    compiledSchema: any
  }) {
    const astSchema = await getASTSchema(this.database)

    await genTypes(
      { schema: astSchema, usingTs, rootPath, tinaDirectory },
      () => {},
      {
        noSDK,
        verbose,
      }
    )

    return genClient(
      { tinaSchema: compiledSchema, usingTs, rootPath, tinaDirectory },
      {
        local,
        port,
      }
    )
  }
}

export const buildAdmin = async ({
  schema,
  local,
  rootPath,
  tinaDirectory,
  apiUrl,
}: {
  schema: any
  local: boolean
  rootPath: string
  tinaDirectory: string
  apiUrl: string
}) => {
  if (schema?.config?.build) {
    const buildVite = async () => {
      await viteBuild({
        local,
        rootPath,
        tinaDirectory,
        outputFolder: schema?.config?.build?.outputFolder as string,
        publicFolder: schema?.config?.build?.publicFolder as string,
        apiUrl,
        host: schema?.config?.build?.host ?? false,
      })
    }
    // Local runs an asset server as a long-lived task, don't show spinning animation
    if (local) {
      logger.info(logText('Starting Tina asset server'))
      await buildVite()
    } else {
      await spin({
        text: logText('Building static site'),
        waitFor: buildVite,
      })
      logger.info(logText('\nDone building static site'))
    }
  }
}
