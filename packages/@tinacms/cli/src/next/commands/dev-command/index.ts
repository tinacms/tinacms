import { Command, Option } from 'clipanion'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import { buildSchema, Database } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { devHTML } from './html'
import { logger, summary } from '../../../logger'
import { createDevServer } from './server'
import { Codegen } from '../../codegen'
import { createAndInitializeDatabase, createDBServer } from '../../database'
import { BaseCommand } from '../baseCommands'

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
      } catch (e) {
        logger.error(e.message)
        if (this.verbose) {
          console.error(e)
        }
        if (firstTime) {
          logger.error(
            'Unable to start dev server, please fix your Tina config and try again'
          )
          process.exit(1)
        }
      }
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
        await fs.writeFileSync(
          path.join(configManager.tinaFolderPath, 'tina-lock.json'),
          JSON.stringify({
            schema: schemaObject,
            lookup: lookupObject,
            graphql: graphqlSchemaObject,
          })
        )
      }

      if (!this.noWatch) {
        this.watchQueries(configManager, async () => await codegen.execute())
      }

      await this.indexContentWithSpinner({
        database,
        graphQLSchema,
        tinaSchema,
      })
      return { apiURL, database }
    }
    const { apiURL } = await setup({ firstTime: true })

    await fs.outputFile(configManager.outputHTMLFilePath, devHTML(this.port))
    // Add the gitignore so the index.html and assets are committed to git
    await fs.outputFile(
      configManager.outputGitignorePath,
      'index.html\nassets/'
    )
    const server = await createDevServer(
      configManager,
      database,
      apiURL,
      this.noWatch
    )
    await server.listen(Number(this.port))

    if (!this.noWatch) {
      this.watchContentFiles(configManager, database)
    }

    server.watcher.on('change', async (changedPath) => {
      if (changedPath.includes('__generated__')) {
        return
      }
      if (changedPath.includes('@tinacms/')) {
        return
      }
      if (changedPath.includes('tinacms/dist')) {
        return
      }
      try {
        // await server.reloadModule
        logger.info('Tina config updated')
        await setup({ firstTime: false })
        // await server.restart()
      } catch (e) {
        logger.error(e.message)
      }
    })

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

  watchContentFiles(configManager: ConfigManager, database: Database) {
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
     * a push from Github.
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
        database.indexContentByPaths([pathFromRoot])
      })
      .on('change', async (changedFile) => {
        const pathFromRoot = configManager.printContentRelativePath(changedFile)
        // Optionally we can reload the page when this happens
        // server.ws.send({ type: 'full-reload', path: '*' })
        database.indexContentByPaths([pathFromRoot])
      })
      .on('unlink', async (removedFile) => {
        const pathFromRoot = configManager.printContentRelativePath(removedFile)
        database.deleteContentByPaths([pathFromRoot])
      })
  }
  watchQueries(configManager: ConfigManager, callback: () => Promise<string>) {
    let ready = false
    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and Tina Cloud does the same thing when it receives
     * a push from Github.
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
