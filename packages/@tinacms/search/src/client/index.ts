import type { SearchClient } from '../types'
import { SqliteLevel } from 'sqlite-level'
import * as zlib from 'zlib'
import si from 'search-index'
import { MemoryLevel } from 'memory-level'
import { lookupStopwords } from '../indexer/utils'
import fetch, { Headers } from 'node-fetch'

const DEFAULT_TOKEN_SPLIT_REGEX = /[\p{L}\d_]+/gu

type TinaSearchIndexerClientOptions = {
  stopwordLanguages?: string[]
  tokenSplitRegex?: string
}

type TinaCloudSearchIndexerClientOptions = {
  apiUrl: string
  branch: string
  indexerToken: string
} & TinaSearchIndexerClientOptions

export class LocalSearchIndexClient implements SearchClient {
  public searchIndex: any
  protected readonly memoryLevel: MemoryLevel
  private readonly stopwords: string[]
  private readonly tokenSplitRegex: RegExp
  constructor(options: TinaSearchIndexerClientOptions) {
    this.memoryLevel = new MemoryLevel()
    this.stopwords = lookupStopwords(options.stopwordLanguages)
    this.tokenSplitRegex = options.tokenSplitRegex
      ? new RegExp(options.tokenSplitRegex, 'gu')
      : DEFAULT_TOKEN_SPLIT_REGEX
  }
  async onStartIndexing() {
    this.searchIndex = await si({
      // @ts-ignore
      db: this.memoryLevel,
      stopwords: this.stopwords,
      tokenSplitRegex: this.tokenSplitRegex,
    })
  }

  async put(docs: any[]) {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first')
    }
    return this.searchIndex.PUT(docs)
  }

  async del(ids: string[]) {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first')
    }
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

  async export(filename: string) {
    const sqliteLevel = new SqliteLevel({ filename })
    const iterator = this.memoryLevel.iterator()
    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value)
    }
    await sqliteLevel.close()
  }
}

export class TinaCMSSearchIndexClient extends LocalSearchIndexClient {
  private readonly apiUrl: string
  private readonly branch: string
  private readonly indexerToken: string
  constructor(options: TinaCloudSearchIndexerClientOptions) {
    super(options)

    this.apiUrl = options.apiUrl
    this.branch = options.branch
    this.indexerToken = options.indexerToken
  }

  async onFinishIndexing() {
    const headers = new Headers()
    headers.append('x-api-key', this.indexerToken || 'bogus')
    headers.append('Content-Type', 'application/json')
    let res = await fetch(`${this.apiUrl}/upload/${this.branch}`, {
      method: 'GET',
      headers,
    })
    if (res.status !== 200) {
      let json
      try {
        json = await res.json()
      } catch (e) {
        console.error('Failed to parse error response', e)
      }

      throw new Error(
        `Failed to get upload url. Status: ${res.status}${
          json?.message ? ` - ${json.message}` : ``
        }`
      )
    }
    const { signedUrl } = await res.json()
    const sqliteLevel = new SqliteLevel({ filename: ':memory:' })
    const iterator = this.memoryLevel.iterator()
    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value)
    }
    const buffer = sqliteLevel.db.serialize()
    await sqliteLevel.close()
    // upload the buffer to the apiUrl
    res = await fetch(signedUrl, {
      method: 'PUT',
      body: zlib.gzipSync(buffer),
    })
    if (res.status !== 200) {
      throw new Error(
        `Failed to upload search index. Status: ${
          res.status
        }\n${await res.text()}`
      )
    }
  }
}
