import { Command, Option } from 'clipanion'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import { MemoryLevel } from 'memory-level'
import {
  createDatabase,
  FilesystemBridge,
  buildSchema,
  getASTSchema,
  resolve,
} from '@tinacms/graphql'
import { ConfigManager } from '../config-manager'
import { devHTML } from './html'
import { logger, summary } from '../../logger'
import { createDevServer } from './server'
import { Codegen } from '../codegen'
import chalk from 'chalk'
import { startSubprocess2 } from '../../cmds/startSubprocess'

export class DevCommand extends Command {
  static paths = [['dev'], ['server:start']]
  port = Option.String(`-p, --port`, '4001', {
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
  dev = Option.Boolean('--dev', false, {
    description: 'Uses NODE_ENV=development when compiling client and schema',
  })
  local = Option.Boolean('--local', {
    description: 'Use the local file system graphql server',
  })

  static usage = Command.Usage({
    category: `Commands`,
    description: `Start dev server`,
  })

  async execute(): Promise<number | void> {
    const configManager = new ConfigManager(this.rootPath)
    logger.info('Starting Tina Dev Server')

    // setup() Re-runs on config changes
    const setup = async () => {
      try {
        await configManager.processConfig()
      } catch (e) {
        logger.error(e.message)
        console.trace()
        logger.error(
          'Unable to start dev server, please fix your Tina config and try again'
        )
        process.exit(1)
      }

      const database = createDatabase({
        bridge: new FilesystemBridge(configManager.rootPath),
        level: new MemoryLevel({ valueEncoding: 'json' }),
      })

      const res = await buildSchema(database, configManager.config)
      await database.indexContent({
        graphQLSchema: res.graphQLSchema,
        tinaSchema: res.tinaSchema,
      })

      const astSchema = await getASTSchema(database)

      const codegen = new Codegen({
        configManager: configManager,
        noSDK: this.noSDK,
        local: true,
        port: Number(this.port),
        schema: astSchema,
      })

      const { codeString, schemaString } = await codegen.genTypes()
      const { apiURL, clientString } = await codegen.genClient()

      await fs.outputFile(configManager.generatedGraphQLGQLPath, schemaString)
      await fs.outputFile(configManager.generatedTypesTSFilePath, codeString)
      await fs.outputFile(configManager.generatedClientFilePath, clientString)
      await fs.outputFile(configManager.outputHTMLFilePath, devHTML)
      return { database, apiURL }
    }
    const { database, apiURL } = await setup()

    const server = await createDevServer(configManager, database, apiURL)
    await server.listen(Number(this.port))

    const collectionContentFiles = []
    configManager.config.schema.collections.forEach((collection) => {
      const collectionGlob = `${path.join(
        configManager.rootPath,
        collection.path
      )}/**/*.${collection.format || 'md'}`
      collectionContentFiles.push(collectionGlob)
    })
    chokidar.watch(collectionContentFiles).on('change', async (changedFile) => {
      // TODO: update this content, probably sharing code from audit
      logger.info(
        `Detected change at ${chalk.cyan(
          configManager.printRelativePath(changedFile)
        )}`
      )
    })
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
    summary({
      heading: 'Tina Dev Server is running...',
      items: [
        {
          emoji: '🦙',
          heading: 'Tina Config',
          subItems: [
            {
              key: 'API url',
              value: apiURL,
            },
            {
              key: 'API playground',
              value: `http://localhost:${this.port}/altair`,
            },
          ],
        },
        {
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
        },
        {
          emoji: '📚',
          heading: 'Useful links',
          subItems: [
            {
              key: 'Custom queries',
              value: 'https://tina.io/querying',
            },
            {
              key: 'Visual editing',
              value: 'https://tina.io/visual-editing',
            },
          ],
        },
      ],
    })
    logger.info(`Starting subprocess: ${chalk.cyan(this.subCommand)}`)
    await startSubprocess2({ command: this.subCommand })
  }
}
