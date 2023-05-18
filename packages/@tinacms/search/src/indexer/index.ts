import { Collection, ObjectField, TinaSchema } from '@tinacms/schema-tools'
import {
  Bridge,
  loadAndParseWithAliases,
  sequential,
  scanAllContent,
  scanContentByPaths,
  transformDocument,
} from '@tinacms/graphql'
import { SearchClient } from '../types'

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

  private relativePath(path: string, collection: Collection<true>) {
    return path
      .replace(/\\/g, '/')
      .replace(collection.path, '')
      .replace(/^\/|\/$/g, '')
  }

  private processDocumentForIndexing(
    data: any,
    path: string,
    collection: Collection<true>,
    field?: ObjectField<true>
  ) {
    if (!field) {
      data['_id'] = `${collection.name}:${this.relativePath(path, collection)}`
    }
    for (const f of collection.fields || field?.fields || []) {
      const isList = f.list
      if (data[f.name]) {
        if (f.type === 'object') {
          if (isList) {
            data[f.name] = data[f.name].map((obj: any) =>
              this.processDocumentForIndexing(obj, path, collection, f)
            )
          } else {
            data[f.name] = this.processDocumentForIndexing(
              data[f.name],
              path,
              collection,
              f
            )
          }
        } else if (f.type === 'image') {
          delete data[f.name]
        } else if (f.type === 'string' || f.type === 'rich-text') {
          if (isList) {
            data[f.name] = data[f.name].map((value: string) =>
              value.substring(0, this.textIndexLength)
            )
          } else {
            data[f.name] = data[f.name].substring(0, this.textIndexLength)
          }
        }
      }
    }
    return data
  }

  public async indexContentByPaths(documentPaths: string[]) {
    let batch = []
    await this.client.onStartIndexing?.()
    await scanContentByPaths(
      this.schema,
      documentPaths,
      async (collection, contentPaths) => {
        await sequential(contentPaths as string[], async (path) => {
          const data = transformDocument(
            path,
            JSON.parse(await this.bridge.get(path)),
            this.schema
          )
          batch.push(this.processDocumentForIndexing(data, path, collection))
          if (batch.length > this.batchSize) {
            await this.client.put(batch)
            batch = []
          }
        })
      }
    )
    if (batch.length > 0) {
      await this.client.put(batch)
    }
    await this.client.onFinishIndexing?.()
  }

  public async indexAllContent() {
    await this.client.onStartIndexing?.()

    let batch = []
    const warnings = await scanAllContent(
      this.schema,
      this.bridge,
      async (collection, contentPaths) => {
        const templateInfo = await this.schema.getTemplatesForCollectable(
          collection
        )
        await sequential(contentPaths as string[], async (path) => {
          const data = transformDocument(
            path,
            await loadAndParseWithAliases(
              this.bridge,
              path,
              collection,
              templateInfo
            ),
            this.schema
          )
          batch.push(this.processDocumentForIndexing(data, path, collection))
          if (batch.length > this.batchSize) {
            await this.client.put(batch)
            batch = []
          }
        })
      }
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
