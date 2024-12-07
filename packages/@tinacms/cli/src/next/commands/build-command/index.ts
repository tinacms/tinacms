import { Command, Option } from 'clipanion'
import Progress from 'progress'
import fs from 'fs-extra'
import crypto from 'crypto'
import path from 'path'
import type { ViteDevServer } from 'vite'
import { buildSchema, type Database, FilesystemBridge } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { logger, summary } from '../../../logger'
import { buildProductionSpa } from './server'
import { Codegen } from '../../codegen'
import { parseURL } from '@tinacms/schema-tools'
import {
  buildASTSchema,
  buildClientSchema,
  getIntrospectionQuery,
} from 'graphql'
import { diff } from '@graphql-inspector/core'
import { type IndexStatusResponse, waitForDB } from './waitForDB'
import { createAndInitializeDatabase, createDBServer } from '../../database'
import { sleepAndCallFunc } from '../../../utils/sleep'
import { dangerText, linkText, warnText } from '../../../utils/theme'
import {
  type SearchClient,
  SearchIndexer,
  TinaCMSSearchIndexClient,
} from '@tinacms/search'
import { spin } from '../../../utils/spinner'
import { createDevServer } from '../dev-command/server'
import { BaseCommand } from '../baseCommands'
import { logText } from '../../../utils/theme'

export class BuildCommand extends BaseCommand {
  static paths = [['build']]
  localOption = Option.Boolean('--local', {
    description:
      'Starts local Graphql server and builds the local client instead of production client',
  })
  skipIndexing = Option.Boolean('--skip-indexing', false, {
    description:
      'Skips indexing the content. This can be used for building the site without indexing the content  (defaults to false)',
  })
  partialReindex = Option.Boolean('--partial-reindex', false, {
    description:
      'Re-indexes only the content that has changed since the last build (defaults to false). Not currently supported for separate content repos.',
  })
  tinaGraphQLVersion = Option.String('--tina-graphql-version', {
    description:
      'Specify the version of @tinacms/graphql to use (defaults to latest)',
  })
  /**
   * This option allows the user to skip the tina cloud checks if they want to. This could be useful for mismatched GraphQL versions or if they want to build only using the local client and never connect to Tina Cloud
   */
  skipCloudChecks = Option.Boolean('--skip-cloud-checks', false, {
    description: 'Skips checking the provided cloud config.',
  })
  skipSearchIndex = Option.Boolean('--skip-search-index', false, {
    description: 'Skip indexing the site for search',
  })
  upstreamBranch = Option.String('--upstream-branch', {
    description:
      'Optional upstream branch with the schema. If not specified, default will be used.',
  })
  previewBaseBranch = Option.String('--preview-base-branch', {
    description: 'The base branch for the preview',
  })
  previewName = Option.String('--preview-name', {
    description: 'The name of the preview branch',
  })
  noClientBuildCache = Option.Boolean('--no-client-build-cache', false, {
    description: 'Disables the client build cache',
  })

  static usage = Command.Usage({
    category: `Commands`,
    description: `Build the CMS and autogenerated modules for usage with Tina Cloud`,
  })

