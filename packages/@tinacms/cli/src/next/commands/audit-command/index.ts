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
import { logger, summary } from '../../../logger'
import { createDBServer } from './server'
import { audit } from './audit'
import { Codegen } from '../../codegen'
import chalk from 'chalk'
import { startSubprocess2 } from '../../../cmds/startSubprocess'

export class AuditCommand extends Command {
  static paths = [['audit']]
  rootPath = Option.String('--rootPath', {
    description: 'Specify the root directory to run the CLI from',
  })
  verbose = Option.Boolean('-v, --verbose', false, {
    description: 'increase verbosity of logged output',
  })
  clean = Option.Boolean('--clean', false, {
    description: 'Clean the output',
  })
  useDefaultValues = Option.Boolean('--clean', false, {
    description: 'When cleaning the output, use defaults on the config',
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
    const configManager = new ConfigManager(this.rootPath)
    logger.info('Starting Tina Audit')

    try {
      await configManager.processConfig()
    } catch (e) {
      logger.error(e.message)
      // logger.error(
      //   'Unable to start dev server, please fix your Tina config and try again'
      // )
      process.exit(1)
    }

    const database = await this.createAndInitializeDatabase(configManager)
    const { tinaSchema, graphQLSchema } = await buildSchema(
      database,
      configManager.config
    )

    await database.indexContent({ tinaSchema, graphQLSchema })

    await audit({
      database,
      clean: this.clean,
      noTelemetry: this.noTelemetry,
      useDefaultValues: this.useDefaultValues,
      verbose: this.verbose,
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
