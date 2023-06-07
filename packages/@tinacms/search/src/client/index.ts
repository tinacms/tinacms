import type { SearchClient } from '../types'
import { SqliteLevel } from 'sqlite-level'
import * as zlib from 'zlib'
import si from '@tinacms/search-index'
import { MemoryLevel } from 'memory-level'
import { lookupStopwords } from '../index'
import fetch, { Headers } from 'node-fetch'

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
  branch: string
  indexerToken: string
  stopwordLanguages?: string[]
}

export class TinaCMSSearchIndexClient implements SearchClient {
  private memoryLevel: MemoryLevel
  private searchIndex: any
  private readonly apiUrl: string
  private readonly branch: string
  private readonly indexerToken: string
  private readonly stopwordLanguages: string[] | undefined
  constructor(options: TinaCloudSearchIndexerClientOptions) {
    this.apiUrl = options.apiUrl
    this.branch = options.branch
    this.indexerToken = options.indexerToken
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