  async catch(error: any): Promise<void> {
    console.error(error)
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    logger.info('Starting Tina build')
    this.logDeprecationWarnings()
    const configManager = new ConfigManager({
      rootPath: this.rootPath,
      tinaGraphQLVersion: this.tinaGraphQLVersion,
      legacyNoSDK: this.noSDK,
    })

    if (this.previewName && !this.previewBaseBranch) {
      logger.error(
        `${dangerText(
          `ERROR: preview name provided without a preview base branch.`
        )}`
      )
      process.exit(1)
    }

    if (this.previewBaseBranch && !this.previewName) {
      logger.error(
        `${dangerText(
          `ERROR: preview base branch provided without a preview name.`
        )}`
      )
      process.exit(1)
    }

    try {
      await configManager.processConfig()
    } catch (e) {
      logger.error(`\n${dangerText(e.message)}`)
      logger.error(
        dangerText('Unable to build, please fix your Tina config and try again')
      )
      process.exit(1)
    }
    let server: ViteDevServer | undefined
    // Initialize the host TCP server
    createDBServer(Number(this.datalayerPort))
    const database = await createAndInitializeDatabase(
      configManager,
      Number(this.datalayerPort)
    )

    const { queryDoc, fragDoc, graphQLSchema, tinaSchema, lookup } =
      await buildSchema(configManager.config)

    const codegen = new Codegen({
      configManager: configManager,
      port: this.localOption ? Number(this.port) : undefined,
      isLocal: this.localOption,
      queryDoc,
      fragDoc,
      graphqlSchemaDoc: graphQLSchema,
      tinaSchema,
      lookup,
      noClientBuildCache: this.noClientBuildCache,
    })
    const apiURL = await codegen.execute()

    // Always index the content if we are building locally (and not skipping indexing)
    if (
      (configManager.hasSelfHostedConfig() || this.localOption) &&
      !this.skipIndexing
    ) {
      // if we are building locally use the default spinner text
      const text = this.localOption
        ? undefined
        : 'Indexing to self-hosted data layer'
      try {
        await this.indexContentWithSpinner({
          text,
          database,
          graphQLSchema,
          tinaSchema,
          configManager,
          partialReindex: this.partialReindex,
        })
      } catch (e) {
        logger.error(`\n\n${dangerText(e.message)}\n`)
        if (this.verbose) {
          console.error(e)
        }
        process.exit(1)
      }
    }

    if (this.localOption) {
      // start the dev server if we are building locally
      server = await createDevServer(
        configManager,
        database,
        null,
        apiURL,
        true
      )
      await server.listen(Number(this.port))
      console.log('server listening on port', this.port)
    }

    const skipCloudChecks =
      this.skipCloudChecks || configManager.hasSelfHostedConfig()

    if (!skipCloudChecks) {
      const { hasUpstream, timestamp } = await this.checkClientInfo(
        configManager,
        codegen.productionUrl,
        this.previewBaseBranch
      )
      if (!hasUpstream && this.upstreamBranch) {
        logger.warn(
          `${dangerText(
            `WARN: Upstream branch '${this.upstreamBranch}' specified but no upstream project was found.`
          )}`
        )
      }
      if (hasUpstream || (this.previewBaseBranch && this.previewName)) {
        await this.syncProject(configManager, codegen.productionUrl, {
          upstreamBranch: this.upstreamBranch,
          previewBaseBranch: this.previewBaseBranch,
          previewName: this.previewName,
        })
      }
      await waitForDB(
        configManager.config,
        codegen.productionUrl,
        this.previewName,
        false
      )
      await this.checkGraphqlSchema(
        configManager,
        database,
        codegen.productionUrl,
        timestamp
      )
      await this.checkTinaSchema(
        configManager,
        database,
        codegen.productionUrl,
        this.previewName,
        this.verbose,
        timestamp
      )
    }

    await buildProductionSpa(configManager, database, codegen.productionUrl)

    // Add the gitignore so the index.html and assets are committed to git
    await fs.outputFile(
      configManager.outputGitignorePath,
      'index.html\nassets/'
    )

    if (
      configManager.config.search &&
      !this.skipSearchIndex &&
      !this.localOption
    ) {
      let client: SearchClient
      const hasTinaSearch = Boolean(configManager.config?.search?.tina)
      if (hasTinaSearch) {
        if (!configManager.config?.branch) {
          logger.error(
            `${dangerText(
              `ERROR: Branch not configured in tina search configuration.`
            )}`
          )
          throw new Error('Branch not configured in tina search configuration.')
        }
        if (!configManager.config?.clientId) {
          logger.error(`${dangerText(`ERROR: clientId not configured.`)}`)
          throw new Error('clientId not configured.')
        }
        if (!configManager.config?.search?.tina?.indexerToken) {
          logger.error(
            `${dangerText(
              `ERROR: indexerToken not configured in tina search configuration.`
            )}`
          )
          throw new Error(
            'indexerToken not configured in tina search configuration.'
          )
        }
        client = new TinaCMSSearchIndexClient({
          apiUrl: `${
            configManager.config.tinaioConfig?.contentApiUrlOverride ||
            'https://content.tinajs.io'
          }/searchIndex/${configManager.config?.clientId}`,
          branch: configManager.config?.branch,
          indexerToken: configManager.config?.search?.tina?.indexerToken,
          stopwordLanguages:
            configManager.config?.search?.tina?.stopwordLanguages,
        })
      } else {
        client = configManager.config?.search?.searchClient
      }

      const searchIndexer = new SearchIndexer({
        batchSize: configManager.config.search?.indexBatchSize || 100,
        bridge: new FilesystemBridge(
          configManager.rootPath,
          configManager.contentRootPath
        ),
        schema: tinaSchema,
        client,
      })
      let err: Error | undefined
      await spin({
        waitFor: async () => {
          try {
            await searchIndexer.indexAllContent()
          } catch (e) {
            err = e
          }
        },
        text: 'Building search index',
      })
      if (err) {
        logger.error(`${dangerText(`ERROR: ${err.message}`)}`)
        process.exit(1)
      }
    }

    const summaryItems = []
    const autogeneratedFiles = []
    if (!configManager.shouldSkipSDK()) {
      autogeneratedFiles.push({
        key: 'GraphQL Client',
        value: configManager.printGeneratedClientFilePath(),
      })
      autogeneratedFiles.push({
        key: 'Typescript Types',
        value: configManager.printGeneratedTypesFilePath(),
      })
    }
    autogeneratedFiles.push({
      key: 'Static HTML file',
      value: configManager.printRelativePath(configManager.outputHTMLFilePath),
    })
    summaryItems.push({
      emoji: '🤖',
      heading: 'Auto-generated files',
      subItems: autogeneratedFiles,
    })

    summary({
      heading: 'Tina build complete',
      items: [
        {
          emoji: '🦙',
          heading: 'Tina Config',
          subItems: [
            {
              key: 'API url',
              value: apiURL,
            },
          ],
        },
        ...summaryItems,
      ],
    })
    if (this.subCommand) {
      await this.startSubCommand()
    } else {
      process.exit()
    }
  }

