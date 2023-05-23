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
      batchSize: 100, // TODO make configurable
      bridge: new FilesystemBridge(
        configManager.rootPath,
        configManager.contentRootPath
      ),
      schema: tinaSchema,
      textIndexLength: 500,
      client,
    })
    await spin({
      waitFor: async () => {
        await searchIndexer.indexAllContent()
      },
      text: 'Building search index',
    })
    process.exit()
  }
}
