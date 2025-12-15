import type {
  SearchClient,
  SearchOptions,
  SearchQueryResponse,
  IndexableDocument,
  SearchIndexResult,
} from '../types';
// default import + destructuring because `sqlite-level` still exposes CJS-style exports.
import sqliteLevel from 'sqlite-level';
const { SqliteLevel } = sqliteLevel;
import si from 'search-index';
import { MemoryLevel } from 'memory-level';
import { lookupStopwords } from '../indexer/utils';
import { FuzzySearchWrapper } from '../fuzzy-search-wrapper';
import { buildPageOptions, buildPaginationCursors } from '../pagination';
import * as zlib from 'node:zlib';

const DEFAULT_TOKEN_SPLIT_REGEX = /[\p{L}\d_]+/gu;

interface SearchIndex {
  PUT: (docs: IndexableDocument[]) => Promise<void>;
  DELETE: (ids: string[]) => Promise<void>;
  QUERY: (
    query: { AND: string[] } | { OR: string[] },
    options?: { PAGE?: { NUMBER: number; SIZE: number } }
  ) => Promise<SearchIndexResult>;
  DICTIONARY: (token?: { FIELD: string }) => Promise<unknown[]>;
  fuzzySearchWrapper?: FuzzySearchWrapper;
}

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
  public searchIndex?: SearchIndex;
  protected readonly memoryLevel: MemoryLevel;
  private readonly stopwords: string[];
  private readonly tokenSplitRegex: RegExp;
  public fuzzySearchWrapper?: FuzzySearchWrapper;

  constructor(options: TinaSearchIndexerClientOptions) {
    this.memoryLevel = new MemoryLevel();
    this.stopwords = lookupStopwords(options.stopwordLanguages);
    this.tokenSplitRegex = options.tokenSplitRegex
      ? new RegExp(options.tokenSplitRegex, 'gu')
      : DEFAULT_TOKEN_SPLIT_REGEX;
  }

  async onStartIndexing(): Promise<void> {
    // MemoryLevel is compatible with the search-index db option at runtime.
    // The library's type definitions are incomplete, so we use type assertions.
    const options = {
      db: this.memoryLevel,
      stopwords: this.stopwords,
      tokenSplitRegex: this.tokenSplitRegex,
    };
    this.searchIndex = (await si(
      options as unknown as Parameters<typeof si>[0]
    )) as unknown as SearchIndex;
    this.fuzzySearchWrapper = new FuzzySearchWrapper(this.searchIndex);
  }

  async put(docs: IndexableDocument[]): Promise<void> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }
    await this.searchIndex.PUT(docs);
  }

  async del(ids: string[]): Promise<void> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }
    await this.searchIndex.DELETE(ids);
  }

  async query(
    query: string,
    options?: SearchOptions
  ): Promise<SearchQueryResponse> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }

    if (options?.fuzzy && this.fuzzySearchWrapper) {
      return this.fuzzySearchWrapper.query(query, {
        limit: options.limit,
        cursor: options.cursor,
        fuzzy: true,
        fuzzyOptions: options.fuzzyOptions,
      });
    }

    const searchIndexOptions = buildPageOptions({
      limit: options?.limit,
      cursor: options?.cursor,
    });

    const terms = query.split(' ').filter((t) => t.trim().length > 0);
    const queryObj =
      terms.length > 1 ? { AND: terms } : { AND: [terms[0] || ''] };
    const searchResults = await this.searchIndex.QUERY(
      queryObj,
      searchIndexOptions
    );

    const total = searchResults.RESULT_LENGTH || 0;
    const pagination = buildPaginationCursors(total, {
      limit: options?.limit,
      cursor: options?.cursor,
    });

    return {
      results: searchResults.RESULT || [],
      total,
      ...pagination,
    };
  }

  async export(filename: string): Promise<void> {
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

  private async getUploadUrl(): Promise<string> {
    const headers = new Headers();
    headers.append('x-api-key', this.indexerToken || '');
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${this.apiUrl}/upload/${this.branch}`, {
      method: 'GET',
      headers,
    });

    if (response.status !== 200) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get upload url. Status: ${response.status}${
          errorBody?.message ? ` - ${errorBody.message}` : ''
        }`
      );
    }

    const { signedUrl } = await response.json();
    return signedUrl;
  }

  private async serializeIndex(): Promise<Buffer> {
    const sqliteLevel = new SqliteLevel({ filename: ':memory:' });
    const iterator = this.memoryLevel.iterator();

    for await (const [key, value] of iterator) {
      await sqliteLevel.put(key, value);
    }

    const buffer = sqliteLevel.db.serialize();
    await sqliteLevel.close();
    return zlib.gzipSync(buffer);
  }

  private async uploadIndex(signedUrl: string, data: Buffer): Promise<void> {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: new Uint8Array(data),
    });

    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(
        `Failed to upload search index. Status: ${response.status}\n${errorText}`
      );
    }
  }

  async onFinishIndexing() {
    const signedUrl = await this.getUploadUrl();
    const indexData = await this.serializeIndex();
    await this.uploadIndex(signedUrl, indexData);
  }
}
