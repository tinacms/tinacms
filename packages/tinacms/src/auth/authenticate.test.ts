import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authenticate,
  AUTH_TOKEN_KEY,
  AuthenticationCancelledError,
  getWorkosEnabled,
  resetWorkosEnabledCache,
  PKCE_STORAGE_KEY,
} from './authenticate';

vi.mock('./popupWindow', () => ({
  default: vi.fn(),
}));

import popupWindow from './popupWindow';

const CLIENT_ID = 'test-client-id';
const IDENTITY_API_URL = 'https://api.example';
const FRONTEND_URL = 'https://frontend.example';
const EXPECTED_ORIGIN = 'https://frontend.example';
const UNTRUSTED_ORIGIN = 'https://untrusted.example';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';

const validData = {
  source: TINA_LOGIN_EVENT,
  id_token: 'id-token',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
};

const makeAuthTab = () => ({
  close: vi.fn(),
  closed: false,
});

let messageListeners: Array<(e: MessageEvent) => void>;
let authTab: ReturnType<typeof makeAuthTab>;

const dispatch = (e: Partial<MessageEvent>) => {
  for (const listener of [...messageListeners]) {
    listener(e as MessageEvent);
  }
};

let originalHref: string;
let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  originalHref = window.location.href;
  Object.defineProperty(window, 'location', {
    value: new URL('https://mysite.com/admin'),
    writable: true,
  });
  localStorage.clear();

  vi.useFakeTimers();
  messageListeners = [];
  authTab = makeAuthTab();

  vi.mocked(popupWindow).mockReturnValue(authTab as unknown as Window);

  vi.spyOn(window, 'addEventListener').mockImplementation(
    (type: string, cb: EventListenerOrEventListenerObject) => {
      if (type === 'message') {
        messageListeners.push(cb as (e: MessageEvent) => void);
      }
    }
  );
  vi.spyOn(window, 'removeEventListener').mockImplementation(
    (type: string, cb: EventListenerOrEventListenerObject) => {
      if (type === 'message') {
        messageListeners = messageListeners.filter((l) => l !== cb);
      }
    }
  );

  resetWorkosEnabledCache();
  fetchSpy = vi.fn();
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: new URL(originalHref),
    writable: true,
  });
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Set up rejection handler before advancing timers to avoid unhandled rejection warning.
const settleViaPopupClose = async (result: Promise<unknown>) => {
  const expectation = expect(result).rejects.toThrowError(
    new AuthenticationCancelledError('Popup was closed')
  );
  authTab.closed = true;
  await vi.advanceTimersByTimeAsync(600);
  await expectation;
};

describe('getWorkosEnabled', () => {
  it('returns true when workosEnabled is true', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workosEnabled: true }),
    });

    const result = await getWorkosEnabled(IDENTITY_API_URL);
    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(`${IDENTITY_API_URL}/v2/auth/config`);
  });

  it('returns false when workosEnabled is false', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workosEnabled: false }),
    });

    const result = await getWorkosEnabled(IDENTITY_API_URL);
    expect(result).toBe(false);
  });

  it('caches the result across calls', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workosEnabled: true }),
    });

    await getWorkosEnabled(IDENTITY_API_URL);
    await getWorkosEnabled(IDENTITY_API_URL);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('throws on non-200 response', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(getWorkosEnabled(IDENTITY_API_URL)).rejects.toThrow(
      'Failed to fetch auth config: 500 Internal Server Error'
    );
  });

  it('throws when workosEnabled is missing from response', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await expect(getWorkosEnabled(IDENTITY_API_URL)).rejects.toThrow(
      'Invalid auth config response'
    );
  });
});

describe('authenticate — WorkOS enabled (PKCE redirect)', () => {
  beforeEach(() => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workosEnabled: true }),
    });
  });

  it('stores PKCE data in localStorage', async () => {
    authenticate(CLIENT_ID, IDENTITY_API_URL, FRONTEND_URL);

    await vi.waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(PKCE_STORAGE_KEY));
      expect(stored).toBeTruthy();
      expect(stored.client_id).toBe(CLIENT_ID);
      expect(stored.identity_api_url).toBe(IDENTITY_API_URL);
      expect(stored.code_verifier).toHaveLength(128);
      expect(stored.state).toBeTruthy();
    });
  });

  it('redirects to /v2/auth/tinacms', async () => {
    await authenticate(CLIENT_ID, IDENTITY_API_URL, FRONTEND_URL);

    const redirectUrl = new URL(window.location.href);
    expect(redirectUrl.origin + redirectUrl.pathname).toBe(
      `${IDENTITY_API_URL}/v2/auth/tinacms`
    );
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'https://mysite.com/admin'
    );
    expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(redirectUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(redirectUrl.searchParams.get('state')).toBeTruthy();
  });
});

describe('authenticate — WorkOS disabled (popup)', () => {
  beforeEach(() => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workosEnabled: false }),
    });
  });

  it('opens a popup to the frontend signin URL', async () => {
    const result = authenticate(CLIENT_ID, IDENTITY_API_URL, FRONTEND_URL);

    await vi.waitFor(() => {
      expect(popupWindow).toHaveBeenCalledWith(
        expect.stringContaining(`${FRONTEND_URL}/signin`),
        '_blank',
        window,
        1000,
        700
      );
    });

    // Set up rejection handler before triggering to avoid unhandled rejection warning.
    const expectation = expect(result).rejects.toThrow(
      AuthenticationCancelledError
    );
    authTab.closed = true;
    await vi.advanceTimersByTimeAsync(600);
    await expectation;
  });

  it('resolves with tokens on valid message', async () => {
    const result = authenticate(CLIENT_ID, IDENTITY_API_URL, FRONTEND_URL);

    await vi.waitFor(() => {
      expect(messageListeners.length).toBe(1);
    });

    dispatch({
      origin: EXPECTED_ORIGIN,
      source: authTab as unknown as Window,
      data: validData,
    });

    await expect(result).resolves.toEqual({
      id_token: 'id-token',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(authTab.close).toHaveBeenCalled();
  });

  it('rejects when popup is closed without auth', async () => {
    const result = authenticate(CLIENT_ID, IDENTITY_API_URL, FRONTEND_URL);

    await settleViaPopupClose(result);
  });
});

describe('authenticate — propagates fetch errors', () => {
  it('throws when /v2/auth/config fetch fails', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(
      authenticate(CLIENT_ID, IDENTITY_API_URL, FRONTEND_URL)
    ).rejects.toThrow('Failed to fetch auth config');
  });
});

describe('exports', () => {
  it('exports the auth token key', () => {
    expect(AUTH_TOKEN_KEY).toBe('tinacms-auth');
  });

  it('exports the PKCE storage key', () => {
    expect(PKCE_STORAGE_KEY).toBe('tinacms-pkce');
  });
});
