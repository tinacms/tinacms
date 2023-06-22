/**

*/

import fetchPonyfill from 'fetch-ponyfill'

const { fetch, Headers } = fetchPonyfill()

export const TINA_HOST = 'content.tinajs.io'
export interface TinaClientArgs<GenQueries = Record<string, unknown>> {
  url: string
  token?: string
  queries: (client: TinaClient<GenQueries>) => GenQueries
}
export type TinaClientRequestArgs = {
  variables?: Record<string, any>
  query: string
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
  /**
   *
   */
  public queries: GenQueries
  constructor({ token, url, queries }: TinaClientArgs<GenQueries>) {
    this.apiUrl = url
    this.readonlyToken = token?.trim()
    this.queries = queries(this)
  }

  public async request<DataType extends Record<string, any> = any>(
    args: TinaClientRequestArgs
  ): Promise<{ data: DataType; query: string }> {
    const data: DataType = {} as DataType
    const headers = new Headers()
    if (this.readonlyToken) {
      headers.append('X-API-KEY', this.readonlyToken)
    }
    headers.append('Content-Type', 'application/json')

    const bodyString = JSON.stringify({
      query: args.query,
      variables: args?.variables || {},
    })
    const url = args?.url || this.apiUrl

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyString,
      redirect: 'follow',
    })
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
    if (json.errors) {
      throw new Error(
        `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/

        Errors: \n\t${json.errors.map((error) => error.message).join('\n')}`
      )
    }
    return {
      data: json?.data as DataType,
      query: args.query,
    }
  }
}

export function createClient<GenQueries>(args: TinaClientArgs<GenQueries>) {
  const client = new TinaClient<ReturnType<typeof args.queries>>(args)
  return client
}
