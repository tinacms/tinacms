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
import {
  DocumentNode,
  GraphQLSchema,
  buildClientSchema,
  getIntrospectionQuery,
  print,
} from 'graphql'

import { formify } from './formify'
import gql from 'graphql-tag'
//@ts-ignore can't locate BranchChangeEvent
import { EventBus, BranchChangeEvent, BranchData } from '@tinacms/toolkit'
export type TinaIOConfig = {
  frontendUrlOverride?: string // https://app.tina.io
  identityApiUrlOverride?: string // https://identity.tinajs.io
  contentApiUrlOverride?: string // https://content.tinajs.io
}
interface ServerOptions {
  clientId: string
  branch: string
  customContentApiUrl?: string
  getTokenFn?: () => TokenObject
  tinaioConfig?: TinaIOConfig
  tokenStorage?: 'MEMORY' | 'LOCAL_STORAGE' | 'CUSTOM'
}

export class Client {
  frontendUrl: string
  contentApiUrl: string
  identityApiUrl: string
  schema: GraphQLSchema
  clientId: string
  query: string
  setToken: (_token: TokenObject) => void
  private getToken: () => TokenObject
  private token: string // used with memory storage
  private branch: string
  private options: ServerOptions
  events: EventBus // automatically hooked into global event bus when attached via cms.registerApi

  constructor({ tokenStorage = 'MEMORY', ...options }: ServerOptions) {
    this.options = options
    this.setBranch(options.branch)
    this.events = new EventBus()
    this.events.subscribe<BranchChangeEvent>(
      'branch-switcher:change-branch',
      ({ branchName }) => {
        this.setBranch(branchName)
      }
    )

    this.clientId = options.clientId

    switch (tokenStorage) {
      case 'LOCAL_STORAGE':
        this.getToken = function () {
          const tokens = localStorage.getItem(AUTH_TOKEN_KEY) || null
          if (tokens) {
            return JSON.parse(tokens)
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
        this.getToken = () => {
          if (this.token) {
            return JSON.parse(this.token)
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

  setBranch(branchName: string) {
    const encodedBranch = encodeURIComponent(branchName)
    this.frontendUrl =
      this.options.tinaioConfig?.frontendUrlOverride || 'https://app.tina.io'
    this.identityApiUrl =
      this.options.tinaioConfig?.identityApiUrlOverride ||
      'https://identity.tinajs.io'
    const contentApiBase =
      this.options.tinaioConfig?.contentApiUrlOverride ||
      `https://content.tinajs.io`
    this.contentApiUrl =
      this.options.customContentApiUrl ||
      `${contentApiBase}/content/${this.options.clientId}/github/${encodedBranch}`
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
    if (!this.schema) {
      const data = await this.request<any>(getIntrospectionQuery(), {
        variables: {},
      })

      this.schema = buildClientSchema(data)
    }

    return this.schema
  }

  async requestWithForm<ReturnType>(
    query: (gqlTag: typeof gql) => DocumentNode,
    { variables }: { variables }
  ) {
    const schema = await this.getSchema()
    const formifiedQuery = formify(query(gql), schema)

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
        Authorization: 'Bearer ' + this.getToken().id_token,
      },
      body: JSON.stringify({
        query: typeof query === 'function' ? print(query(gql)) : query,
        variables,
      }),
    })

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
        Authorization: 'Bearer ' + this.getToken().id_token,
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

  async listBranches({ owner, repo }: BranchData) {
    const url = `${this.contentApiUrl}/list_branches?owner=${owner}&repo=${repo}`
    try {
      const res = await this.fetchWithToken(url, {
        method: 'GET',
      })

      return JSON.stringify(res)
    } catch (e) {
      console.error('There was an issue fetching the branch list.', e)
      return null
    }
  }
  async createBranch({ owner, repo, baseBranch, branchName }: BranchData) {
    const url = `${this.contentApiUrl}/create_branch`

    try {
      const res = await this.fetchWithToken(url, {
        method: 'POST',
        body: {
          owner,
          repo,
          baseBranch,
          branchName,
        } as any,
      })

      return JSON.stringify(res)
    } catch (error) {
      console.error('There was an error creating a new branch.', error)
      return null
    }
  }
}

export const DEFAULT_LOCAL_TINA_GQL_SERVER_URL = 'http://localhost:4001/graphql'

export class LocalClient extends Client {
  constructor(props?: { customContentApiUrl?: string }) {
    const clientProps = {
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
