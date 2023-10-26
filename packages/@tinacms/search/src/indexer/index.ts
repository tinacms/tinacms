import { Collection, TinaSchema } from '@tinacms/schema-tools'
import {
  Bridge,
  loadAndParseWithAliases,
  sequential,
  scanAllContent,
  scanContentByPaths,
  transformDocument,
  transformDocumentIntoPayload,
  bridgeDataLoader,
} from '@tinacms/graphql'
import { SearchClient } from '../types'
import { processDocumentForIndexing } from './utils'

type SearchIndexOptions = {
  batchSize?: number
  bridge: Bridge
  client: SearchClient
  schema: TinaSchema
  textIndexLength?: number
}

export class SearchIndexer {
  private readonly batchSize: number
  private readonly client: SearchClient
  private readonly bridge: Bridge
  private readonly schema: TinaSchema
  private readonly textIndexLength: number
  constructor(options: SearchIndexOptions) {
    this.client = options.client
    this.bridge = options.bridge
    this.schema = options.schema
    this.batchSize = options.batchSize || 100
    this.textIndexLength = options.textIndexLength || 500
  }

  private makeIndexerCallback(itemCallback: (item: any) => Promise<void>) {
    return async (collection: Collection<true>, contentPaths: string[]) => {
      const templateInfo = this.schema.getTemplatesForCollectable(collection)
      // TODO I think this will also need to handle single file collections
      const dataLoader = bridgeDataLoader({
        bridge: this.bridge,
        collection,
      })
      await sequential(contentPaths as string[], async (path) => {
        const data = await transformDocumentIntoPayload(
          `${collection.path}/${path}`,
          transformDocument(
            path,
            await loadAndParseWithAliases(
              dataLoader,
              path,
              // collection,
              templateInfo
            ),
            this.schema
          ),
          this.schema
        )
        await itemCallback(
          processDocumentForIndexing(
            data['_values'],
            path,
            collection,
            this.textIndexLength
          )
        )
      })
    }
  }

  public async indexContentByPaths(documentPaths: string[]) {
    let batch = []
    const itemCallback = async (item: any) => {
      batch.push(item)
      if (batch.length > this.batchSize) {
        await this.client.put(batch)
        batch = []
      }
    }
    await this.client.onStartIndexing?.()
    await scanContentByPaths(
      this.schema,
      documentPaths,
      this.makeIndexerCallback(itemCallback)
    )
    if (batch.length > 0) {
      await this.client.put(batch)
    }
    await this.client.onFinishIndexing?.()
  }

  public async indexAllContent() {
    await this.client.onStartIndexing?.()

    let batch = []
    const itemCallback = async (item: any) => {
      batch.push(item)
      if (batch.length > this.batchSize) {
        await this.client.put(batch)
        batch = []
      }
    }
    const warnings = await scanAllContent(
      this.schema,
      this.bridge,
      this.makeIndexerCallback(itemCallback)
    )
    if (batch.length > 0) {
      await this.client.put(batch)
    }

    await this.client.onFinishIndexing?.()
    return { warnings }
  }

  public async deleteIndexContent(documentPaths: string[]) {
    await this.client.onStartIndexing?.()
    await this.client.del(documentPaths)
    await this.client.onFinishIndexing?.()
  }
}
