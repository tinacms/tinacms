import { Command, Option } from 'clipanion'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import { buildSchema, Database, FilesystemBridge } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { devHTML } from './html'
import { logger, summary } from '../../../logger'
import { dangerText, warnText } from '../../../utils/theme'
import { createDevServer } from './server'
import { Codegen } from '../../codegen'
import { createAndInitializeDatabase, createDBServer } from '../../database'
import { BaseCommand } from '../baseCommands'
import { spin } from '../../../utils/spinner'
import { SearchIndexer, LocalSearchIndexClient } from '@tinacms/search'

export class DevCommand extends BaseCommand {
  static paths = [['dev'], ['server:start']]
  // NOTE: camelCase commands for string options don't work if there's an `=` used https://github.com/arcanis/clipanion/issues/141
  watchFolders = Option.String('-w,--watchFolders', {
    description:
      'DEPRECATED - a list of folders (relative to where this is being run) that the cli will watch for changes',
  })
  noWatch = Option.Boolean('--noWatch', false, {
    description: "Don't regenerate config on file changes",
  })
  outputSearchIndexPath = Option.String('--outputSearchIndexPath', {
    description: 'Path to write the search index to',
  })

  static usage = Command.Usage({
    category: `Commands`,
    description: `Builds Tina and starts the dev server`,
    examples: [
      [`A basic example`, `$0 dev`],
      [`A second example`, `$0 dev --rootPath`],
    ],
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms dev')
    console.error(error)
    process.exit(1)
  }

  logDeprecationWarnings() {
    super.logDeprecationWarnings()
    if (this.watchFolders) {
      logger.warn(
        '--watchFolders has been deprecated, imports from your Tina config file will be watched automatically. If you still need it please open a ticket at https://github.com/tinacms/tinacms/issues'
      )
    }
  }

  async execute(): Promise<number | void> {
    const configManager = new ConfigManager({
      rootPath: this.rootPath,
      legacyNoSDK: this.noSDK,
    })
    logger.info('Starting Tina Dev Server')
    this.logDeprecationWarnings()

    // Initialize the host TCP server
    createDBServer(Number(this.datalayerPort))

    let database: Database = null

    const setup = async ({ firstTime }: { firstTime: boolean }) => {
      try {
        await configManager.processConfig()
        if (firstTime) {
          database = await createAndInitializeDatabase(
            configManager,
            Number(this.datalayerPort)
          )
        } else {
          database.clearCache()
        }

        const { tinaSchema, graphQLSchema, lookup, queryDoc, fragDoc } =
          await buildSchema(configManager.config)

        const codegen = new Codegen({
          isLocal: true,
          configManager: configManager,
          port: Number(this.port),
          queryDoc,
          fragDoc,
          graphqlSchemaDoc: graphQLSchema,
          tinaSchema,
          lookup,
        })
        const apiURL = await codegen.execute()

        if (!configManager.isUsingLegacyFolder) {
          delete require.cache[configManager.generatedSchemaJSONPath]
          delete require.cache[configManager.generatedLookupJSONPath]
          delete require.cache[configManager.generatedGraphQLJSONPath]

          const schemaObject = require(configManager.generatedSchemaJSONPath)
          const lookupObject = require(configManager.generatedLookupJSONPath)
          const graphqlSchemaObject = require(configManager.generatedGraphQLJSONPath)

          const tinaLockFilename = 'tina-lock.json'
          const tinaLockContent = JSON.stringify({
            schema: schemaObject,
            lookup: lookupObject,
            graphql: graphqlSchemaObject,
          })
          fs.writeFileSync(
            path.join(configManager.tinaFolderPath, tinaLockFilename),
            tinaLockContent
          )

          if (configManager.hasSeparateContentRoot()) {
            const rootPath = await configManager.getTinaFolderPath(
              configManager.contentRootPath
            )
            const filePath = path.join(rootPath, tinaLockFilename)
            await fs.ensureFile(filePath)
            await fs.outputFile(filePath, tinaLockContent)
          }
        }

        if (!this.noWatch) {
          this.watchQueries(configManager, async () => await codegen.execute())
        }

        await this.indexContentWithSpinner({
          database,
          graphQLSchema,
          tinaSchema,
          configManager,
        })
        if (!firstTime) {
          logger.error('Re-index complete')
        }
        return { apiURL, database, graphQLSchema, tinaSchema }
      } catch (e) {
        logger.error(`\n\n${dangerText(e.message)}\n`)
        if (this.verbose) {
          console.error(e)
        }
        if (firstTime) {
          logger.error(
            warnText(
              'Unable to start dev server, please fix your Tina config / resolve any errors above and try again'
            )
          )
          process.exit(1)
        } else {
          logger.error(warnText('Dev server has not been restarted'))
        }
      }
    }
    const { apiURL, graphQLSchema, tinaSchema } = await setup({
      firstTime: true,
    })

    await fs.outputFile(configManager.outputHTMLFilePath, devHTML(this.port))
    // Add the gitignore so the index.html and assets are committed to git
    await fs.outputFile(
      configManager.outputGitignorePath,
      'index.html\nassets/'
    )
    const searchIndexClient = new LocalSearchIndexClient({
      stopwordLanguages: configManager.config.search?.tina?.stopwordLanguages,
      tokenSplitRegex: configManager.config.search?.tina?.tokenSplitRegex,
    })
    await searchIndexClient.onStartIndexing()

    const server = await createDevServer(
      configManager,
      database,
      searchIndexClient.searchIndex,
      apiURL,
      this.noWatch
    )
    await server.listen(Number(this.port))
    const searchIndexer = new SearchIndexer({
      batchSize: configManager.config.search?.indexBatchSize || 100,
      bridge: new FilesystemBridge(
        configManager.rootPath,
        configManager.contentRootPath
      ),
      schema: tinaSchema,
      client: searchIndexClient,
      textIndexLength:
        configManager.config.search?.maxSearchIndexFieldLength || 100,
    })

    if (configManager.config.search) {
      await spin({
        waitFor: async () => {
          await searchIndexer.indexAllContent()
        },
        text: 'Building search index',
      })

      if (this.outputSearchIndexPath) {
        await searchIndexClient.export(this.outputSearchIndexPath)
      }
    }

    if (!this.noWatch) {
      this.watchContentFiles(
        configManager,
        database,
        configManager.config.search && searchIndexer
      )
      chokidar.watch(configManager.watchList).on('change', async () => {
        logger.info(`Tina config change detected, rebuilding`)
        await setup({ firstTime: false })
        // The setup process results in an update to the prebuild file
        // But Vite doesn't reload when it's changed for some reason
        // So we're triggering the reload ourselves
        server.ws.send({ type: 'full-reload', path: '*' })
      })
    }

    const subItems = []

    if (configManager.hasSeparateContentRoot()) {
      subItems.push({
        key: 'Content repo',
        value: configManager.contentRootPath,
      })
    }

    const summaryItems = [
      {
        emoji: '🦙',
        heading: 'Tina Config',
        subItems: [
          {
            key: 'CMS',
            value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}`,
          },
          {
            key: 'API playground',
            value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}#/graphql`,
          },
          {
            key: 'API url',
            value: apiURL,
          },
          ...subItems,
        ],
      },
    ]

    if (!configManager.shouldSkipSDK()) {
      summaryItems.push({
        emoji: '🤖',
        heading: 'Auto-generated files',
        subItems: [
          {
            key: 'GraphQL Client',
            value: configManager.printGeneratedClientFilePath(),
          },
          {
            key: 'Typescript Types',
            value: configManager.printGeneratedTypesFilePath(),
          },
        ],
      })
    }

    summary({
      heading: 'Tina Dev Server is running...',
      items: [
        ...summaryItems,
        // {
        //   emoji: '📚',
        //   heading: 'Useful links',
        //   subItems: [
        //     {
        //       key: 'Custom queries',
        //       value: 'https://tina.io/querying',
        //     },
        //     {
        //       key: 'Visual editing',
        //       value: 'https://tina.io/visual-editing',
        //     },
        //   ],
        // },
      ],
    })
    await this.startSubCommand()
  }

