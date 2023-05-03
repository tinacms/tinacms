import { Command, Option } from 'clipanion'
import { buildSchema } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { logger } from '../../../logger'
import { audit } from './audit'
import { createAndInitializeDatabase, createDBServer } from '../../database'
import { AuditFileSystemBridge } from '@tinacms/graphql'
import { spin } from '../../../utils/spinner'
import { warnText } from '../../../utils/theme'

export class AuditCommand extends Command {
  static paths = [['audit']]
  rootPath = Option.String('--rootPath', {
    description: 'Specify the root directory to run the CLI from',
  })
  verbose = Option.Boolean('-v,--verbose', false, {
    description: 'increase verbosity of logged output',
  })
  clean = Option.Boolean('--clean', false, {
    description: 'Clean the output',
  })
  useDefaultValues = Option.Boolean('--useDefaultValues', false, {
    description: 'When cleaning the output, use defaults on the config',
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  datalayerPort = Option.String('--datalayer-port', '9000', {
    description:
      'Specify a port to run the datalayer server on. (default 9000)',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Audit config and content files`,
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms audit')
    if (this.verbose) {
      console.error(error)
    }
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    const configManager = new ConfigManager({ rootPath: this.rootPath })
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

    // Initialize the host TCP server
    createDBServer(Number(this.datalayerPort))
    const database = await createAndInitializeDatabase(
      configManager,
      Number(this.datalayerPort),
      this.clean ? undefined : new AuditFileSystemBridge(configManager.rootPath)
    )
    const { tinaSchema, graphQLSchema, lookup } = await buildSchema(
      configManager.config
    )

    const warnings: string[] = []
    await spin({
      waitFor: async () => {
        const res = await database.indexContent({
          graphQLSchema,
          tinaSchema,
          lookup,
        })
        warnings.push(...res.warnings)
      },
      text: 'Indexing local files',
    })
    if (warnings.length > 0) {
      logger.warn(`Indexing completed with ${warnings.length} warning(s)`)
      warnings.forEach((warning) => {
        logger.warn(warnText(`${warning}`))
      })
    }

    await audit({
      database,
      clean: this.clean,
      noTelemetry: this.noTelemetry,
      useDefaultValues: this.useDefaultValues,
      verbose: this.verbose,
    })

    process.exit()
  }
}
