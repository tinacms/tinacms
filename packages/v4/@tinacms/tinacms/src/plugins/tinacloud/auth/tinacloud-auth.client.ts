import type { z } from 'zod';
import { AuthError, type AuthSlice } from '../../../core/auth/contract';
import type { SliceSet } from '../../../core/plugin';
import { isRecord } from '../../../utils/is-record';
import {
  TINACLOUD_APP_URL,
  TINACLOUD_IDENTITY_URL,
  type TinaCloudOptions,
} from '../client';
import {
  TINACLOUD_LOGIN_EVENT,
  type TinaCloudLoginMessage,
  authConfigSchema,
  codeResponseSchema,
  currentUserSchema,
  currentUserUrl,
  jwtPayloadSchema,
  loginMessageSchema,
  projectRolesSchema,
  projectUrl,
  refreshResponseSchema,
} from './tinacloud-auth-types';
import { openCenteredPopup, waitForPopupMessage } from './popup';
import {
  type RedirectResult,
  clearPendingRedirect,
  readPendingRedirect,
  startRedirectSignIn,
} from './redirect';

const REFRESH_MARGIN_SECONDS = 120;

const POPUP_WIDTH = 1000;

const POPUP_HEIGHT = 700;

interface TinaCloudTokens {
  bearer: string;
  refreshToken: string;
  expiresAt: number;
}

const expiryOf = (accessToken: string): number => {
  const [, payload = ''] = accessToken.split('.');
  let claims: unknown;
  try {
    claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    throw new AuthError('invalid-response', 'The access token is not a JWT.');
  }
  const parsed = jwtPayloadSchema.safeParse(claims);
  if (!parsed.success) {
    throw new AuthError('invalid-response', 'The access token has no expiry.');
  }
  return parsed.data.exp;
};

const toTokens = (
  accessToken: string,
  idToken: string | undefined,
  refreshToken: string
): TinaCloudTokens => ({
  bearer: idToken ?? accessToken,
  refreshToken,
  expiresAt: expiryOf(accessToken),
});

const send = async (
  url: string,
  init: RequestInit
): Promise<{ response: Response; body: unknown }> => {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    if (cause instanceof Error) {
      throw new AuthError('network', cause.message);
    }
    throw new AuthError('network', String(cause));
  }
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
};

const fetchIdentity = async <Output>(
  url: string,
  bearer: string,
  schema: z.ZodType<Output, z.ZodTypeDef, unknown>
): Promise<Output> => {
  const { response, body } = await send(url, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (response.status === 401) {
    throw new AuthError('unauthenticated', 'TinaCloud refused the session.');
  }
  if (response.status === 403) {
    throw new AuthError(
      'no-access',
      'TinaCloud refused access to the project.'
    );
  }
  if (!response.ok) {
    throw new AuthError(
      'network',
      `TinaCloud responded with ${response.status}.`
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError(
      'invalid-response',
      `TinaCloud returned ${url} in an unknown format.`
    );
  }
  return parsed.data;
};

const refreshTokens = async (
  clientId: string,
  tokens: TinaCloudTokens
): Promise<TinaCloudTokens> => {
  const { response, body } = await send(
    `${TINACLOUD_IDENTITY_URL}/oauth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        client_id: clientId,
      }).toString(),
    }
  );
  if ([400, 401, 403].includes(response.status)) {
    throw new AuthError(
      'expired',
      `TinaCloud refused the refresh with ${response.status}.`
    );
  }
  if (!response.ok) {
    throw new AuthError(
      'network',
      `TinaCloud responded with ${response.status}.`
    );
  }
  const parsed = refreshResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError(
      'invalid-response',
      'TinaCloud returned the refreshed tokens in an unknown format.'
    );
  }
  const { access_token, id_token, refresh_token } = parsed.data;
  return toTokens(access_token, id_token, refresh_token ?? tokens.refreshToken);
};

// TinaCloud signs in through WorkOS once this is on, and only by redirect.
const fetchWorkosEnabled = async (): Promise<boolean> => {
  const { response, body } = await send(
    `${TINACLOUD_IDENTITY_URL}/v2/auth/config`,
    {}
  );
  if (!response.ok) {
    throw new AuthError(
      'network',
      `TinaCloud responded with ${response.status}.`
    );
  }
  const parsed = authConfigSchema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError(
      'invalid-response',
      'TinaCloud returned the auth config in an unknown format.'
    );
  }
  return parsed.data.workosEnabled;
};

const exchangeCode = async (
  clientId: string,
  { code, verifier, redirectUri }: RedirectResult
): Promise<TinaCloudTokens> => {
  const { response, body } = await send(
    `${TINACLOUD_IDENTITY_URL}/oauth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: verifier,
        redirect_uri: redirectUri,
        client_id: clientId,
      }).toString(),
    }
  );
  if ([400, 401, 403].includes(response.status)) {
    throw new AuthError(
      'unauthenticated',
      `TinaCloud refused the sign-in code with ${response.status}.`
    );
  }
  if (!response.ok) {
    throw new AuthError(
      'network',
      `TinaCloud responded with ${response.status}.`
    );
  }
  const parsed = codeResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError(
      'invalid-response',
      'TinaCloud returned the signed-in tokens in an unknown format.'
    );
  }
  const { access_token, id_token, refresh_token } = parsed.data;
  return toTokens(access_token, id_token, refresh_token);
};

