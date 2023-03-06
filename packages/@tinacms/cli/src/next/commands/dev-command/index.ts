import { Command, Option } from 'clipanion'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import {
  createDatabase,
  FilesystemBridge,
  buildSchema,
  getASTSchema,
  Database,
  TinaLevelClient,
} from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { devHTML } from './html'
import { logger, summary } from '../../../logger'
import { createDBServer, createDevServer } from './server'
import { Codegen } from '../../codegen'
import chalk from 'chalk'
import { startSubprocess2 } from '../../../utils/start-subprocess'
import { ViteDevServer } from 'vite'

export class DevCommand extends Command {
  static paths = [['dev'], ['server:start']]
  port = Option.String('-p, --port', '4001', {
    description: 'Specify a port to run the server on. (default 4001)',
  })
  subCommand = Option.String('-c, --command', {
    description: 'The sub-command to run',
  })
  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to run the CLI from (defaults to current working directory)',
  })
  watchFolders = Option.String('-w, --watchFolders', {
    description:
      'a list of folders (relative to where this is being run) that the cli will watch for changes',
  })
  verbose = Option.Boolean('-v, --verbose', false, {
    description: 'increase verbosity of logged output',
  })
  noWatch = Option.Boolean('--noWatch', false, {
    description: "Don't regenerate config on file changes",
  })
  noSDK = Option.Boolean('--noSDK', false, {
    description: "Don't generate the generated client SDK",
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })

  static usage = Command.Usage({
    category: `Commands`,
    description: `Builds Tina and starts the dev server`,
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms dev')
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    const configManager = new ConfigManager(this.rootPath)
    logger.info('Starting Tina Dev Server')

    // Initialize the host TCP server
    createDBServer()

    const setup = async () => {
      try {
        await configManager.processConfig()
      } catch (e) {
        logger.error(e.message)
        logger.error(
          'Unable to start dev server, please fix your Tina config and try again'
        )
        process.exit(1)
      }

      const database = await this.createAndInitializeDatabase(configManager)
      const { tinaSchema, graphQLSchema, queryDoc, fragDoc } =
        await buildSchema(database, configManager.config)
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

      const codegen = new Codegen({
        schema: await getASTSchema(database),
        configManager: configManager,
        port: Number(this.port),
        noSDK: this.noSDK,
        queryDoc,
        fragDoc,
      })
      const apiURL = await codegen.execute()

      await database.indexContent({ tinaSchema, graphQLSchema })
      return { apiURL, database }
    }
    const { apiURL, database } = await setup()

    await fs.outputFile(configManager.outputHTMLFilePath, devHTML(this.port))
    const server = await createDevServer(
      configManager,
      database,
      apiURL,
      this.noSDK
    )
    await server.listen(Number(this.port))

    this.watchContentFiles(configManager, database, server)

    server.watcher.on('change', async (changedPath) => {
      if (changedPath.includes('__generated__')) {
        return
      }
      try {
        await setup()
        logger.info('Tina config updated')
      } catch (e) {
        logger.error(e.message)
      }
    })

    const summaryItems = []
    if (!this.noSDK) {
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
        {
          emoji: '🦙',
          heading: 'Tina Config',
          subItems: [
            {
              key: 'CMS',
              value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}`,
            },
            {
              key: 'API url',
              value: apiURL,
            },
            {
              key: 'API playground',
              value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}#/graphql`,
            },
          ],
        },
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
    if (this.subCommand) {
      logger.info(`Starting subprocess: ${chalk.cyan(this.subCommand)}`)
      await startSubprocess2({ command: this.subCommand })
    }
  }

  async createAndInitializeDatabase(configManager: ConfigManager) {
    let database: Database
    const bridge = new FilesystemBridge(configManager.rootPath)
    if (
      configManager.hasSelfHostedConfig() &&
      configManager.config.contentApiUrlOverride
    ) {
      database = (await configManager.loadDatabaseFile()) as Database
      database.bridge = bridge
    } else {
      if (
        configManager.hasSelfHostedConfig() &&
        !configManager.config.contentApiUrlOverride
      ) {
        logger.warn(
          `Found a database config file at ${configManager.printRelativePath(
            configManager.selfHostedDatabaseFilePath
          )} but there was no "contentApiUrlOverride" set. Falling back to built-in datalayer`
        )
      }
      const level = new TinaLevelClient()
      level.openConnection()
      database = createDatabase({
        bridge,
        level,
        tinaDirectory: configManager.printRelativePath(
          configManager.tinaFolderPath
        ),
      })
    }

    return database
  }

  watchContentFiles(
    configManager: ConfigManager,
    database: Database,
    server: ViteDevServer
  ) {
    const collectionContentFiles = []
    configManager.config.schema.collections.forEach((collection) => {
      const collectionGlob = `${path.join(
        configManager.rootPath,
        collection.path
      )}/**/*.${collection.format || 'md'}`
      collectionContentFiles.push(collectionGlob)
    })
    let ready = false
    chokidar
      .watch(collectionContentFiles)
      .on('ready', () => {
        ready = true
      })
      .on('add', async (addedFile) => {
        if (!ready) {
          return
        }
        const pathFromRoot = configManager.printRelativePath(addedFile)
        logger.info(
          `Detected new file at ${chalk.cyan(
            pathFromRoot
          )}. Adding to datalayer.`
        )
        database.indexContentByPaths([pathFromRoot])
      })
      .on('change', async (changedFile) => {
        const pathFromRoot = configManager.printRelativePath(changedFile)
        // Optionally we can reload the page when this happens
        // server.ws.send({ type: 'full-reload', path: '*' })
        logger.info(
          `Detected change at ${chalk.cyan(
            pathFromRoot
          )}. Updating in datalayer.`
        )
        database.indexContentByPaths([pathFromRoot])
      })
      .on('unlink', async (removedFile) => {
        const pathFromRoot = configManager.printRelativePath(removedFile)
        logger.info(
          `Detected deletion at ${chalk.cyan(
            pathFromRoot
          )}. Deleting from datalayer.`
        )
        database.deleteContentByPaths([pathFromRoot])
      })
  }
}