import { z } from 'zod';
import { AuthError } from '../../../core/auth/contract';
import { TINACLOUD_IDENTITY_URL } from '../client';

// The verifier only has to outlive the round trip to TinaCloud, so it stays in
// this tab's sessionStorage. No token is ever stored.
const PKCE_STORAGE_KEY = 'tinacms-tinacloud-pkce';

const pendingSignInSchema = z.object({
  clientId: z.string(),
  verifier: z.string(),
  state: z.string(),
  search: z.string(),
  hash: z.string(),
});

export interface RedirectResult {
  code: string;
  verifier: string;
  redirectUri: string;
}

/**
 * A redirect sign-in this tab started. `outcome` is set when the page has just
 * come back from TinaCloud, and holds the code to exchange or why it failed.
 */
export interface PendingRedirect {
  state: string;
  outcome?: RedirectResult | AuthError;
}

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const randomToken = (byteLength: number) =>
  base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));

const challengeOf = async (verifier: string) =>
  base64Url(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
    )
  );

const redirectUri = () => window.location.origin + window.location.pathname;

const readPendingSignIn = () => {
  try {
    const parsed = pendingSignInSchema.safeParse(
      JSON.parse(sessionStorage.getItem(PKCE_STORAGE_KEY) ?? 'null')
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
};

export const clearPendingRedirect = () => {
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
};

/** Sends the browser to TinaCloud's WorkOS sign-in, which returns with `?code&state`. */
export const startRedirectSignIn = async (clientId: string) => {
  const verifier = randomToken(64);
  const state = randomToken(32);
  const { search, hash } = window.location;
  sessionStorage.setItem(
    PKCE_STORAGE_KEY,
    JSON.stringify({ clientId, verifier, state, search, hash })
  );
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri(),
    code_challenge: await challengeOf(verifier),
    code_challenge_method: 'S256',
    state,
  });
  window.location.assign(`${TINACLOUD_IDENTITY_URL}/v2/auth/tinacms?${params}`);
};

/** Reads the redirect sign-in this tab started, and restores the URL it left from. */
export const readPendingRedirect = (
  clientId: string
): PendingRedirect | undefined => {
  const pending = readPendingSignIn();
  if (!pending || pending.clientId !== clientId) return undefined;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  if (!code && !error) return { state: pending.state };
  window.history.replaceState(
    null,
    '',
    redirectUri() + pending.search + pending.hash
  );
  if (error) {
    return {
      state: pending.state,
      outcome: new AuthError(
        'unauthenticated',
        `TinaCloud returned the sign-in with ${error}.`
      ),
    };
  }
  if (!code || params.get('state') !== pending.state) {
    return {
      state: pending.state,
      outcome: new AuthError(
        'unauthenticated',
        'The sign-in returned with a state that this tab did not send.'
      ),
    };
  }
  return {
    state: pending.state,
    outcome: { code, verifier: pending.verifier, redirectUri: redirectUri() },
  };
};
