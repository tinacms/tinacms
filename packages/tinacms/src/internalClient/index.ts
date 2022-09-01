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

import { AUTH_TOKEN_KEY, TokenObject, authenticate } from '../auth/authenticate'
//@ts-ignore can't locate BranchChangeEvent
import { BranchChangeEvent, BranchData, EventBus } from '@tinacms/toolkit'
import {
  DocumentNode,
  GraphQLSchema,
  buildClientSchema,
  getIntrospectionQuery,
  print,
  parse,
} from 'graphql'

import { formify } from './formify'
import { formify as formify2 } from '../hooks/formify'

import gql from 'graphql-tag'
import {
  TinaSchema,
  addNamespaceToSchema,
  TinaCloudSchema,
} from '@tinacms/schema-tools'

export type TinaIOConfig = {
  assetsApiUrlOverride?: string // https://assets.tinajs.io
  frontendUrlOverride?: string // https://app.tina.io
  identityApiUrlOverride?: string // https://identity.tinajs.io
  contentApiUrlOverride?: string // https://content.tinajs.io
}
interface ServerOptions {
  schema?: TinaCloudSchema<false>
  clientId: string
  branch: string
  customContentApiUrl?: string
  getTokenFn?: () => Promise<TokenObject>
  tinaioConfig?: TinaIOConfig
  tokenStorage?: 'MEMORY' | 'LOCAL_STORAGE' | 'CUSTOM'
}

const captureBranchName = /^refs\/heads\/(.*)/
const parseRefForBranchName = (ref: string) => {
  const matches = ref.match(captureBranchName)
  return matches[1]
}

export class Client {
  frontendUrl: string
  contentApiUrl: string
  identityApiUrl: string
  assetsApiUrl: string
  gqlSchema: GraphQLSchema
  schema?: TinaSchema
  clientId: string
  contentApiBase: string
  query: string
  setToken: (_token: TokenObject) => void
  private getToken: () => Promise<TokenObject>
  private token: string // used with memory storage
  private branch: string
  private options: ServerOptions
  events = new EventBus() // automatically hooked into global event bus when attached via cms.registerApi

