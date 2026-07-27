import { TokenObject } from '@tinacms/schema-tools';
import popupWindow from './popupWindow';

export const AUTH_TOKEN_KEY = 'tinacms-auth';
export const PKCE_STORAGE_KEY = 'tinacms-pkce';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';

export class AuthenticationCancelledError extends Error {
  constructor(message = 'Authentication cancelled') {
    super(message);
    this.name = 'AuthenticationCancelledError';
  }
}

let workosEnabledPromise: Promise<boolean> | null = null;

export async function getWorkosEnabled(
  identityApiUrl: string
): Promise<boolean> {
  if (!workosEnabledPromise) {
    workosEnabledPromise = (async () => {
      const res = await fetch(`${identityApiUrl}/v2/auth/config`);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch auth config: ${res.status} ${res.statusText}`
        );
      }

      const data: { workosEnabled?: boolean } = await res.json();
      if (typeof data.workosEnabled !== 'boolean') {
        throw new Error('Invalid auth config response');
      }

      return data.workosEnabled;
    })();
  }

  return workosEnabledPromise;
}

export function resetWorkosEnabledCache(): void {
  workosEnabledPromise = null;
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
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export function authenticatePopup(
  clientId: string,
  frontendUrl: string
): Promise<TokenObject> {
  return new Promise((resolve, reject) => {
    const origin = `${window.location.protocol}//${window.location.host}`;
    const expectedOrigin = new URL(frontendUrl).origin;

    const authTab = popupWindow(
      `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
      '_blank',
      window,
      1000,
      700
    );

    if (!authTab) {
      reject(
        new Error(
          'Popup was blocked by browser. Please allow popups for this site.'
        )
      );
      return;
    }

    const cleanup = () => {
      clearInterval(pollInterval);
      window.removeEventListener('message', messageHandler);
    };

    const messageHandler = (e: MessageEvent) => {
      if (e.origin !== expectedOrigin || e.source !== authTab) {
        return;
      }

      if (e.data.source === TINA_LOGIN_EVENT) {
        cleanup();

        if (authTab) {
          authTab.close();
        }
        resolve({
          id_token: e.data.id_token,
          access_token: e.data.access_token,
          refresh_token: e.data.refresh_token,
        });
      }
    };

    const pollInterval = setInterval(() => {
      if (authTab.closed) {
        cleanup();
        reject(new AuthenticationCancelledError('Popup was closed'));
      }
    }, 500);

    window.addEventListener('message', messageHandler);
  });
}

export async function authenticatePKCE(
  clientId: string,
  identityApiUrl: string
): Promise<void> {
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
}

export async function authenticate(
  clientId: string,
  identityApiUrl: string,
  frontendUrl: string
): Promise<TokenObject | void> {
  const workosEnabled = await getWorkosEnabled(identityApiUrl);
  if (workosEnabled) {
    await authenticatePKCE(clientId, identityApiUrl);
  } else {
    return authenticatePopup(clientId, frontendUrl);
  }
}
