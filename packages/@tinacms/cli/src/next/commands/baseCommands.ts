import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import type { ChildProcess } from 'child_process'
import type { DocumentNode } from 'graphql'
import { startSubprocess2 } from '../../utils/start-subprocess'
import { logger } from '../../logger'
import { spin } from '../../utils/spinner'
import { Database } from '../../../../graphql/src'
import { TinaSchema } from '../../../../schema-tools/src'
import { warnText } from '../../utils/theme'

/**
 * Base Command for Dev and build
 */
export abstract class BaseCommand extends Command {
  experimentalDataLayer = Option.Boolean('--experimentalData', {
    description:
      'DEPRECATED - Build the server with additional data querying capabilities',
  })
  isomorphicGitBridge = Option.Boolean('--isomorphicGitBridge', {
    description: 'DEPRECATED - Enable Isomorphic Git Bridge Implementation',
  })
  port = Option.String('-p,--port', '4001', {
    description: 'Specify a port to run the server on. (default 4001)',
  })
  datalayerPort = Option.String('--datalayer-port', '9000', {
    description:
      'Specify a port to run the datalayer server on. (default 9000)',
  })
  subCommand = Option.String('-c,--command', {
    description: 'The sub-command to run',
  })
  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to run the CLI from (defaults to current working directory)',
  })
  verbose = Option.Boolean('-v,--verbose', false, {
    description: 'increase verbosity of logged output',
  })
  noSDK = Option.Boolean('--noSDK', false, {
    description:
      "DEPRECATED - This should now be set in the config at client.skip = true'. Don't generate the generated client SDK",
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })

  abstract execute(): Promise<number | void>

  async startSubCommand() {
    let subProc: ChildProcess | undefined
    if (this.subCommand) {
      subProc = await startSubprocess2({ command: this.subCommand })
      logger.info(`Starting subprocess: ${chalk.cyan(this.subCommand)}`)
    }
    function exitHandler(options, exitCode) {
      if (subProc) {
        subProc.kill()
      }
      process.exit()
    }
    //do something when app is closing
    process.on('exit', exitHandler)
    //catches ctrl+c event
    process.on('SIGINT', exitHandler)
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler)
    process.on('SIGUSR2', exitHandler)
    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler)
  }

  logDeprecationWarnings() {
    if (this.isomorphicGitBridge) {
      logger.warn('--isomorphicGitBridge has been deprecated')
    }
    if (this.experimentalDataLayer) {
      logger.warn(
        '--experimentalDataLayer has been deprecated, the data layer is now built-in automatically'
      )
    }
    if (this.noSDK) {
      logger.warn(
        '--noSDK has been deprecated, and will be unsupported in a future release. This should be set in the config at client.skip = true'
      )
    }
  }
  async indexContentWithSpinner({
    database,
    graphQLSchema,
    tinaSchema,
  }: {
    database: Database
    graphQLSchema: DocumentNode
    tinaSchema: TinaSchema
  }) {
    const warnings: string[] = []
    await spin({
      waitFor: async () => {
        const res = await database.indexContent({
          graphQLSchema,
          tinaSchema,
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
  }
}