  async checkClientInfo(
    configManager: ConfigManager,
    apiURL: string,
    previewBaseBranch?: string
  ): Promise<{ hasUpstream: boolean; timestamp: number }> {
    const { config } = configManager
    const token = config.token
    const { clientId, branch, host } = parseURL(apiURL)

    const url = `https://${host}/db/${clientId}/status/${
      previewBaseBranch || branch
    }`
    const bar = new Progress('Checking clientId and token. :prog', 1)

    // Check the client information
    let branchKnown = false
    let hasUpstream = false
    let timestamp: number
    try {
      const res = await request({
        token,
        url,
      })
      timestamp = res.timestamp || 0
      bar.tick({
        prog: '✅',
      })
      if (!(res.status === 'unknown')) {
        branchKnown = true
      }
      if (res.hasUpstream) {
        hasUpstream = true
      }
    } catch (e) {
      summary({
        heading: 'Error when checking client information',
        items: [
          {
            emoji: '❌',
            heading: 'You provided',
            subItems: [
              {
                key: 'clientId',
                value: config.clientId,
              },
              {
                key: 'branch',
                value: config.branch,
              },
              {
                key: 'token',
                value: config.token,
              },
            ],
          },
        ],
      })
      throw e
    }

    const branchBar = new Progress('Checking branch is on Tina Cloud. :prog', 1)

    // We know the branch is known (could be status: 'failed', 'inprogress' or 'success')
    if (branchKnown) {
      branchBar.tick({
        prog: '✅',
      })
      return {
        hasUpstream,
        timestamp,
      }
    }

    // We know the branch is status: 'unknown'

    // Check for a max of 6 times
    for (let i = 0; i <= 5; i++) {
      await sleepAndCallFunc({
        fn: async () => {
          const res = await request({
            token,
            url,
          })
          if (this.verbose) {
            logger.info(
              `Branch status: ${res.status}. Attempt: ${
                i + 1
              }. Trying again in 5 seconds.`
            )
          }
          if (!(res.status === 'unknown')) {
            branchBar.tick({
              prog: '✅',
            })
            return
          }
        },
        ms: 5000,
      })
    }

    branchBar.tick({
      prog: '❌',
    })

    // I wanted to use the summary function here but I was getting the following error:
    // RangeError: Invalid count value
    // at String.repeat (<anonymous>)
    // summary({
    //   heading: `ERROR: Branch '${branch}' is not on Tina Cloud. Please make sure that branch '${branch}' exists in your repository and that you have pushed your all changes to the remote. View all all branches and there current status here: https://app.tina.io/projects/${clientId}/configuration`,
    //   items: [
    //     {
    //       emoji: '❌',
    //       heading: 'You provided',
    //       subItems: [
    //         {
    //           key: 'branch',
    //           value: config.branch,
    //         },
    //       ],
    //     },
    //   ],
    // })
    logger.error(
      `${dangerText(
        `ERROR: Branch '${branch}' is not on Tina Cloud.`
      )} Please make sure that branch '${branch}' exists in your repository and that you have pushed your all changes to the remote. View all all branches and there current status here: ${linkText(
        `https://app.tina.io/projects/${clientId}/configuration`
      )}`
    )
    throw new Error('Branch is not on Tina Cloud')
  }

  async syncProject(
    configManager: ConfigManager,
    apiURL: string,
    options?: {
      upstreamBranch?: string
      previewBaseBranch?: string
      previewName?: string
    }
  ): Promise<void> {
    const { config } = configManager
    const token = config.token
    const { clientId, branch, host } = parseURL(apiURL)
    const { previewName, previewBaseBranch, upstreamBranch } = options || {}

    let url = `https://${host}/db/${clientId}/reset/${branch}?refreshSchema=true&skipIfSchemaCurrent=true`
    if (upstreamBranch && previewBaseBranch && previewName) {
      url = `https://${host}/db/${clientId}/reset/${previewBaseBranch}?refreshSchema=true&skipIfSchemaCurrent=true&upstreamBranch=${upstreamBranch}&previewName=${previewName}`
    } else if (!upstreamBranch && previewBaseBranch && previewName) {
      url = `https://${host}/db/${clientId}/reset/${previewBaseBranch}?refreshSchema=true&skipIfSchemaCurrent=true&previewName=${branch}`
    } else if (upstreamBranch && !previewBaseBranch && !previewName) {
      url = `https://${host}/db/${clientId}/reset/${branch}?refreshSchema=true&skipIfSchemaCurrent=true&upstreamBranch=${upstreamBranch}`
    }
    const bar = new Progress('Syncing Project. :prog', 1)

