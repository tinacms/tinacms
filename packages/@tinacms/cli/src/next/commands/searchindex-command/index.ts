import { Command, Option } from 'clipanion'
import { logger } from '../../../logger'
import { ConfigManager } from '../../config-manager'
import { createSchema, FilesystemBridge } from '@tinacms/graphql'
import {
  SearchClient,
  SearchIndexer,
  TinaCMSSearchIndexClient,
} from '@tinacms/search'
import { spin } from '../../../utils/spinner'
import { dangerText } from '../../../utils/theme'

export class SearchIndexCommand extends Command {
  static paths = [['search-index']]
  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to run the CLI from (defaults to current working directory)',
  })
  verbose = Option.Boolean('-v,--verbose', false, {
    description: 'increase verbosity of logged output',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Index the site for search`,
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms search-index')
    console.error(error)
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    const rootPath = this.rootPath || process.cwd()
    const configManager = new ConfigManager({ rootPath })
    try {
      await configManager.processConfig()
    } catch (e) {
      logger.error(e.message)
      if (this.verbose) {
        console.error(e)
      }
    }
    if (!configManager.config?.search) {
      logger.error('No search config found')
      process.exit(1)
    }
    const { schema } = configManager.config
    const tinaSchema = await createSchema({
      schema: { ...schema, config: configManager.config },
    })

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
      textIndexLength:
        configManager.config.search?.maxSearchIndexFieldLength || 100,
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
    process.exit(0)
  }
}
