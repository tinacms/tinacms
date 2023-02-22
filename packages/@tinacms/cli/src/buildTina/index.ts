/**

 */

import fs from 'fs-extra'

import {
  buildSchema,
  createDatabase,
  Database,
  getASTSchema,
} from '@tinacms/graphql'
import { AuditFileSystemBridge, FilesystemBridge } from '@tinacms/datalayer'
import { MemoryLevel } from 'memory-level'
import path from 'path'
import { DocumentNode } from 'graphql'
import { compileSchema, resetGeneratedFolder } from '../cmds/compile'
import { genClient, genTypes } from '../cmds/query-gen'
import { viteBuild } from '@tinacms/app'
import { spin } from '../utils/spinner'
import { isProjectTs } from './attachPath'
import { logger } from '../logger'
import { logText, warnText } from '../utils/theme'

interface ClientGenOptions {
  noSDK?: boolean
  local?: boolean
  verbose?: boolean
  port?: number
  rootPath?: string
}

interface BuildOptions {
  local: boolean
  dev?: boolean
  verbose?: boolean
  rootPath?: string
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
  await buildSetup({
    ...opts,
    rootPath,
  })
  // attach to context
  ctx.builder = new ConfigBuilder(ctx.database)

  next()
}

export const buildSetupCmdServerStart = async (
  ctx: any,
  next: () => void,
  opts: BuildSetupOptions
) => {
  const rootPath = ctx.rootPath as string
  await buildSetup({
    ...opts,
    rootPath,
  })
  // attach to context
  ctx.builder = new ConfigBuilder(ctx.database)

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

  await fs.ensureDirSync(path.join(rootPath, '.tina', '__generated__'))

  const database = await createDatabase({
    level: new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    }),
    bridge,
  })

  // attach to context
  ctx.bridge = bridge
  ctx.database = database
  ctx.builder = new ConfigBuilder(ctx.database)

  next()
}

const buildSetup = async ({ rootPath }: { rootPath: string }) => {
  await fs.ensureDirSync(path.join(rootPath, '.tina', '__generated__'))
}

export const buildCmdBuild = async (
  ctx: {
    builder: ConfigBuilder
    database: Database
    graphQLSchema: DocumentNode
    rootPath: string
    usingTs: boolean
    schema: unknown
    apiUrl: string
    tinaSchema: any
  },
  next: () => void,
  options: Omit<
    BuildOptions & BuildSetupOptions & ClientGenOptions,
    'bridge' | 'database' | 'store'
  >
) => {
  // always skip indexing in the "build" command
  const { schema, graphQLSchema, tinaSchema } = await ctx.builder.build({
    rootPath: ctx.rootPath,
    ...options,
  })
  ctx.schema = schema
  ctx.graphQLSchema = graphQLSchema
  ctx.tinaSchema = tinaSchema
  const apiUrl = await ctx.builder.genTypedClient({
    compiledSchema: schema,
    local: options.local,
    noSDK: options.noSDK,
    verbose: options.verbose,
    usingTs: ctx.usingTs,
    rootPath: ctx.rootPath,
    port: options.port,
  })
  ctx.apiUrl = apiUrl
  await buildAdmin({
    local: options.local,
    rootPath: ctx.rootPath,
    schema,
    apiUrl,
  })
  next()
}

export const auditCmdBuild = async (
  ctx: {
    builder: ConfigBuilder
    rootPath: string
    database: Database
  },
  next: () => void,
  options: Omit<
    BuildOptions & BuildSetupOptions,
    'bridge' | 'database' | 'store'
  >
) => {
  const { graphQLSchema, tinaSchema } = await ctx.builder.build({
    rootPath: ctx.rootPath,
    ...options,
    verbose: true,
  })

  await spin({
    waitFor: async () => {
      await ctx.database.indexContent({ graphQLSchema, tinaSchema })
    },
    text: 'Indexing local files',
  })

  next()
}

export const indexIntoSelfHostedDatabase = async (
  ctx: {
    builder: ConfigBuilder
    isSelfHostedDatabase?: boolean
    rootPath: string
    database: Database
    graphQLSchema: DocumentNode
    schema: any
    tinaSchema: any
  },
  next: () => void
) => {
  if (!ctx.isSelfHostedDatabase) {
    return next()
  }

  const { graphQLSchema, tinaSchema } = ctx

  await spin({
    waitFor: async () => {
      await ctx.database.indexContent({ graphQLSchema, tinaSchema })
    },
    text: 'Indexing to self-hosted database',
  })

  next()
}

export class ConfigBuilder {
  constructor(private database: Database) {}

  async build({ dev, verbose, rootPath, local }: BuildOptions): Promise<{
    schema: any
    graphQLSchema: DocumentNode
    tinaSchema: any
  }> {
    const usingTs = await isProjectTs(rootPath)

    if (!rootPath) {
      throw new Error('Root path has not been attached')
    }
    const tinaGeneratedPath = path.join(rootPath!, '.tina', '__generated__')

    // Clear the cache of the DB passed to the GQL server
    this.database.clearCache()

    await fs.mkdirp(tinaGeneratedPath)
    await resetGeneratedFolder({
      tinaGeneratedPath,
      usingTs,
      isBuild: !local,
    })

    const compiledSchema = await compileSchema({
      verbose,
      dev,
      rootPath,
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
        localContentPath = path.join(process.cwd(), '.tina', localContentPath)
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

    const { graphQLSchema, tinaSchema } = await buildSchema(
      rootPath,
      this.database,
      ['experimentalData', 'isomorphicGitBridge']
    )

    return { schema: compiledSchema, graphQLSchema, tinaSchema }
  }

  async genTypedClient({
    usingTs,
    compiledSchema,
    noSDK,
    verbose,
    local,
    port,
    rootPath,
  }: ClientGenOptions & {
    usingTs: boolean
    compiledSchema: any
  }) {
    const astSchema = await getASTSchema(this.database)

    await genTypes({ schema: astSchema, usingTs, rootPath }, () => {}, {
      noSDK,
      verbose,
    })

    return genClient(
      { tinaSchema: compiledSchema, usingTs, rootPath },
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
  apiUrl,
}: {
  schema: any
  local: boolean
  rootPath: string
  apiUrl: string
}) => {
  if (schema?.config?.build) {
    const buildVite = async () => {
      await viteBuild({
        local,
        rootPath,
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
