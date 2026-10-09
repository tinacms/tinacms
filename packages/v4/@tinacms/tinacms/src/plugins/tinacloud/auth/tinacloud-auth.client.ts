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
  currentUserSchema,
  currentUserUrl,
  jwtPayloadSchema,
  loginMessageSchema,
  refreshResponseSchema,
} from './tinacloud-auth-types';
import { openCenteredPopup, waitForPopupMessage } from './popup';

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

const fetchUser = async (clientId: string, bearer: string) => {
  const { response, body } = await send(currentUserUrl(clientId), {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(
      'unauthenticated',
      `TinaCloud refused the session with ${response.status}.`
    );
  }
  if (!response.ok) {
    throw new AuthError(
      'network',
      `TinaCloud responded with ${response.status}.`
    );
  }
  const parsed = currentUserSchema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError(
      'invalid-response',
      'TinaCloud returned the user in an unknown format.'
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
    set?.({ status: 'signed-out', user: null });
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
      if (
        tokens === current &&
        cause instanceof AuthError &&
        cause.code === 'expired'
      ) {
        signOut();
      }
      throw cause;
    } finally {
      if (refreshing === pending) refreshing = undefined;
    }
  };

  const getToken = async (): Promise<string | undefined> => {
    if (!tokens) return undefined;
    return (await freshTokens(tokens))?.bearer;
  };

  const login = async () => {
    const signOutsAtStart = signOuts;
    const message = await openLoginPopup(clientId);
    const next = toTokens(
      message.access_token,
      message.id_token,
      message.refresh_token
    );
    const { user, roles, active } = await fetchUser(clientId, next.bearer);
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

  const logout = async () => signOut();

  const slice = (sliceSet: SliceSet): AuthSlice => {
    set = sliceSet;
    return {
      status: 'signed-out',
      user: null,
      getToken: async () => undefined,
      login,
      logout,
    };
  };

  return { slice, getToken };
};
