import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthError } from '../../../core/auth/contract';
import type { SliceState } from '../../../core/plugin';
import {
  jwtExpiringIn,
  loginTokens,
  postMessageFrom,
  stubLoginPopup,
  tinaCloudIdentity,
  tinaCloudUser,
} from '../../../test/tinacloud-login';
import { TINACLOUD_IDENTITY_URL } from '../client';
import { createTinaCloudAuth } from './tinacloud-auth.client';

const CURRENT_USER_URL = `${TINACLOUD_IDENTITY_URL}/v2/apps/abc/currentUser`;

const PROJECT_URL = `${TINACLOUD_IDENTITY_URL}/v2/apps/abc`;

const AUTH_CONFIG_URL = `${TINACLOUD_IDENTITY_URL}/v2/auth/config`;

const TOKEN_URL = `${TINACLOUD_IDENTITY_URL}/oauth/token`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const stubFetch = (
  respond: (url: string, init?: RequestInit) => Response | Promise<Response>
) => {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) =>
    respond(url, init)
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const boot = () => {
  const auth = createTinaCloudAuth({ clientId: 'abc' });
  const state: SliceState = {};
  const slice = auth.slice((partial) => {
    Object.assign(
      state,
      typeof partial === 'function' ? partial(state) : partial
    );
  });
  Object.assign(state, slice);
  return { slice, state, tinaCloudToken: slice.getToken };
};

const signIn = async (tokens = loginTokens()) => {
  const { complete } = stubLoginPopup();
  const booted = boot();
  const login = booted.slice.login();
  complete(tokens);
  await login;
  return booted;
};

beforeEach(() => {
  stubFetch((url) => tinaCloudIdentity(url));
});

afterEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('TinaCloud auth slice', () => {
  it('starts signed out with no token', async () => {
    const { state, tinaCloudToken } = boot();
    expect(state).toMatchObject({ status: 'signed-out', user: null });
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it('signs in through the TinaCloud popup and keeps the token in memory', async () => {
    const fetchMock = stubFetch((url) => tinaCloudIdentity(url));
    const { popup, open, complete } = stubLoginPopup();
    const { slice, state, tinaCloudToken } = boot();

    const login = slice.login();
    complete();
    await login;

    const [url] = open.mock.calls[0];
    expect(String(url)).toBe(
      `https://app.tina.io/signin?clientId=abc&origin=${encodeURIComponent(window.location.origin)}`
    );
    expect(popup.close).toHaveBeenCalled();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      AUTH_CONFIG_URL,
      CURRENT_USER_URL,
      PROJECT_URL,
    ]);
    expect(
      new Headers(fetchMock.mock.calls[1][1]?.headers).get('Authorization')
    ).toBe('Bearer id-token');
    expect(state).toMatchObject({
      status: 'signed-in',
      user: { id: 'ada', name: 'Ada Lovelace', email: 'ada@example.com' },
      roles: ['admin'],
    });
    expect(JSON.stringify(state)).not.toContain('id-token');
    expect(localStorage.length).toBe(0);
    expect(await tinaCloudToken()).toBe('id-token');
  });

  it('ignores messages from another origin or another window', async () => {
    const fetchMock = stubFetch((url) => tinaCloudIdentity(url));
    const { popup, opened, complete } = stubLoginPopup();
    const { slice, state } = boot();

    const login = slice.login();
    await opened();
    postMessageFrom(popup, loginTokens(), 'https://evil.example');
    postMessageFrom(window, loginTokens());
    postMessageFrom(popup, { ...loginTokens(), source: 'other' });
    expect(popup.close).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledOnce();

    complete();
    await login;
    expect(state.status).toBe('signed-in');
  });

  it('rejects with unauthenticated when the editor closes the popup', async () => {
    vi.useFakeTimers();
    const { popup, opened } = stubLoginPopup();
    const { slice, state } = boot();

    const login = slice.login();
    await opened();
    const assertion = expect(login).rejects.toMatchObject({
      code: 'unauthenticated',
      detail: expect.stringContaining('closed'),
    });
    popup.closed = true;
    await vi.advanceTimersByTimeAsync(500);
    await assertion;
    expect(state.status).toBe('signed-out');
  });

  it('rejects with popup-blocked when the browser blocks the popup', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    await expect(boot().slice.login()).rejects.toMatchObject({
      code: 'popup-blocked',
    });
  });

  it('rejects tokens in an unknown format', async () => {
    const { complete } = stubLoginPopup();
    const login = boot().slice.login();
    complete({ source: 'tinaCloudLogin', access_token: 42 });
    await expect(login).rejects.toMatchObject({ code: 'invalid-response' });
  });

  it('rejects an access token that is not a JWT', async () => {
    const { complete } = stubLoginPopup();
    const login = boot().slice.login();
    complete({ ...loginTokens(), access_token: 'opaque' });
    await expect(login).rejects.toMatchObject({ code: 'invalid-response' });
  });

  it.each([
    ['unauthenticated', () => json({ message: 'nope' }, 401)],
    ['no-access', () => json({ message: 'no access' }, 403)],
    ['network', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['network', () => json({}, 503)],
    ['invalid-response', () => json({ fullName: 'No Id' })],
    ['invalid-response', () => new Response('<html>')],
  ])('maps a failed user lookup to %s', async (code, respond) => {
    stubFetch((url) =>
      url === AUTH_CONFIG_URL ? tinaCloudIdentity(url) : respond()
    );
    const { complete } = stubLoginPopup();
    const { slice, state, tinaCloudToken } = boot();
    const login = slice.login();
    complete();
    const failure = await login.catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(AuthError);
    expect(failure).toMatchObject({ code });
    expect(state.status).toBe('signed-out');
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it.each([
    ['owner', 'admin'],
    ['Admin', 'admin'],
    ['', 'admin'],
    ['editor', 'editor'],
    ['user', 'editor'],
  ])('gives the project role "%s" the %s role', async (role, expected) => {
    stubFetch((url) => tinaCloudIdentity(url, { role }));
    const { state } = await signIn();
    expect(state).toMatchObject({ status: 'signed-in', roles: [expected] });
  });

  it('signs in a user whose name and email TinaCloud sends empty', async () => {
    const user = { ...tinaCloudUser, fullName: '', email: '' };
    stubFetch((url) => tinaCloudIdentity(url, { user }));
    const { state } = await signIn();
    expect(state).toMatchObject({
      status: 'signed-in',
      user: { id: 'ada', name: undefined, email: undefined },
    });
  });

  it('fails a project lookup TinaCloud refuses, with no token kept', async () => {
    stubFetch((url) =>
      url === PROJECT_URL ? json({}, 403) : tinaCloudIdentity(url)
    );
    const { complete } = stubLoginPopup();
    const { slice, state, tinaCloudToken } = boot();
    const login = slice.login();
    complete();
    await expect(login).rejects.toMatchObject({ code: 'no-access' });
    expect(state.status).toBe('signed-out');
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it('sets forbidden, with no token, for an account that is not verified', async () => {
    const fetchMock = stubFetch((url) =>
      tinaCloudIdentity(url, { user: { ...tinaCloudUser, verified: false } })
    );
    const { complete } = stubLoginPopup();
    const { slice, state, tinaCloudToken } = boot();
    const login = slice.login();
    complete();
    await login;
    expect(state).toMatchObject({ status: 'forbidden', user: { id: 'ada' } });
    expect(await tinaCloudToken()).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalledWith(PROJECT_URL, expect.anything());
  });

  it('refreshes the token once when it expires within two minutes', async () => {
    const fetchMock = stubFetch((url) =>
      url === TOKEN_URL
        ? json({ access_token: jwtExpiringIn(3600), id_token: 'id-token-2' })
        : tinaCloudIdentity(url)
    );
    const { tinaCloudToken } = await signIn(loginTokens(60));

    expect(await Promise.all([tinaCloudToken(), tinaCloudToken()])).toEqual([
      'id-token-2',
      'id-token-2',
    ]);
    const refreshes = fetchMock.mock.calls.filter(([url]) => url === TOKEN_URL);
    expect(refreshes).toHaveLength(1);
    expect(
      Object.fromEntries(new URLSearchParams(String(refreshes[0][1]?.body)))
    ).toEqual({
      grant_type: 'refresh_token',
      refresh_token: 'refresh-token',
      client_id: 'abc',
    });
    expect(await tinaCloudToken()).toBe('id-token-2');
    expect(
      fetchMock.mock.calls.filter(([url]) => url === TOKEN_URL)
    ).toHaveLength(1);
  });

  it('does not refresh a token that is far from expiry', async () => {
    const fetchMock = stubFetch((url) => tinaCloudIdentity(url));
    const { tinaCloudToken } = await signIn();
    expect(await tinaCloudToken()).toBe('id-token');
    expect(fetchMock).not.toHaveBeenCalledWith(TOKEN_URL, expect.anything());
  });

  it('signs out with expired when TinaCloud refuses the refresh', async () => {
    stubFetch((url) =>
      url === TOKEN_URL
        ? json({ error: 'invalid_grant' }, 400)
        : tinaCloudIdentity(url)
    );
    const { state, tinaCloudToken } = await signIn(loginTokens(60));
    await expect(tinaCloudToken()).rejects.toMatchObject({ code: 'expired' });
    expect(state).toMatchObject({ status: 'signed-out', user: null });
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it('keeps the session when the refresh cannot reach TinaCloud', async () => {
    let online = false;
    stubFetch((url) => {
      if (url !== TOKEN_URL) return tinaCloudIdentity(url);
      if (!online) return Promise.reject(new TypeError('Failed to fetch'));
      return json({
        access_token: jwtExpiringIn(3600),
        id_token: 'id-token-2',
      });
    });
    const { state, tinaCloudToken } = await signIn(loginTokens(60));
    await expect(tinaCloudToken()).rejects.toMatchObject({ code: 'network' });
    expect(state.status).toBe('signed-in');
    online = true;
    expect(await tinaCloudToken()).toBe('id-token-2');
  });

  it('rejects refreshed tokens in an unknown format', async () => {
    stubFetch((url) =>
      url === TOKEN_URL ? json({ id_token: 'x' }) : tinaCloudIdentity(url)
    );
    const { tinaCloudToken } = await signIn(loginTokens(60));
    await expect(tinaCloudToken()).rejects.toMatchObject({
      code: 'invalid-response',
    });
  });

  it('falls back to the access token and keeps the refresh token when a refresh leaves them out', async () => {
    const accessToken = jwtExpiringIn(60, 'second');
    const fetchMock = stubFetch((url) =>
      url === TOKEN_URL
        ? json({ access_token: accessToken })
        : tinaCloudIdentity(url)
    );
    const { tinaCloudToken } = await signIn(loginTokens(60));
    expect(await tinaCloudToken()).toBe(accessToken);
    await tinaCloudToken();
    const refreshes = fetchMock.mock.calls.filter(([url]) => url === TOKEN_URL);
    expect(
      new URLSearchParams(String(refreshes[1][1]?.body)).get('refresh_token')
    ).toBe('refresh-token');
  });

  it('keeps the session when TinaCloud rate-limits the refresh', async () => {
    stubFetch((url) =>
      url === TOKEN_URL ? json({}, 429) : tinaCloudIdentity(url)
    );
    const { state, tinaCloudToken } = await signIn(loginTokens(60));
    await expect(tinaCloudToken()).rejects.toMatchObject({ code: 'network' });
    expect(state.status).toBe('signed-in');
  });

  it('stays signed out when logout runs during a pending login', async () => {
    let finishLookup = (_response: Response) => {};
    stubFetch((url) =>
      url === CURRENT_USER_URL
        ? new Promise<Response>((resolve) => {
            finishLookup = resolve;
          })
        : tinaCloudIdentity(url)
    );
    const { complete } = stubLoginPopup();
    const { slice, state, tinaCloudToken } = boot();
    const login = slice.login();
    complete();
    await vi.waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(CURRENT_USER_URL, expect.anything())
    );
    await slice.logout();
    finishLookup(json(tinaCloudUser));
    await login;
    expect(state.status).toBe('signed-out');
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it('drops a refresh that lands after logout', async () => {
    let finishRefresh = (_response: Response) => {};
    stubFetch((url) =>
      url === TOKEN_URL
        ? new Promise<Response>((resolve) => {
            finishRefresh = resolve;
          })
        : tinaCloudIdentity(url)
    );
    const { slice, tinaCloudToken } = await signIn(loginTokens(60));
    const pending = tinaCloudToken();
    await vi.waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(TOKEN_URL, expect.anything())
    );
    await slice.logout();
    finishRefresh(
      json({ access_token: jwtExpiringIn(3600), id_token: 'late' })
    );
    expect(await pending).toBeUndefined();
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it('uses the new session when an old refresh fails after a re-login', async () => {
    let failRefresh = (_response: Response) => {};
    stubFetch((url) =>
      url === TOKEN_URL
        ? new Promise<Response>((resolve) => {
            failRefresh = resolve;
          })
        : tinaCloudIdentity(url)
    );
    const { slice, tinaCloudToken } = await signIn(loginTokens(60));
    const pending = tinaCloudToken();
    await vi.waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(TOKEN_URL, expect.anything())
    );
    await slice.logout();
    const { complete } = stubLoginPopup();
    const login = slice.login();
    complete({ ...loginTokens(), id_token: 'id-token-2' });
    await login;
    failRefresh(json({ error: 'invalid_grant' }, 400));
    expect(await pending).toBe('id-token-2');
  });

  it('forgets the token on logout', async () => {
    stubFetch((url) => tinaCloudIdentity(url));
    const { slice, state, tinaCloudToken } = await signIn();
    await slice.logout();
    expect(state).toMatchObject({ status: 'signed-out', user: null });
    expect(await tinaCloudToken()).toBeUndefined();
  });
});

describe('TinaCloud redirect sign-in', () => {
  const PKCE_KEY = 'tinacms-tinacloud-pkce';

  const returnFromTinaCloud = (
    query: string,
    pending: Record<string, string> | null = {
      clientId: 'abc',
      verifier: 'the-verifier',
      state: 'the-state',
      search: '?site=1',
      hash: '#/collections/posts',
    }
  ) => {
    if (pending) sessionStorage.setItem(PKCE_KEY, JSON.stringify(pending));
    window.history.replaceState(null, '', `/admin/?${query}`);
  };

  const currentPath = () =>
    `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const signedInTokens = (accessToken = jwtExpiringIn(3600)) =>
    json({ access_token: accessToken, refresh_token: 'refresh' });

  it('redirects to the WorkOS sign-in instead of opening the popup', async () => {
    stubFetch((url) => tinaCloudIdentity(url, { workosEnabled: true }));
    const open = vi.spyOn(window, 'open');
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => {});
    window.history.replaceState(null, '', '/admin/?site=1#/collections/posts');

    void boot().slice.login();
    await vi.waitFor(() => expect(assign).toHaveBeenCalled());

    expect(open).not.toHaveBeenCalled();
    const target = new URL(String(assign.mock.calls[0][0]));
    expect(target.origin + target.pathname).toBe(
      `${TINACLOUD_IDENTITY_URL}/v2/auth/tinacms`
    );
    const pending = JSON.parse(sessionStorage.getItem(PKCE_KEY) ?? '{}');
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(pending.verifier)
    );
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(Object.fromEntries(target.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'abc',
      redirect_uri: `${window.location.origin}/admin/`,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: pending.state,
    });
    expect(pending).toMatchObject({
      clientId: 'abc',
      search: '?site=1',
      hash: '#/collections/posts',
    });
  });

  it('signs in with the code TinaCloud returns, keeping no token in storage', async () => {
    const accessToken = jwtExpiringIn(3600);
    const fetchMock = stubFetch((url) =>
      url === TOKEN_URL ? signedInTokens(accessToken) : tinaCloudIdentity(url)
    );
    returnFromTinaCloud('code=the-code&state=the-state');

    const { state, tinaCloudToken } = boot();

    expect(state.status).toBe('loading');
    expect(currentPath()).toBe('/admin/?site=1#/collections/posts');
    await vi.waitFor(() => expect(state.status).toBe('signed-in'));
    const exchange = fetchMock.mock.calls.find(([url]) => url === TOKEN_URL);
    expect(
      Object.fromEntries(new URLSearchParams(String(exchange?.[1]?.body)))
    ).toEqual({
      grant_type: 'authorization_code',
      code: 'the-code',
      code_verifier: 'the-verifier',
      redirect_uri: `${window.location.origin}/admin/`,
      client_id: 'abc',
    });
    expect(state).toMatchObject({ user: { id: 'ada' }, roles: ['admin'] });
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
    expect(await tinaCloudToken()).toBe(accessToken);
  });

  it('shares one code exchange when StrictMode boots the admin twice', async () => {
    const fetchMock = stubFetch((url) =>
      url === TOKEN_URL ? signedInTokens() : tinaCloudIdentity(url)
    );
    returnFromTinaCloud('code=the-code&state=the-state');

    const discarded = boot();
    const { state } = boot();

    expect(state.status).toBe('loading');
    await vi.waitFor(() => expect(state.status).toBe('signed-in'));
    expect(discarded.state.status).toBe('signed-in');
    expect(
      fetchMock.mock.calls.filter(([url]) => url === TOKEN_URL)
    ).toHaveLength(1);
    expect(sessionStorage.length).toBe(0);
  });

  it.each([
    ['a state this tab did not send', 'code=the-code&state=forged'],
    ['an error', 'error=access_denied&state=the-state'],
  ])('shows why when the sign-in returns with %s', async (_case, query) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = stubFetch((url) => tinaCloudIdentity(url));
    returnFromTinaCloud(query);

    const { state } = boot();

    await vi.waitFor(() =>
      expect(state).toMatchObject({
        status: 'signed-out',
        error: { code: 'unauthenticated' },
      })
    );
    expect(currentPath()).toBe('/admin/?site=1#/collections/posts');
    expect(fetchMock).not.toHaveBeenCalledWith(TOKEN_URL, expect.anything());
  });

  it('shows why when TinaCloud refuses the code', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubFetch((url) =>
      url === TOKEN_URL ? json({}, 401) : tinaCloudIdentity(url)
    );
    returnFromTinaCloud('code=the-code&state=the-state');

    const { state, tinaCloudToken } = boot();

    await vi.waitFor(() =>
      expect(state).toMatchObject({
        status: 'signed-out',
        error: { code: 'unauthenticated' },
      })
    );
    expect(await tinaCloudToken()).toBeUndefined();
  });

  it('leaves a code that this tab did not ask for alone', () => {
    returnFromTinaCloud('code=site-code&state=x', null);
    const { state } = boot();
    expect(state.status).toBe('signed-out');
    expect(window.location.search).toBe('?code=site-code&state=x');
  });
});
