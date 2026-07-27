export const AUTH_TOKEN_KEY = 'tinacms-auth';
export const PKCE_STORAGE_KEY = 'tinacms-pkce';

export class AuthenticationCancelledError extends Error {
  constructor(message = 'Authentication cancelled') {
    super(message);
    this.name = 'AuthenticationCancelledError';
  }
}

function randomString(length: number = 40): string {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return result;
}

function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export const authenticate = async (
  clientId: string,
  identityApiUrl: string
): Promise<void> => {
  const codeVerifier = randomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = randomString();

  localStorage.setItem(
    PKCE_STORAGE_KEY,
    JSON.stringify({
      code_verifier: codeVerifier,
      state,
      client_id: clientId,
      identity_api_url: identityApiUrl,
    })
  );

  const redirectUri = window.location.origin + window.location.pathname;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  window.location.href = `${identityApiUrl}/v2/auth/tinacms?${params.toString()}`;
};