    try {
      const res = await request({
        token,
        url,
        method: 'POST',
      })
      bar.tick({
        prog: '✅',
      })
      if (res.status === 'success') {
        return
      }
    } catch (e) {
      summary({
        heading: `Error when requesting project sync`,
        items: [
          {
            emoji: '❌',
            heading: 'You provided',
            subItems: [
              {
                key: 'clientId',
                value: config.clientId,
              },
              {
                key: 'branch',
                value: config.branch,
              },
              {
                key: 'token',
                value: config.token,
              },
            ],
          },
        ],
      })
      throw e
    }
  }

  async checkGraphqlSchema(
    configManager: ConfigManager,
    database: Database,
    apiURL: string,
    timestamp: number
  ) {
    const bar = new Progress(
      'Checking local GraphQL Schema matches server. :prog',
      1
    )
    const { config } = configManager
    const token = config.token

    // Get the remote schema from the graphql endpoint
    const { remoteSchema, remoteVersion } = await fetchRemoteGraphqlSchema({
      url: apiURL,
      token,
    })

    if (!remoteSchema) {
      bar.tick({
        prog: '❌',
      })
      let errorMessage = `The remote GraphQL schema does not exist. Check indexing for this branch.`
      if (config?.branch) {
        errorMessage += `\n\nAdditional info: Branch: ${config.branch}, Client ID: ${config.clientId} `
      }
      throw new Error(errorMessage)
    }

    const remoteGqlSchema = buildClientSchema(remoteSchema)

    // This will always be the filesystem bridge.
    const localSchemaDocument = await database.getGraphQLSchemaFromBridge()
    const localGraphqlSchema = buildASTSchema(localSchemaDocument)
    try {
      const diffResult = await diff(localGraphqlSchema, remoteGqlSchema)

      if (diffResult.length === 0) {
        bar.tick({
          prog: '✅',
        })
      } else {
        bar.tick({
          prog: '❌',
        })
        let errorMessage = `The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema.`
        errorMessage += `\n\nAdditional info:\n\n`
        if (config?.branch) {
          errorMessage += `        Branch: ${config.branch}, Client ID: ${config.clientId}\n`
        }
        errorMessage += `        Local GraphQL version: ${configManager.getTinaGraphQLVersion()} / Remote GraphQL version: ${remoteVersion}\n`
        errorMessage += `        Last indexed at: ${new Date(
          timestamp
        ).toUTCString()}\n`
        throw new Error(errorMessage)
      }
    } catch (e) {
      // In some cases, a GraphQL version mismatch prevents us from being able to do this check.
      // Note that a check will still be run from the Tina admin since it's deduped in the Vite build
      // Unfortunately there's no specific error class to compare with, so a string check here should still
      // allow other errors to throw properly
      if (e.message.startsWith('Cannot use')) {
        logger.warn(
          `${warnText(
            'Skipping schema check due to conflicting GraphQL versions'
          )}`
        )
      } else {
        throw e
      }
    }
  }

  async checkTinaSchema(
    configManager: ConfigManager,
    database: Database,
    apiURL: string,
    previewName: string,
    verbose: boolean,
    timestamp: number
  ) {
    const bar = new Progress(
      'Checking local Tina Schema matches server. :prog',
      1
    )
    const { config } = configManager
    const token = config.token
    const { clientId, branch, isLocalClient, host } = parseURL(apiURL)
    // Can't check status if we're not using Tina Cloud
    if (isLocalClient || !host || !clientId || !branch) {
      if (verbose) {
        logger.info(logText('Not using Tina Cloud, skipping Tina Schema check'))
      }
      return
    }

    // Get the remote schema from the graphql endpoint
    const { tinaSchema: remoteTinaSchemaSha } = await fetchSchemaSha({
      url: `https://${host}/db/${clientId}/${previewName || branch}/schemaSha`,
      token,
    })

    if (!remoteTinaSchemaSha) {
      bar.tick({
        prog: '❌',
      })
      let errorMessage = `The remote Tina schema does not exist. Check indexing for this branch.`
      if (config?.branch) {
        errorMessage += `\n\nAdditional info: Branch: ${config.branch}, Client ID: ${config.clientId} `
      }
      throw new Error(errorMessage)
    }

    if (!database.bridge) {
      throw new Error(`No bridge configured`)
    }
    const localTinaSchema = JSON.parse(
      await database.bridge.get(
        path.join(database.tinaDirectory, '__generated__', '_schema.json')
      )
    )
    localTinaSchema.version = undefined
    const localTinaSchemaSha = crypto
      .createHash('sha256')
      .update(JSON.stringify(localTinaSchema))
      .digest('hex')

    if (localTinaSchemaSha === remoteTinaSchemaSha) {
      bar.tick({
        prog: '✅',
      })
    } else {
      bar.tick({
        prog: '❌',
      })
      let errorMessage = `The local Tina schema doesn't match the remote Tina schema. Please push up your changes to GitHub to update your remote tina schema.`
      errorMessage += `\n\nAdditional info:\n\n`
      if (config?.branch) {
        errorMessage += `        Branch: ${config.branch}, Client ID: ${config.clientId}\n`
      }
      errorMessage += `        Last indexed at: ${new Date(
        timestamp
      ).toUTCString()}\n`
      throw new Error(errorMessage)
    }
  }
}

