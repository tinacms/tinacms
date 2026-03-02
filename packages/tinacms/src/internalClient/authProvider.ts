import { AuthProvider, LoginStrategy } from '@tinacms/schema-tools';
import {
  authenticate,
  AUTH_TOKEN_KEY,
  TokenObject,
  AuthenticationCancelledError,
} from '../auth/authenticate';
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
  async fetchWithToken(input: Input, init: Init): FetchReturn {
    const headers = init?.headers || {};
    const token = await this.getToken();
    if (token?.id_token) {
      headers['Authorization'] = 'Bearer ' + token?.id_token;
    }
    return await fetch(input, {
      ...(init || {}),
      headers: new Headers(headers),
    });
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
  token: string; // used with memory storage
  setToken: (_token: TokenObject) => void;
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
          const tokens = localStorage.getItem(AUTH_TOKEN_KEY) || null;
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
        this.setToken = (token) => {
          this.token = JSON.stringify(token, null, 2);
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
    const token = await authenticate(this.clientId, this.frontendUrl);
    this.setToken(token);
    return token;
  }
  async getUser() {
    if (!this.clientId) {
      return null;
    }

    const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/currentUser`;

    try {
      const res = await this.fetchWithToken(url, {
        method: 'GET',
      });
      const val = await res.json();
      if (!res.status.toString().startsWith('2')) {
        console.error(val.error);
        return null;
      }
      return val;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async logout() {
    this.setToken(null);
  }

  async getRefreshedToken(tokens: string): Promise<TokenObject> {
    const { access_token, id_token, refresh_token } = JSON.parse(tokens);
    const { exp, iss, client_id } = this.parseJwt(access_token);

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
      });

      if (refreshResponse.status !== 200) {
        throw new Error('Unable to refresh auth tokens');
      }

      const responseJson = await refreshResponse.json();
      const newToken = {
        access_token: responseJson.AuthenticationResult.AccessToken,
        id_token: responseJson.AuthenticationResult.IdToken,
        refresh_token,
      };
      this.setToken(newToken);

      return Promise.resolve(newToken);
    }

    return Promise.resolve({ access_token, id_token, refresh_token });
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

// Debug logging for auth flow investigation
const authLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, data };

  if (typeof window !== 'undefined') {
    (window as any).__TINA_AUTH_LOGS__ =
      (window as any).__TINA_AUTH_LOGS__ || [];
    (window as any).__TINA_AUTH_LOGS__.push(logEntry);
  }

  console.log(
    `[TINA-AUTH ${timestamp}]`,
    message,
    data !== undefined ? data : ''
  );
};

export class LocalAuthProvider extends AbstractAuthProvider {
  constructor() {
    super();
  }

  async authenticate() {
    authLog('LocalAuthProvider.authenticate() called - simulating popup flow');

    // Simulate the Tina Cloud popup authentication flow for local testing
    // This reproduces the bug where closing the popup leaves button stuck
    return new Promise((resolve, reject) => {
      const popupHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Local Auth (Test)</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            h1 { margin-bottom: 10px; }
            p { margin-bottom: 30px; opacity: 0.9; }
            button {
              padding: 15px 40px;
              font-size: 18px;
              border: none;
              border-radius: 8px;
              background: white;
              color: #667eea;
              cursor: pointer;
              font-weight: 600;
            }
            button:hover { transform: scale(1.05); }
            .hint {
              margin-top: 40px;
              padding: 20px;
              background: rgba(0,0,0,0.2);
              border-radius: 8px;
              max-width: 400px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Local Auth Simulation</h1>
          <p>This simulates the Tina Cloud login popup</p>
          <button onclick="completeLogin()">Complete Login</button>
          <div class="hint">
            <strong>To reproduce the bug:</strong><br>
            Close this window WITHOUT clicking the button.<br>
            The login button will stay stuck in loading state.
          </div>
          <script>
            function completeLogin() {
              window.opener.postMessage({
                source: 'localAuthComplete',
                success: true
              }, '*');
              window.close();
            }
          </script>
        </body>
        </html>
      `;

      // Open popup with the simulated auth page
      const popup = window.open(
        'about:blank',
        'LocalAuthPopup',
        'width=500,height=400,left=' +
          (window.screen.width / 2 - 250) +
          ',top=' +
          (window.screen.height / 2 - 200)
      );

      if (popup) {
        popup.document.write(popupHtml);
        popup.document.close();
        authLog('Popup window opened', { popupExists: true });
      } else {
        authLog('Popup was blocked by browser');
      }

      // Poll to detect if popup was closed without completing auth
      const pollInterval = setInterval(() => {
        authLog('Polling popup state', {
          popupExists: !!popup,
          popupClosed: popup?.closed,
        });

        if (popup && popup.closed) {
          authLog('Popup was closed by user (detected via polling)');
          clearInterval(pollInterval);
          // FIX: Reject the promise so the button resets
          window.removeEventListener('message', messageHandler);
          reject(new AuthenticationCancelledError('Popup was closed'));
          authLog('Promise rejected - auth cancelled');
        }
      }, 500);

      // Listen for successful auth message from popup
      const messageHandler = (e: MessageEvent) => {
        authLog('Message received', { source: e.data?.source });

        if (e.data?.source === 'localAuthComplete') {
          authLog('Local auth completed successfully');
          clearInterval(pollInterval);
          window.removeEventListener('message', messageHandler);

          localStorage.setItem(LOCAL_CLIENT_KEY, 'true');
          resolve({
            access_token: 'LOCAL',
            id_token: 'LOCAL',
            refresh_token: 'LOCAL',
          });
          authLog('Promise resolved with token');
        }
      };

      window.addEventListener('message', messageHandler);
      authLog('Message listener registered, waiting for auth completion...');
    });
  }

  async getUser(): Promise<boolean> {
    return localStorage.getItem(LOCAL_CLIENT_KEY) === 'true';
  }
  async getToken() {
    return Promise.resolve({ id_token: '' });
  }
  async logout() {
    localStorage.removeItem(LOCAL_CLIENT_KEY);
  }
}
