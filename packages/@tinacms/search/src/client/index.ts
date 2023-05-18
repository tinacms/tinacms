import type { SearchClient } from '../types'
import { SqliteLevel } from '../sqlite-level'
import * as zlib from 'zlib'
import * as fs from 'fs'
import si from '@kldavis4/search-index'
import { ClassicLevel } from 'classic-level'
import { MemoryLevel } from 'memory-level'
import { lookupStopwords } from '../index'

export class LocalSearchIndexClient implements SearchClient {
  protected searchIndex: any
  constructor(searchIndex: any) {
    this.searchIndex = searchIndex
  }

  async put(docs: any[]) {
    return this.searchIndex.PUT(docs)
  }

  async del(ids: string[]) {
    return this.searchIndex.DELETE(ids)
  }

  query(
    query: string,
    options: { cursor?: string; limit?: number } | undefined
  ): Promise<{
    results: any[]
    total: number
    nextCursor: string | null
    prevCursor: string | null
  }> {
    return Promise.resolve({
      nextCursor: undefined,
      prevCursor: undefined,
      results: [],
      total: 0,
    })
  }
}

type TinaCloudSearchIndexerClientOptions = {
  apiUrl: string
  indexerToken: string
  stopwordLanguages?: string[]
}

export class TinaCMSSearchIndexClient implements SearchClient {
  private memoryLevel: MemoryLevel
  private searchIndex: any
  private readonly apiUrl: string
  private readonly stopwordLanguages: string[] | undefined
  constructor(options: TinaCloudSearchIndexerClientOptions) {
    this.apiUrl = options.apiUrl
    this.stopwordLanguages = options.stopwordLanguages
  }

  async put(docs: any[]) {
    if (this.searchIndex) {
      await this.searchIndex.PUT(docs)
    }
  }

  async del(ids: string[]) {
    if (this.searchIndex) {
      await this.searchIndex.DELETE(ids)
    }
  }

  async onStartIndexing() {
    this.memoryLevel = new MemoryLevel()
    // @ts-ignore
    this.searchIndex = await si({
      db: this.memoryLevel,
      stopwords: lookupStopwords(this.stopwordLanguages),
    })
  }

  async onFinishIndexing() {
    // TODO not clear on whether classic-level or sqlite is better. Seems like sqlite is more compact
    console.log('onFinishIndexing')
    const classicLevel = new ClassicLevel('/tmp/search-index-level.db', {
      keyEncoding: 'buffer',
      valueEncoding: 'buffer',
    })
    // TODO this should use the token and apiUrl to upload the index
    // const sqliteLevel = new SqliteLevel({filename: ':memory:'})
    console.log('dumping to sqlite')
    // const sqliteDb = new SqliteLevel({filename: '/tmp/search-index.db'})
    const iterator = this.memoryLevel.iterator()
    // should batch these writes?
    for await (const [key, value] of iterator) {
      // await sqliteLevel.put(key, value)
      await classicLevel.put(key, value)
    }
    // const buffer = sqliteLevel.db.serialize()
    // await fs.promises.writeFile('/tmp/search-index.db.gz', zlib.gzipSync(buffer))
    // await sqliteLevel.close()
    await classicLevel.close()
    // console.log('done dumping to sqlite')
    // TODO this should use the token and apiUrl to upload the index
    // upload the buffer to the apiUrl
    console.log('done onFinishIndexing')
  }

  public getSearchIndex() {
    return this.searchIndex
  }

  query(
    query: string,
    options: { cursor?: string; limit?: number } | undefined
  ): Promise<{
    results: any[]
    total: number
    nextCursor: string | null
    prevCursor: string | null
  }> {
    return Promise.resolve({
      nextCursor: undefined,
      prevCursor: undefined,
      results: [],
      total: 0,
    })
  }
}
