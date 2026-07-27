import { useEffect } from 'react';
import { AUTH_TOKEN_KEY, PKCE_STORAGE_KEY } from './authenticate';

export interface AuthRedirectParams {
  code: string | null;
  state: string | null;
  error: string | null;
}

export const useTinaAuthRedirect = (params: AuthRedirectParams) => {
  const { code, state, error } = params;

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
      window.history.replaceState({}, '', window.location.pathname);
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
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (pkceData.state !== state) {
      console.error('State mismatch - possible CSRF attack');
      localStorage.removeItem(PKCE_STORAGE_KEY);
      window.history.replaceState({}, '', window.location.pathname);
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
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

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
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, [code, state, error]);
};