  watchContentFiles(
    configManager: ConfigManager,
    database: Database,
    searchIndexer?: SearchIndexer
  ) {
    const collectionContentFiles = []
    configManager.config.schema.collections.forEach((collection) => {
      const collectionGlob = `${path.join(
        configManager.contentRootPath,
        collection.path
      )}/**/*.${collection.format || 'md'}`
      collectionContentFiles.push(collectionGlob)
    })
    let ready = false
    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and Tina Cloud does the same thing when it receives
     * a push from GitHub.
     */
    chokidar
      .watch(collectionContentFiles)
      .on('ready', () => {
        ready = true
      })
      .on('add', async (addedFile) => {
        if (!ready) {
          return
        }
        const pathFromRoot = configManager.printContentRelativePath(addedFile)
        await database.indexContentByPaths([pathFromRoot]).catch(console.error)
        if (searchIndexer) {
          await searchIndexer
            .indexContentByPaths([pathFromRoot])
            .catch(console.error)
        }
      })
      .on('change', async (changedFile) => {
        const pathFromRoot = configManager.printContentRelativePath(changedFile)
        // Optionally we can reload the page when this happens
        // server.ws.send({ type: 'full-reload', path: '*' })
        await database.indexContentByPaths([pathFromRoot]).catch(console.error)
        if (searchIndexer) {
          await searchIndexer
            .indexContentByPaths([pathFromRoot])
            .catch(console.error)
        }
      })
      .on('unlink', async (removedFile) => {
        const pathFromRoot = configManager.printContentRelativePath(removedFile)
        await database.deleteContentByPaths([pathFromRoot]).catch(console.error)
        if (searchIndexer) {
          await searchIndexer
            .deleteIndexContent([pathFromRoot])
            .catch(console.error)
        }
      })
  }
  watchQueries(configManager: ConfigManager, callback: () => Promise<string>) {
    let ready = false
    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and Tina Cloud does the same thing when it receives
     * a push from GitHub.
     */
    chokidar
      .watch(configManager.userQueriesAndFragmentsGlob)
      .on('ready', () => {
        ready = true
      })
      .on('add', async (addedFile) => {
        await callback()
      })
      .on('change', async (changedFile) => {
        await callback()
      })
      .on('unlink', async (removedFile) => {
        await callback()
      })
  }
}
