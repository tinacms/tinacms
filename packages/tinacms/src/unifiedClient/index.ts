/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import fetchPonyfill from 'fetch-ponyfill'
import UrlPattern from 'url-pattern'

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
    this.readonlyToken = token
    this.queries = queries(this)
  }

  public async request<DataType extends Record<string, any> = any>(
    args: TinaClientRequestArgs
  ): Promise<{ data: DataType; query: string }> {
    let data: DataType = {} as DataType
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

  public parseURL = (overrideUrl: string): TinaClientURLParts => {
    const url = overrideUrl || this.apiUrl
    if (url.includes('localhost')) {
      return {
        host: 'localhost',
        branch: null,
        isLocalClient: true,
        clientId: null,
      }
    }

    const params = new URL(url)
    const pattern = new UrlPattern('/content/:clientId/github/*', {
      escapeChar: ' ',
    })
    const result = pattern.match(params.pathname)
    const branch = result?._
    const clientId = result?.clientId

    if (!branch || !clientId) {
      throw new Error(
        `Invalid URL format provided. Expected: https://${TINA_HOST}/content/<ClientID>/github/<Branch> but but received ${url}`
      )
    }

    // TODO if !result || !result.clientId || !result.branch, throw an error

    if (params.host !== TINA_HOST) {
      throw new Error(
        `The only supported hosts are ${TINA_HOST} or localhost, but received ${params.host}.`
      )
    }

    return {
      host: params.host,
      clientId,
      branch,
      isLocalClient: false,
    }
  }
}

export function createClient<GenQueries>(args: TinaClientArgs<GenQueries>) {
  const client = new TinaClient<ReturnType<typeof args.queries>>(args)
  return client
}