const openLoginPopup = async (
  clientId: string
): Promise<TinaCloudLoginMessage> => {
  const url = new URL('/signin', TINACLOUD_APP_URL);
  url.search = new URLSearchParams({
    clientId,
    origin: window.location.origin,
  }).toString();
  const popup = openCenteredPopup(url, POPUP_WIDTH, POPUP_HEIGHT);
  return waitForPopupMessage(popup, {
    origin: new URL(TINACLOUD_APP_URL).origin,
    isCandidate: (data) =>
      isRecord(data) && data.source === TINACLOUD_LOGIN_EVENT,
    schema: loginMessageSchema,
  });
};

// StrictMode boots the admin twice, and the code TinaCloud returns works once,
// so both boots share one exchange, keyed by the state the sign-in sent.
const redirectExchanges = new Map<string, Promise<TinaCloudTokens>>();

const redirectTokens = (
  clientId: string
): Promise<TinaCloudTokens> | undefined => {
  const pending = readPendingRedirect(clientId);
  if (!pending) return undefined;
  const shared = redirectExchanges.get(pending.state);
  if (shared || !pending.outcome) return shared;
  const { outcome } = pending;
  let exchange: Promise<TinaCloudTokens>;
  if (outcome instanceof AuthError) {
    exchange = Promise.reject(outcome);
  } else {
    exchange = exchangeCode(clientId, outcome);
  }
  redirectExchanges.set(pending.state, exchange);
  exchange
    .finally(() => {
      redirectExchanges.delete(pending.state);
      clearPendingRedirect();
    })
    .catch(() => {});
  return exchange;
};

// ADR-023 §4: the tokens live in this closure only, never in slice state or storage.
export const createTinaCloudAuth = ({ clientId }: TinaCloudOptions) => {
  let tokens: TinaCloudTokens | undefined;
  let refreshing: Promise<TinaCloudTokens> | undefined;
  let set: SliceSet | undefined;
  let signOuts = 0;

  const signOut = () => {
    signOuts += 1;
    tokens = undefined;
    refreshing = undefined;
    set?.({ status: 'signed-out', user: null, error: undefined });
  };

  const freshTokens = async (
    current: TinaCloudTokens
  ): Promise<TinaCloudTokens | undefined> => {
    if (Date.now() / 1000 < current.expiresAt - REFRESH_MARGIN_SECONDS) {
      return current;
    }
    refreshing ??= refreshTokens(clientId, current);
    const pending = refreshing;
    try {
      const next = await pending;
      if (tokens === current) tokens = next;
      return tokens;
    } catch (cause) {
      if (tokens !== current) return tokens && freshTokens(tokens);
      if (cause instanceof AuthError && cause.code === 'expired') signOut();
      throw cause;
    } finally {
      if (refreshing === pending) refreshing = undefined;
    }
  };

  const tinaCloudToken = async (): Promise<string | undefined> => {
    if (!tokens) return undefined;
    return (await freshTokens(tokens))?.bearer;
  };

  const signInWith = async (next: TinaCloudTokens, signOutsAtStart: number) => {
    const { user, active } = await fetchIdentity(
      currentUserUrl(clientId),
      next.bearer,
      currentUserSchema
    );
    const roles = active
      ? await fetchIdentity(
          projectUrl(clientId),
          next.bearer,
          projectRolesSchema
        )
      : [];
    if (signOuts !== signOutsAtStart) return;
    refreshing = undefined;
    if (!active) {
      tokens = undefined;
      set?.({ status: 'forbidden', user });
      return;
    }
    tokens = next;
    set?.({ status: 'signed-in', user, roles });
  };

  // Fetched ahead of the click, so the popup opens within its user gesture.
  let workosEnabled: boolean | undefined;
  let fetchingWorkosEnabled: Promise<boolean> | undefined;
  const prefetchWorkosEnabled = () => {
    fetchingWorkosEnabled ??= fetchWorkosEnabled().then(
      (enabled) => {
        workosEnabled = enabled;
        return enabled;
      },
      (cause) => {
        fetchingWorkosEnabled = undefined;
        throw cause;
      }
    );
    return fetchingWorkosEnabled;
  };

  const login = async () => {
    const signOutsAtStart = signOuts;
    if (workosEnabled ?? (await prefetchWorkosEnabled())) {
      await startRedirectSignIn(clientId);
      // The page is leaving for TinaCloud; settling would re-enable the button.
      await new Promise<never>(() => {});
    }
    const message = await openLoginPopup(clientId);
    await signInWith(
      toTokens(message.access_token, message.id_token, message.refresh_token),
      signOutsAtStart
    );
  };

  const finishRedirectSignIn = async (exchange: Promise<TinaCloudTokens>) => {
    const signOutsAtStart = signOuts;
    try {
      await signInWith(await exchange, signOutsAtStart);
    } catch (cause) {
      console.error('[tinacms] TinaCloud sign-in failed:', cause);
      if (signOuts !== signOutsAtStart) return;
      tokens = undefined;
      if (cause instanceof AuthError) {
        set?.({ status: 'signed-out', user: null, error: cause });
      } else {
        set?.({
          status: 'signed-out',
          user: null,
          error: new AuthError('invalid-response', String(cause)),
        });
      }
    }
  };

  const logout = async () => signOut();

  const slice = (sliceSet: SliceSet): AuthSlice => {
    set = sliceSet;
    void prefetchWorkosEnabled().catch(() => {});
    const redirect = redirectTokens(clientId);
    if (redirect) void finishRedirectSignIn(redirect);
    return {
      status: redirect ? 'loading' : 'signed-out',
      user: null,
      getToken: tinaCloudToken,
      login,
      logout,
    };
  };

  return { slice };
};
