import { useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY, PKCE_STORAGE_KEY } from './authenticate';

export interface AuthRedirectParams {
  code: string | null;
  state: string | null;
  error: string | null;
}

export type AuthRedirectStatus =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'failed'; message: string };

export const NO_PROJECT_ACCESS_MESSAGE =
  'This account does not have access to this project. Log in with a different account.';
export const LOGIN_FAILED_MESSAGE =
  'We could not log you in. Please try again.';

class TokenExchangeError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'TokenExchangeError';
  }
}

const failureMessage = (err: unknown): string => {
  if (err instanceof TokenExchangeError && err.status === 403) {
    return NO_PROJECT_ACCESS_MESSAGE;
  }
  return LOGIN_FAILED_MESSAGE;
};

export const useTinaAuthRedirect = (
  params: AuthRedirectParams,
  enabled = true
): AuthRedirectStatus => {
  const { code, state, error } = params;
  const [result, setResult] = useState<AuthRedirectStatus>(() =>
    enabled && (error || (code && state))
      ? { status: 'pending' }
      : { status: 'idle' }
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const fail = (message: string) => {
      window.history.replaceState({}, '', window.location.pathname);
      setResult({ status: 'failed', message });
    };

    if (error) {
      console.error('Auth error:', error);
      fail(LOGIN_FAILED_MESSAGE);
      return;
    }

    if (!code || !state) {
      return;
    }

    const pkceData = JSON.parse(
      localStorage.getItem(PKCE_STORAGE_KEY) || 'null'
    );
    if (!pkceData) {
      console.error('No PKCE data found in localStorage');
      fail(LOGIN_FAILED_MESSAGE);
      return;
    }

    if (pkceData.state !== state) {
      console.error('State mismatch - possible CSRF attack');
      localStorage.removeItem(PKCE_STORAGE_KEY);
      fail(LOGIN_FAILED_MESSAGE);
      return;
    }

    const { code_verifier, client_id, identity_api_url } = pkceData;
    const redirectUri = window.location.origin + window.location.pathname;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id,
      code_verifier,
    });

    fetch(`${identity_api_url}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new TokenExchangeError(
            data.message ||
              data.error ||
              `Token exchange failed: ${res.status}`,
            res.status
          );
        }
        if (data.error) {
          throw new Error(data.error);
        }
        return data;
      })
      .then((data) => {
        localStorage.setItem(
          AUTH_TOKEN_KEY,
          JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          })
        );

        localStorage.removeItem(PKCE_STORAGE_KEY);
        window.history.replaceState({}, '', window.location.pathname);
        window.location.reload();
      })
      .catch((err) => {
        console.error('Token exchange failed:', err);
        localStorage.removeItem(PKCE_STORAGE_KEY);
        fail(failureMessage(err));
      });
  }, [code, state, error, enabled]);

  return result;
};
