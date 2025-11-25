import type { SearchClient, SearchOptions } from '../types';
// default import + destructuring because `sqlite-level` still exposes CJS-style exports.
import sqliteLevel from 'sqlite-level';
const { SqliteLevel } = sqliteLevel;
import si from 'search-index';
import { MemoryLevel } from 'memory-level';
import { lookupStopwords } from '../indexer/utils';
import { FuzzySearchWrapper } from '../fuzzy-search-wrapper';
import * as zlib from 'node:zlib';

const DEFAULT_TOKEN_SPLIT_REGEX = /[\p{L}\d_]+/gu;

type TinaSearchIndexerClientOptions = {
  stopwordLanguages?: string[];
  tokenSplitRegex?: string;
};

type TinaCloudSearchIndexerClientOptions = {
  apiUrl: string;
  branch: string;
  indexerToken: string;
} & TinaSearchIndexerClientOptions;

export class LocalSearchIndexClient implements SearchClient {
  public searchIndex: any;
  protected readonly memoryLevel: MemoryLevel;
  private readonly stopwords: string[];
  private readonly tokenSplitRegex: RegExp;
  private fuzzySearchWrapper?: FuzzySearchWrapper;

  constructor(options: TinaSearchIndexerClientOptions) {
    this.memoryLevel = new MemoryLevel();
    this.stopwords = lookupStopwords(options.stopwordLanguages);
    this.tokenSplitRegex = options.tokenSplitRegex
      ? new RegExp(options.tokenSplitRegex, 'gu')
      : DEFAULT_TOKEN_SPLIT_REGEX;
  }
  async onStartIndexing() {
    this.searchIndex = await si({
      // @ts-ignore
      db: this.memoryLevel,
      stopwords: this.stopwords,
      tokenSplitRegex: this.tokenSplitRegex,
    });

    // Initialize fuzzy search wrapper
    this.fuzzySearchWrapper = new FuzzySearchWrapper(this.searchIndex);
  }

  async put(docs: any[]) {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }
    return this.searchIndex.PUT(docs);
  }

  async del(ids: string[]) {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }
    return this.searchIndex.DELETE(ids);
  }

  async query(
    query: string,
    options?: SearchOptions
  ): Promise<{
    results: any[];
    total: number;
    nextCursor: string | null;
    prevCursor: string | null;
  }> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }

    // Apply fuzzy search if enabled
    if (options?.fuzzy && this.fuzzySearchWrapper) {
      try {
        // Use the FuzzySearchWrapper's query method which handles everything
        return await this.fuzzySearchWrapper.query(query, {
          limit: options.limit,
          cursor: options.cursor,
          fuzzy: true,
          fuzzyOptions: options.fuzzyOptions,
        });
      } catch (error) {
        // Fall back to standard search if fuzzy search fails
        console.warn('Fuzzy search failed, using standard search:', error);
      }
    }

    // Standard search without fuzzy matching
    const searchIndexOptions: any = {};

    if (options?.limit) {
      searchIndexOptions.PAGE = {
        NUMBER: 0,
        SIZE: options.limit,
      };
    }

    // Execute the search with AND logic for all query terms
    const terms = query.split(' ').filter((t) => t.trim().length > 0);
    const queryObj =
      terms.length > 1 ? { AND: terms } : { AND: [terms[0] || ''] };
    const searchResults = await this.searchIndex.QUERY(
      queryObj,
      searchIndexOptions
    );

    return {
      results: searchResults.RESULT || [],
      total: searchResults.RESULT_LENGTH || 0,
      nextCursor: null, // Local search doesn't use cursors
      prevCursor: null,
    };
  }

  async export(filename: string) {
    const sqliteLevel = new SqliteLevel({ filename });
    const iterator = this.memoryLevel.iterator();
    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value);
    }
    await sqliteLevel.close();
  }
}

export class TinaCMSSearchIndexClient extends LocalSearchIndexClient {
  private readonly apiUrl: string;
  private readonly branch: string;
  private readonly indexerToken: string;
  constructor(options: TinaCloudSearchIndexerClientOptions) {
    super(options);

    this.apiUrl = options.apiUrl;
    this.branch = options.branch;
    this.indexerToken = options.indexerToken;
  }

  async onFinishIndexing() {
    const headers = new Headers();
    headers.append('x-api-key', this.indexerToken || 'bogus');
    headers.append('Content-Type', 'application/json');
    let res = await fetch(`${this.apiUrl}/upload/${this.branch}`, {
      method: 'GET',
      headers,
    });
    if (res.status !== 200) {
      let json;
      try {
        json = await res.json();
      } catch (e) {
        console.error('Failed to parse error response', e);
      }

      throw new Error(
        `Failed to get upload url. Status: ${res.status}${
          json?.message ? ` - ${json.message}` : ``
        }`
      );
    }
    const { signedUrl } = await res.json();
    const sqliteLevel = new SqliteLevel({ filename: ':memory:' });
    const iterator = this.memoryLevel.iterator();
    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value);
    }
    const buffer = sqliteLevel.db.serialize();
    await sqliteLevel.close();
    // upload the buffer to the apiUrl
    const compressedBuffer = zlib.gzipSync(buffer);
    res = await fetch(signedUrl, {
      method: 'PUT',
      body: new Uint8Array(compressedBuffer),
    });
    if (res.status !== 200) {
      throw new Error(
        `Failed to upload search index. Status: ${
          res.status
        }\n${await res.text()}`
      );
    }
  }
}
