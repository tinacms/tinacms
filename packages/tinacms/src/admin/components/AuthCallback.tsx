'use client';

import * as React from 'react';
import { AUTH_TOKEN_KEY } from '../../auth/authenticate';

export default function AuthCallback({
  clientId,
  identityApiUrl,
}: {
  clientId: string;
  identityApiUrl: string;
}) {
  console.log('AuthCallback', clientId, identityApiUrl);
  const [code, setCode] = React.useState<string | null>(null);
  const [state, setState] = React.useState<string | null>(null);
  const [tokenResponse, setTokenResponse] = React.useState<any>(null);
  const [app, setApp] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      setCode(queryParams.get('code'));
      setState(queryParams.get('state'));
    }
  }, []);

  React.useEffect(() => {
    if (code && state) {
      if (localStorage.getItem('code_verifier')) {
        const origin = `${window.location.protocol}//${window.location.host}`;
        const redirectUri = encodeURIComponent(
          `${origin}/admin#/auth/callback`
        );
        // Send the code and code verifier to your backend for token exchange
        fetch(`${identityApiUrl}/oauth2/${clientId}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId || '',
            code_verifier: localStorage.getItem('code_verifier'),
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Token exchange response:', data);
            setTokenResponse(data);
          })
          .catch((error) => {
            console.error('Error during token exchange:', error);
          });
      }
    }
  }, [code, state]);

  React.useEffect(() => {
    localStorage.setItem(
      AUTH_TOKEN_KEY,
      JSON.stringify(tokenResponse, null, 2)
    );
  }, [tokenResponse]);
  React.useEffect(() => {
    fetch(`${identityApiUrl}/v2/apps/${clientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + tokenResponse?.access_token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setApp(data);
      })
      .catch((error) => {
        console.error('Error fetching apps:', error);
      });
  }, [tokenResponse]);

  return (
    <div>
      {code && (
        <div>
          Code: <pre>{code}</pre>
          <br />
        </div>
      )}
      {state && (
        <div>
          State: <pre>{state}</pre>
          <br />
        </div>
      )}
      {tokenResponse && (
        <div>
          <h2>Token Response:</h2>
          <pre>{tokenResponse.access_token}</pre>
          <br />
        </div>
      )}
      <div>
        {app && (
          <div>
            <h2>Project Name: {app.name}</h2>
            <p>
              Project ID: <pre>{app.id}</pre>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