  constructor({ tokenStorage = 'MEMORY', ...options }: ServerOptions) {
    if (options.schema) {
      const enrichedSchema = new TinaSchema({
        version: { fullVersion: '', major: '', minor: '', patch: '' },
        meta: { flags: [] },
        ...addNamespaceToSchema({ ...options.schema }, []),
      })
      this.schema = enrichedSchema
    }
    this.options = options
    this.setBranch(options.branch)
    this.events.subscribe<BranchChangeEvent>(
      'branch:change',
      ({ branchName }) => {
        this.setBranch(branchName)
      }
    )
    this.clientId = options.clientId

    switch (tokenStorage) {
      case 'LOCAL_STORAGE':
        this.getToken = async function () {
          const tokens = localStorage.getItem(AUTH_TOKEN_KEY) || null
          if (tokens) {
            return await this.getRefreshedToken(tokens)
          } else {
            return {
              access_token: null,
              id_token: null,
              refresh_token: null,
            }
          }
        }
        this.setToken = function (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token, null, 2))
        }
        break
      case 'MEMORY':
        this.getToken = async () => {
          if (this.token) {
            return await this.getRefreshedToken(this.token)
          } else {
            return {
              access_token: null,
              id_token: null,
              refresh_token: null,
            }
          }
        }
        this.setToken = (token) => {
          this.token = JSON.stringify(token, null, 2)
        }
        break
      case 'CUSTOM':
        if (!options.getTokenFn) {
          throw new Error(
            'When CUSTOM token storage is selected, a getTokenFn must be provided'
          )
        }
        this.getToken = options.getTokenFn
        break
    }
  }

  public get isLocalMode() {
    return this.contentApiUrl.includes('localhost')
  }

  setBranch(branchName: string) {
    const encodedBranch = encodeURIComponent(branchName)
    this.branch = encodedBranch
    this.assetsApiUrl =
      this.options.tinaioConfig?.assetsApiUrlOverride ||
      'https://assets.tinajs.io'
    this.frontendUrl =
      this.options.tinaioConfig?.frontendUrlOverride || 'https://app.tina.io'
    this.identityApiUrl =
      this.options.tinaioConfig?.identityApiUrlOverride ||
      'https://identity.tinajs.io'
    this.contentApiBase =
      this.options.tinaioConfig?.contentApiUrlOverride ||
      `https://content.tinajs.io`
    this.contentApiUrl =
      this.options.customContentApiUrl ||
      `${this.contentApiBase}/content/${this.options.clientId}/github/${encodedBranch}`
  }

  addPendingContent = async (props) => {
    const mutation = `#graphql
mutation addPendingDocumentMutation(
  $relativePath: String!
  $collection: String!
  $template: String
) {
  addPendingDocument(
    relativePath: $relativePath
    template: $template
    collection: $collection
  ) {
    ... on Document {
      sys {
        relativePath
        path
        breadcrumbs
        collection {
          slug
        }
      }
    }
  }
}`

    const result = await this.request(mutation, {
      variables: props,
    })

    return result
  }

  getSchema = async () => {
    if (!this.gqlSchema) {
      const data = await this.request<any>(getIntrospectionQuery(), {
        variables: {},
      })

      this.gqlSchema = buildClientSchema(data)
    }

    return this.gqlSchema
  }

  /**
   *
   * Returns a version of the query with fragments inlined. Eg.
   * ```graphql
   * {
   *   getPostDocument(relativePath: "") {
   *     data {
   *       ...PostFragment
   *     }
   *   }
   * }
   *
   * fragment PostFragment on Post {
   *   title
   * }
   * ```
   * Turns into
   * ```graphql
   * {
   *   getPostDocument(relativePath: "") {
   *     data {
   *       title
   *     }
   *   }
   * }
   */
  getOptimizedQuery = async (documentNode: DocumentNode) => {
    const data = await this.request<any>(
      `query GetOptimizedQuery($queryString: String!) {
        getOptimizedQuery(queryString: $queryString)
      }`,
      {
        variables: { queryString: print(documentNode) },
      }
    )
    return parse(data.getOptimizedQuery)
  }

  async requestWithForm<ReturnType>(
    query: (gqlTag: typeof gql) => DocumentNode,
    {
      variables,
      useUnstableFormify,
    }: { variables; useUnstableFormify?: boolean }
  ) {
    const schema = await this.getSchema()
    let formifiedQuery
    if (useUnstableFormify) {
      const res = await formify2({
        schema,
        query: print(query(gql)),
        getOptimizedQuery: this.getOptimizedQuery,
      })
      formifiedQuery = res.formifiedQuery
    } else {
      formifiedQuery = formify(query(gql), schema)
    }

    return this.request<ReturnType>(print(formifiedQuery), { variables })
  }

  async request<ReturnType>(
    query: ((gqlTag: typeof gql) => DocumentNode) | string,
    { variables }: { variables: object }
  ): Promise<ReturnType> {
    const res = await fetch(this.contentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (await this.getToken()).id_token,
      },
      body: JSON.stringify({
        query: typeof query === 'function' ? print(query(gql)) : query,
        variables,
      }),
    })

    if (res.status !== 200) {
      let errorMessage = `Unable to complete request, ${res.statusText}`
      const resBody = await res.json()
      if (resBody.message) {
        errorMessage = `${errorMessage}, Response: ${resBody.message}`
      }
      throw new Error(errorMessage)
    }

    const json = await res.json()
    if (json.errors) {
      throw new Error(
        `Unable to fetch, errors: \n\t${json.errors
          .map((error) => error.message)
          .join('\n')}`
      )
      return json
    }
    return json.data as ReturnType
  }

  async syncTinaMedia(): Promise<{ assetsSyncing: string[] }> {
    const res = await this.fetchWithToken(
      `${this.contentApiBase}/assets/${this.clientId}/sync/${this.branch}`,
      { method: 'POST' }
    )
    const jsonRes = await res.json()
    return jsonRes
  }

  async checkSyncStatus({
    assetsSyncing,
  }: {
    assetsSyncing: string[]
  }): Promise<{ assetsSyncing: string[] }> {
    const res = await this.fetchWithToken(
      `${this.assetsApiUrl}/v1/${this.clientId}/syncStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetsSyncing: assetsSyncing }),
      }
    )
    const jsonRes = await res.json()
    return jsonRes
  }

  async fetchEvents(
    limit?: number,
    cursor?: string
  ): Promise<{
    events: {
      message: string
      timestamp: number
      id: string
      isError: boolean
      isGlobal: boolean
    }[]
    cursor?: string
  }> {
    if (this.isLocalMode) {
      return {
        events: [],
      }
    } else {
      return (
        await this.fetchWithToken(
          `${this.contentApiBase}/events/${this.clientId}/${
            this.branch
          }?limit=${limit || 1}${cursor ? `&cursor=${cursor}` : ''}`,
          { method: 'GET' }
        )
      ).json()
    }
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  }

  async getRefreshedToken(tokens: string): Promise<TokenObject> {
    const { access_token, id_token, refresh_token } = JSON.parse(tokens)
    const { exp, iss, client_id } = this.parseJwt(access_token)

    // if the token is going to expire within the next two minutes, refresh it now
    if (Date.now() / 1000 >= exp - 120) {
      const refreshResponse = await fetch(iss, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        },
        body: JSON.stringify({
          ClientId: client_id,
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          AuthParameters: {
            REFRESH_TOKEN: refresh_token,
            DEVICE_KEY: null,
          },
        }),
      })

      if (refreshResponse.status !== 200) {
        throw new Error('Unable to refresh auth tokens')
      }

      const responseJson = await refreshResponse.json()
      const newToken = {
        access_token: responseJson.AuthenticationResult.AccessToken,
        id_token: responseJson.AuthenticationResult.IdToken,
        refresh_token,
      }
      this.setToken(newToken)

      return Promise.resolve(newToken)
    }

    return Promise.resolve({ access_token, id_token, refresh_token })
  }

  async isAuthorized(): Promise<boolean> {
    return this.isAuthenticated() // TODO - check access
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getUser())
  }

  async authenticate() {
    const token = await authenticate(this.clientId, this.frontendUrl)
    this.setToken(token)
    return token
  }
  /**
   * Wraps the normal fetch function with same API but adds the authorization header token.
   *
   * @example
   * const test = await tinaCloudClient.fetchWithToken(`/mycustomAPI/thing/one`) // the token will be passed in the authorization header
   *
   * @param input fetch function input
   * @param init fetch function init
   */
  async fetchWithToken(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    const headers = init?.headers || {}
    return await fetch(input, {
      ...init,
      headers: new Headers({
        Authorization: 'Bearer ' + (await this.getToken()).id_token,
        ...headers,
      }),
    })
  }

  async getUser() {
    if (!this.clientId) {
      return null
    }

    const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/currentUser`

    try {
      const res = await this.fetchWithToken(url, {
        method: 'GET',
      })
      const val = await res.json()
      if (!res.status.toString().startsWith('2')) {
        console.error(val.error)
        return null
      }
      return val
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async listBranches() {
    const url = `${this.contentApiBase}/github/${this.clientId}/list_branches`
    const res = await this.fetchWithToken(url, {
      method: 'GET',
    })
    return res.json()
  }
  async createBranch({ baseBranch, branchName }: BranchData) {
    const url = `${this.contentApiBase}/github/${this.clientId}/create_branch`

    try {
      const res = await this.fetchWithToken(url, {
        method: 'POST',
        body: JSON.stringify({
          baseBranch,
          branchName,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return await res.json().then((r) => parseRefForBranchName(r.data.ref))
    } catch (error) {
      console.error('There was an error creating a new branch.', error)
      return null
    }
  }
}

export const DEFAULT_LOCAL_TINA_GQL_SERVER_URL = 'http://localhost:4001/graphql'

export class LocalClient extends Client {
  constructor(props?: {
    customContentApiUrl?: string
    schema?: TinaCloudSchema<false>
  }) {
    const clientProps = {
      ...props,
      clientId: '',
      branch: '',
      customContentApiUrl:
        props && props.customContentApiUrl
          ? props.customContentApiUrl
          : DEFAULT_LOCAL_TINA_GQL_SERVER_URL,
    }
    super(clientProps)
  }

  async isAuthorized(): Promise<boolean> {
    return true
  }

  async isAuthenticated(): Promise<boolean> {
    return true
  }
}
