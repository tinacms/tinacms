import { AuthProvider, LoginStrategy } from '@tinacms/schema-tools'
import { authenticate, AUTH_TOKEN_KEY, TokenObject } from '../auth/authenticate'
import DefaultSessionProvider from '../auth/defaultSessionProvider'

export abstract class AbstractAuthProvider implements AuthProvider {
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
    const token = await this.getToken()
    if (token?.id_token) {
      headers['Authorization'] = 'Bearer ' + token?.id_token
    }
    return await fetch(input, {
      ...(init || {}),
      headers: new Headers(headers),
    })
  }

  async authorize(context?: any): Promise<any> {
    // by default, the existence of a token is enough to be authorized
    return this.getToken()
  }
  async isAuthorized(context?: any): Promise<boolean> {
    return !!(await this.authorize(context))
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getUser())
  }

  getLoginStrategy(): LoginStrategy {
    return 'Redirect'
  }

  getSessionProvider() {
    return DefaultSessionProvider
  }

  abstract getToken()
  abstract getUser()
  abstract logout()
  abstract authenticate(props?: Record<string, string>)
}

export class TinaCloudAuthProvider extends AbstractAuthProvider {
  clientId: string
  identityApiUrl: string
  frontendUrl: string
  token: string // used with memory storage
  setToken: (_token: TokenObject) => void
  getToken: () => Promise<TokenObject>

  constructor({
    clientId,
    identityApiUrl,
    tokenStorage = 'MEMORY',
    frontendUrl,
    ...options
  }: {
    clientId: string
    identityApiUrl: string
    tokenStorage?: 'MEMORY' | 'LOCAL_STORAGE' | 'CUSTOM'
    getTokenFn?: () => Promise<TokenObject>
    frontendUrl: string
  }) {
    super()
    this.frontendUrl = frontendUrl
    this.clientId = clientId
    this.identityApiUrl = identityApiUrl
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
  async authenticate() {
    const token = await authenticate(this.clientId, this.frontendUrl)
    this.setToken(token)
    return token
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
  async logout() {
    this.setToken(null)
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
}

const LOCAL_CLIENT_KEY = 'tina.local.isLogedIn'

export class LocalAuthProvider extends AbstractAuthProvider {
  constructor() {
    super()
  }

  async authenticate() {
    localStorage.setItem(LOCAL_CLIENT_KEY, 'true')
    return { access_token: 'LOCAL', id_token: 'LOCAL', refresh_token: 'LOCAL' }
  }

  async getUser(): Promise<boolean> {
    return localStorage.getItem(LOCAL_CLIENT_KEY) === 'true'
  }
  async getToken() {
    return Promise.resolve({ id_token: '' })
  }
  async logout() {
    localStorage.removeItem(LOCAL_CLIENT_KEY)
  }
}
