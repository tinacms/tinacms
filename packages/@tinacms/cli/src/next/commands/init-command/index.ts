import { Command, Option } from 'clipanion'
import {
  createDatabase,
  FilesystemBridge,
  buildSchema,
  getASTSchema,
  Database,
  TinaLevelClient,
} from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { logger, summary } from '../../../logger'
import { initStaticTina } from '../../../cmds/init'

export class InitCommand extends Command {
  static paths = [['init']]
  rootPath = Option.String('--rootPath', {
    description: 'Specify the root directory to run the CLI from',
  })
  verbose = Option.Boolean('-v, --verbose', false, {
    description: 'increase verbosity of logged output',
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Audit config and content files`,
  })

  async catch(error: any): Promise<void> {
    console.error(error)
    logger.error('Error occured during tinacms audit')
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    await initStaticTina({
      rootPath: this.rootPath,
      noTelemetry: this.noTelemetry,
    })
    // summary({
    //   heading: 'Tina Dev Server is running...',
    //   items: [
    //     {
    //       emoji: '🦙',
    //       heading: 'Tina Config',
    //       subItems: [
    //         {
    //           key: 'API url',
    //           value: 'Good',
    //         },
    //       ],
    //     },
    //   ],
    // })
    process.exit()
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
      })
    }

    // Initialize the host TCP server
    createDBServer()

    return database
  }
}