//  This was taken from packages/tinacms/src/unifiedClient/index.ts
// TODO: maybe move this to a shared util package?
async function request(args: {
  url: string
  token: string
  method?: string
}): Promise<{ status: string; timestamp: number; hasUpstream: boolean }> {
  const headers = new Headers()
  if (args.token) {
    headers.append('X-API-KEY', args.token)
  }
  headers.append('Content-Type', 'application/json')

  const url = args?.url

  const res = await fetch(url, {
    method: args.method || 'GET',
    headers,
    redirect: 'follow',
  })
  const json = await res.json()
  if (!res.ok) {
    let additionalInfo = ''
    if (res.status === 401 || res.status === 403) {
      additionalInfo =
        'Please check that your client ID, URL and read only token are configured properly.'
    }
    if (json) {
      additionalInfo += `\n\nMessage from server: ${json.message}`
    }
    throw new Error(
      `Server responded with status code ${res.status}, ${res.statusText}. ${
        additionalInfo ? additionalInfo : ''
      } Please see our FAQ for more information: https://tina.io/docs/errors/faq/`
    )
  }
  if (json.errors) {
    throw new Error(
      `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/

      Errors: \n\t${json.errors.map((error) => error.message).join('\n')}`
    )
  }
  return {
    status: json?.status,
    timestamp: json?.timestamp,
    hasUpstream: json?.hasUpstream || false,
  } as {
    status: IndexStatusResponse['status']
    timestamp: number
    hasUpstream: boolean
  }
}

export const fetchRemoteGraphqlSchema = async ({
  url,
  token,
}: {
  url: string
  token?: string
}) => {
  const headers = new Headers()
  if (token) {
    headers.append('X-API-KEY', token)
  }
  const body = JSON.stringify({
    query: getIntrospectionQuery(),
    variables: {},
  })

  headers.append('Content-Type', 'application/json')

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })
  const data = await res.json()
  return {
    remoteSchema: data?.data,
    remoteVersion: res.headers.get('tinacms-grapqhl-version'),
  }
}

export const fetchSchemaSha = async ({
  url,
  token,
}: {
  url: string
  token?: string
}) => {
  const headers = new Headers()
  if (token) {
    headers.append('X-API-KEY', token)
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-cache',
  })
  return res.json()
}
