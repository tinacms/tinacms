import {
  AuthProvider,
  LoginStrategy,
  TokenObject,
} from '@tinacms/schema-tools';
import { isErrorNamed } from '@tinacms/toolkit';
import { AUTH_TOKEN_KEY, authenticate } from '../auth/authenticate';
import DefaultSessionProvider from '../auth/defaultSessionProvider';

type Input = Parameters<AuthProvider['fetchWithToken']>[0];
type Init = Parameters<AuthProvider['fetchWithToken']>[1];
type FetchReturn = ReturnType<AuthProvider['fetchWithToken']>;

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
  /**
   * Called when a request that carried a token comes back 401. The Client
   * wires this to the cms:session-expired dispatch so the auth wall re-arms
   * on every transport, not only GraphQL.
   */
  sessionExpiredListener?: () => void;

  async fetchWithToken(input: Input, init: Init): FetchReturn {
    const headers = init?.headers || {};
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = 'Bearer ' + accessToken;
    }
    const res = await fetch(input, {
      ...(init || {}),
      headers: new Headers(headers),
    });
    // a 401 without a token is just "not logged in", not an expired session
    if (res.status === 401 && accessToken) {
      this.sessionExpiredListener?.();
    }
    return res;
  }

  async getAccessToken(): Promise<string | null> {
    const token = await this.getToken();
    return token?.access_token ?? token?.id_token ?? null;
  }

  async authorize(context?: any): Promise<any> {
    // by default, the existence of a token is enough to be authorized
    return this.getToken();
  }
  async isAuthorized(context?: any): Promise<boolean> {
    return !!(await this.authorize(context));
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getUser());
  }

  getLoginStrategy(): LoginStrategy {
    return 'Redirect';
  }

  /**
   * A React component that renders the custom UI for the login screen.
   * Set the LoginStrategy to LoginScreen when providing this function.
   */
  getLoginScreen() {
    return null;
  }

  getSessionProvider() {
    return DefaultSessionProvider;
  }

  abstract getToken();
  abstract getUser();
  abstract logout();
  abstract authenticate(props?: Record<string, string>);
}

export class TinaCloudAuthProvider extends AbstractAuthProvider {
  clientId: string;
  identityApiUrl: string;
  frontendUrl: string;
  token: TokenObject; // used with memory storage
  hasWarnedNoSession = false;
  setToken: (_token: TokenObject | null) => void;
  getToken: () => Promise<TokenObject>;

  constructor({
    clientId,
    identityApiUrl,
    tokenStorage = 'MEMORY',
    frontendUrl,
    ...options
  }: {
    clientId: string;
    identityApiUrl: string;
    tokenStorage?: 'MEMORY' | 'LOCAL_STORAGE' | 'CUSTOM';
    getTokenFn?: () => Promise<TokenObject>;
    frontendUrl: string;
  }) {
    super();
    this.frontendUrl = frontendUrl;
    this.clientId = clientId;
    this.identityApiUrl = identityApiUrl;
    switch (tokenStorage) {
      case 'LOCAL_STORAGE':
        this.getToken = async function () {
          const tokens = JSON.parse(
            localStorage.getItem(AUTH_TOKEN_KEY) || null
          );
          if (tokens) {
            return await this.getRefreshedToken(tokens);
          } else {
            return {
              access_token: null,
              id_token: null,
              refresh_token: null,
            };
          }
        };
        this.setToken = function (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token, null, 2));
        };
        break;
      case 'MEMORY':
        this.getToken = async () => {
          if (this.token) {
            return await this.getRefreshedToken(this.token);
          } else {
            return {
              access_token: null,
              id_token: null,
              refresh_token: null,
            };
          }
        };
        this.setToken = (token: TokenObject) => {
          this.token = token;
        };
        break;
      case 'CUSTOM':
        if (!options.getTokenFn) {
          throw new Error(
            'When CUSTOM token storage is selected, a getTokenFn must be provided'
          );
        }
        this.getToken = options.getTokenFn;
        break;
    }
  }
  async authenticate() {
    const result = await authenticate(
      this.clientId,
      this.identityApiUrl,
      this.frontendUrl
    );
    if (result) {
      this.setToken(result);
      return result;
    }
  }
  async getUser() {
    if (!this.clientId) {
      return null;
    }

    const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/currentUser`;

    try {
      if (!(await this.getAccessToken())) {
        if (!this.hasWarnedNoSession) {
          this.hasWarnedNoSession = true;
          console.warn(
            'TinaCMS: no TinaCloud session found. If login fails, check the console inside the login popup window for the underlying error.'
          );
        }
        return null;
      }
      let res: Awaited<FetchReturn>;
      try {
        res = await this.fetchWithToken(url, { method: 'GET' });
      } catch (networkError) {
        // one transient identity-API failure must not read as "logged out"
        // and eject the user; retry once, then let callers treat it as an
        // error rather than an expired session
        await new Promise((resolve) => setTimeout(resolve, 300));
        res = await this.fetchWithToken(url, { method: 'GET' });
      }
      const val = await res.json();
      if (!res.status.toString().startsWith('2')) {
        console.error(
          `TinaCMS: TinaCloud session check failed (status ${res.status}).`,
          val?.error ?? val
        );
        return null;
      }
      return val;
    } catch (e) {
      if (e instanceof TypeError || isErrorNamed(e, 'AbortError')) {
        // fetch network failures surface as TypeError: not an auth answer
        throw e;
      }
      console.error(e);
      return null;
    }
  }
  async logout() {
    this.setToken(null);
  }

  async getRefreshedToken(tokens: TokenObject): Promise<TokenObject> {
    const { access_token, id_token, refresh_token } = tokens;
    if (!access_token) {
      throw new Error('Unable to refresh auth tokens: missing access_token');
    }
    const { exp } = this.parseJwt(access_token);

    // if the token is going to expire within the next two minutes, refresh it now
    if (Date.now() / 1000 >= exp - 120) {
      const url = `${this.identityApiUrl}/oauth/token`;

      const params = new URLSearchParams();
      params.set('grant_type', 'refresh_token');
      params.set('refresh_token', refresh_token);
      params.set('client_id', this.clientId);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
        const val = await res.json();
        if (res.status !== 200) {
          throw new Error(
            `Unable to refresh auth tokens. Status: ${res.status} - Body: ${JSON.stringify(val)}`
          );
        }
        const newToken = {
          access_token: val.access_token,
          id_token: val.id_token,
          refresh_token: val.refresh_token ?? refresh_token,
        };
        this.setToken(newToken);
        return newToken;
      } catch (e) {
        console.error(e);
        throw new Error('Unable to refresh auth tokens', { cause: e });
      }
    }

    return { access_token, id_token, refresh_token };
  }
  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}

const LOCAL_CLIENT_KEY = 'tina.local.isLogedIn';

export class LocalAuthProvider extends AbstractAuthProvider {
  constructor() {
    super();
  }

  async authenticate() {
    localStorage.setItem(LOCAL_CLIENT_KEY, 'true');
    return { access_token: 'LOCAL', id_token: 'LOCAL', refresh_token: 'LOCAL' };
  }

  async getUser(): Promise<boolean> {
    return localStorage.getItem(LOCAL_CLIENT_KEY) === 'true';
  }
  async getToken() {
    return Promise.resolve({ access_token: 'LOCAL', refresh_token: 'LOCAL' });
  }
  async logout() {
    localStorage.removeItem(LOCAL_CLIENT_KEY);
  }
}
