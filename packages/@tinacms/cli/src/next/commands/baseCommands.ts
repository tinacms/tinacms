import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import type { ChildProcess } from 'child_process'
import type { DocumentNode } from 'graphql'

import type { Database } from '@tinacms/graphql'
import type { TinaSchema } from '@tinacms/schema-tools'

import { startSubprocess2 } from '../../utils/start-subprocess'
import { logger } from '../../logger'
import { spin } from '../../utils/spinner'
import { warnText } from '../../utils/theme'
import { getChangedFiles, getSha, shaExists } from '@tinacms/graphql'
import fs from 'fs-extra'
import { ConfigManager } from '../config-manager'

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
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught exception ${error.name}`)
      console.error(error)
    })
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
    configManager,
    partialReindex,
    text,
  }: {
    database: Database
    graphQLSchema: DocumentNode
    tinaSchema: TinaSchema
    configManager: ConfigManager
    partialReindex?: boolean
    text?: string
  }) {
    const textToUse = text || 'Indexing local files'
    const warnings: string[] = []
    await spin({
      waitFor: async () => {
        const rootPath = configManager.rootPath
        let sha
        try {
          sha = await getSha({ fs, dir: rootPath })
        } catch (e) {
          if (partialReindex) {
            console.error(
              'Failed to get sha. NOTE: `--partial-reindex` only supported for git repositories'
            )
            throw e
          }
        }
        const lastSha = await database.getMetadata('lastSha')
        const exists =
          lastSha && (await shaExists({ fs, dir: rootPath, sha: lastSha }))
        let res
        if (partialReindex && lastSha && exists && sha) {
          const pathFilter: Record<string, { matches?: string[] }> = {}
          if (configManager.isUsingLegacyFolder) {
            pathFilter['.tina/__generated__/_schema.json'] = {}
          } else {
            pathFilter['tina/tina-lock.json'] = {}
          }
          for (const collection of tinaSchema.getCollections()) {
            pathFilter[collection.path] = {
              matches:
                collection.match?.exclude || collection.match?.include
                  ? tinaSchema.getMatches({ collection })
                  : undefined,
            }
          }

          const { added, modified, deleted } = await getChangedFiles({
            fs,
            dir: rootPath,
            from: lastSha,
            to: sha,
            pathFilter,
          })
          const tinaPathUpdates = modified.filter(
            (path) =>
              path.startsWith('.tina/__generated__/_schema.json') ||
              path.startsWith('tina/tina-lock.json')
          )
          if (tinaPathUpdates.length > 0) {
            res = await database.indexContent({
              graphQLSchema,
              tinaSchema,
            })
          } else {
            if (added.length > 0 || modified.length > 0) {
              await database.indexContentByPaths([...added, ...modified])
            }
            if (deleted.length > 0) {
              await database.deleteContentByPaths(deleted)
            }
          }
        } else {
          res = await database.indexContent({
            graphQLSchema,
            tinaSchema,
          })
        }
        if (sha) {
          await database.setMetadata('lastSha', sha)
        }
        if (res?.warnings) {
          warnings.push(...res.warnings)
        }
      },
      text: textToUse,
    })
    if (warnings.length > 0) {
      logger.warn(`Indexing completed with ${warnings.length} warning(s)`)
      warnings.forEach((warning) => {
        logger.warn(warnText(`${warning}`))
      })
    }
  }
}
