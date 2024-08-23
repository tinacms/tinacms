import fetchPonyfill from 'fetch-ponyfill'
import type { GraphQLError } from 'graphql'
import type { Config } from '@tinacms/schema-tools'
import type { Cache } from '../cache/index'

const { fetch: fetchPonyfillFN, Headers: HeadersPonyfill } = fetchPonyfill()

// if fetch or Headers are already defined in the global scope, use them
const fetchDefined = typeof fetch === 'undefined' ? fetchPonyfillFN : fetch
const HeadersDefined =
  typeof Headers === 'undefined' ? HeadersPonyfill : Headers

export const TINA_HOST = 'content.tinajs.io'
export interface TinaClientArgs<GenQueries = Record<string, unknown>> {
  url: string
  token?: string
  queries: (client: TinaClient<GenQueries>) => GenQueries
  errorPolicy?: Config['client']['errorPolicy']
  cacheDir?: string
}
export type TinaClientRequestArgs = {
  variables?: Record<string, any>
  query: string
  errorPolicy?: 'throw' | 'include'
} & Partial<Omit<TinaClientArgs, 'queries'>>

export type TinaClientURLParts = {
  host: string
  clientId: string
  branch: string
  isLocalClient: boolean
}
export class TinaClient<GenQueries> {
  public apiUrl: string
  public readonlyToken?: string
  public queries: GenQueries
  public errorPolicy: Config['client']['errorPolicy']
  cache: Cache
  constructor({
    token,
    url,
    queries,
    errorPolicy,
    cacheDir,
  }: TinaClientArgs<GenQueries>) {
    this.apiUrl = url
    this.readonlyToken = token?.trim()
    this.queries = queries(this)
    this.errorPolicy = errorPolicy || 'throw'

    // if we're in node, use the fs cache
    if (
      typeof process !== 'undefined' &&
      process.versions &&
      process.versions.node
    ) {
      const { NodeCache } = require('tinacms/dist/cache')
      this.cache = NodeCache(
        `${cacheDir || `${process.cwd()}/.tina-cache`}`,
        require('fs')
      )
    }
  }

  public async request<DataType extends Record<string, any> = any>(
    { errorPolicy, ...args }: TinaClientRequestArgs,
    options: { fetchOptions?: Parameters<typeof fetch>[1] }
  ) {
    const errorPolicyDefined = errorPolicy || this.errorPolicy
    const headers = new HeadersDefined()
    if (this.readonlyToken) {
      headers.append('X-API-KEY', this.readonlyToken)
    }
    headers.append('Content-Type', 'application/json')
    if (options?.fetchOptions) {
      if (options?.fetchOptions?.headers) {
        Object.entries(options.fetchOptions.headers).forEach(([key, value]) => {
          headers.append(key, value)
        })
      }
    }
    const { headers: _, ...providedFetchOptions } = options?.fetchOptions || {}

    const bodyString = JSON.stringify({
      query: args.query,
      variables: args?.variables || {},
    })
    const url = args?.url || this.apiUrl

    const optionsObject: Parameters<typeof fetch>[1] = {
      method: 'POST',
      headers,
      body: bodyString,
      redirect: 'follow',
      ...providedFetchOptions,
    }

    let key = ''
    if (this.cache) {
      key = this.cache.makeKey(bodyString)
      const value = await this.cache.get(key)
      if (value) {
        return value
      }
    }

    const res = await fetchDefined(url, optionsObject)
    if (!res.ok) {
      let additionalInfo = ''
      if (res.status === 401) {
        additionalInfo =
          'Please check that your client ID, URL and read only token are configured properly.'
      }

      throw new Error(
        `Server responded with status code ${res.status}, ${res.statusText}. ${
          additionalInfo ? additionalInfo : ''
        } Please see our FAQ for more information: https://tina.io/docs/errors/faq/`
      )
    }
    const json = await res.json()
    if (json.errors && errorPolicyDefined === 'throw') {
      throw new Error(
        `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/
        Errors: \n\t${json.errors.map((error) => error.message).join('\n')}`
      )
    }
    const result = {
      data: json?.data as DataType,
      errors: (json?.errors || null) as GraphQLError[] | null,
      query: args.query,
    }

    if (this.cache) {
      await this.cache.set(key, result)
    }

    return result
  }
}

export function createClient<GenQueries>(args: TinaClientArgs<GenQueries>) {
  const client = new TinaClient<ReturnType<typeof args.queries>>(args)
  return client
}
