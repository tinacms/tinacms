import type { Config } from '@tinacms/schema-tools';
import AsyncLock from 'async-lock';
import type { GraphQLError } from 'graphql';
import type { Cache } from '../cache/index';

export const TINA_HOST = 'content.tinajs.io';
export interface TinaClientArgs<GenQueries = Record<string, unknown>> {
  url: string;
  token?: string;
  queries: (client: TinaClient<GenQueries>) => GenQueries;
  errorPolicy?: Config['client']['errorPolicy'];
  cacheDir?: string;
  /**
   * Set to `false` to force-disable the filesystem-backed response cache, even
   * when a `cacheDir` is provided. Useful as an escape hatch on runtimes where
   * the cache shouldn't run (e.g. an edge runtime not auto-detected). Defaults
   * to enabled when a `cacheDir` is set.
   */
  cache?: boolean;
}
export type TinaClientRequestArgs = {
  variables?: Record<string, any>;
  query: string;
  errorPolicy?: 'throw' | 'include';
} & Partial<Omit<TinaClientArgs, 'queries'>>;

export type TinaClientURLParts = {
  host: string;
  clientId: string;
  branch: string;
  isLocalClient: boolean;
};

/**
 * Replaces the part of a URL after 'github/' with a specified replacement string.
 *
 * @param {string} url The original URL.
 * @param {string} replacement The string to replace the part after 'github/'.
 * @returns {string} The modified URL, or the original URL if 'github/' is not found.
 */
function replaceGithubPathSplit(url: string, replacement: string) {
  const parts = url.split('github/');
  if (parts.length > 1 && replacement) {
    return parts[0] + 'github/' + replacement;
  } else {
    return url;
  }
}

/**
 * Detects edge runtimes that expose a Node `fs` shim where the filesystem is not
 * actually usable for the response cache. On Cloudflare Workers (workerd) the
 * `node:fs` calls don't throw — they hang — which would never release the
 * per-key cache lock and deadlock concurrent same-key requests. On these
 * runtimes the client must skip the filesystem-backed cache entirely and take
 * the lock-free request path instead. Every global is probed defensively so
 * this never throws under a normal Node build.
 */
function isEdgeRuntimeWithoutFs(): boolean {
  // Cloudflare Workers (workerd) reports this exact navigator.userAgent.
  if (
    typeof navigator !== 'undefined' &&
    navigator.userAgent === 'Cloudflare-Workers'
  ) {
    return true;
  }
  // Vercel Edge runtime exposes a global `EdgeRuntime`.
  if (
    typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== 'undefined'
  ) {
    return true;
  }
  return false;
}

export class TinaClient<GenQueries> {
  public apiUrl: string;
  public readonlyToken?: string;
  public queries: GenQueries;
  public errorPolicy: Config['client']['errorPolicy'];
  initialized = false;
  cacheLock: AsyncLock | undefined;
  cacheDir: string;
  cache: Cache | null;
  cacheEnabled: boolean;

  constructor({
    token,
    url,
    queries,
    errorPolicy,
    cacheDir,
    cache,
  }: TinaClientArgs<GenQueries>) {
    this.apiUrl = url;
    this.readonlyToken = token?.trim();
    this.queries = queries(this);
    this.errorPolicy = errorPolicy || 'throw';
    this.cacheDir = cacheDir || '';
    this.cacheEnabled = cache !== false;
  }

  async init() {
    if (this.initialized) {
      return;
    }
    try {
      if (
        this.cacheEnabled &&
        this.cacheDir &&
        typeof window === 'undefined' &&
        !isEdgeRuntimeWithoutFs()
      ) {
        const { NodeCache } = await import('../cache/node-cache.js');
        this.cache = await NodeCache(this.cacheDir);
        if (this.cache) {
          this.cacheLock = new AsyncLock();
        }
      }
    } catch (e) {
      console.error(e);
    }
    this.initialized = true;
  }

  public async request<DataType extends Record<string, any> = any>(
    { errorPolicy, ...args }: TinaClientRequestArgs,
    options: { fetchOptions?: Parameters<typeof fetch>[1] }
  ) {
    await this.init();
    const errorPolicyDefined = errorPolicy || this.errorPolicy;
    const headers = new Headers();
    if (this.readonlyToken) {
      headers.append('X-API-KEY', this.readonlyToken);
    }
    headers.append('Content-Type', 'application/json');
    if (options?.fetchOptions) {
      if (options?.fetchOptions?.headers) {
        Object.entries(options.fetchOptions.headers).forEach(([key, value]) => {
          headers.append(key, value);
        });
      }
    }
    const { headers: _, ...providedFetchOptions } = options?.fetchOptions || {};

    const bodyString = JSON.stringify({
      query: args.query,
      variables: args?.variables || {},
    });

    const optionsObject: Parameters<typeof fetch>[1] = {
      method: 'POST',
      headers,
      body: bodyString,
      redirect: 'follow',
      ...providedFetchOptions,
    };

    // Look for the header and change to use this branch instead of the build time generated branch.
    // This comes from the clients fetch options:
    //client.queries.collection({},   {
    //  fetchOptions: {
    //    headers: {
    //      'x-branch': cookieStore.get('x-branch')?.value,
    //    },
    //  },
    //})
    const draftBranch = headers.get('x-branch');
    const url = replaceGithubPathSplit(args?.url || this.apiUrl, draftBranch);

    let key = '';
    let result: {
      data: DataType;
      errors: GraphQLError[] | null;
      query: string;
    };
    if (this.cache) {
      key = this.cache.makeKey(bodyString);
      await this.cacheLock.acquire(key, async () => {
        result = await this.cache.get(key);
        if (!result) {
          result = await requestFromServer<DataType>(
            url,
            args.query,
            optionsObject,
            errorPolicyDefined
          );
          await this.cache.set(key, result);
        }
      });
    } else {
      result = await requestFromServer<DataType>(
        url,
        args.query,
        optionsObject,
        errorPolicyDefined
      );
    }

    return result;
  }
}

async function requestFromServer<DataType extends Record<string, any> = any>(
  url: string,
  query: string,
  optionsObject: RequestInit,
  errorPolicyDefined: 'throw' | 'include'
) {
  const res = await fetch(url, optionsObject);
  if (!res.ok) {
    let additionalInfo = '';
    if (res.status === 401) {
      additionalInfo =
        'Please check that your client ID, URL and read only token are configured properly.';
    }

    throw new Error(
      `Server responded with status code ${res.status}, ${res.statusText}. ${
        additionalInfo ? additionalInfo : ''
      } Please see our FAQ for more information: https://tina.io/docs/r/FAQ/`
    );
  }
  const json = await res.json();
  if (json.errors && errorPolicyDefined === 'throw') {
    throw new Error(
      `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/r/FAQ/
      Errors: \n\t${json.errors.map((error) => error.message).join('\n')}`
    );
  }
  const result = {
    data: json?.data as DataType,
    errors: (json?.errors || null) as GraphQLError[] | null,
    query,
  };
  return result;
}

export function createClient<GenQueries>(args: TinaClientArgs<GenQueries>) {
  const client = new TinaClient<ReturnType<typeof args.queries>>(args);
  return client;
}
