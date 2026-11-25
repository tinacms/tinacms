import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_KEY, PKCE_STORAGE_KEY } from './authenticate';
import {
  LOGIN_FAILED_MESSAGE,
  NO_PROJECT_ACCESS_MESSAGE,
  useTinaAuthRedirect,
} from './useTinaAuthRedirect';

const CODE = 'auth-code';
const STATE = 'expected-state';
const CODE_VERIFIER = 'test-verifier';
const CLIENT_ID = 'test-client-id';
const IDENTITY_API_URL = 'https://api.example.com';
const REDIRECT_URI = window.location.origin + window.location.pathname;

const pkceData = {
  code_verifier: CODE_VERIFIER,
  state: STATE,
  client_id: CLIENT_ID,
  identity_api_url: IDENTITY_API_URL,
};

const seedPkceStorage = (overrides: Partial<typeof pkceData> = {}) => {
  localStorage.setItem(
    PKCE_STORAGE_KEY,
    JSON.stringify({ ...pkceData, ...overrides })
  );
};

let fetchSpy: ReturnType<typeof vi.fn>;
let consoleErrorSpy: ReturnType<typeof vi.fn>;
let replaceStateSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  replaceStateSpy = vi
    .spyOn(window.history, 'replaceState')
    .mockImplementation(() => {});
  vi.spyOn(window.location, 'reload').mockImplementation(() => {});
  fetchSpy = vi.fn();
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('useTinaAuthRedirect', () => {
  it('reports auth errors and bails without touching storage', () => {
    const { result } = renderHook(() =>
      useTinaAuthRedirect({
        code: CODE,
        state: STATE,
        error: 'access_denied',
      })
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Auth error:',
      'access_denied'
    );
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(result.current).toEqual({
      status: 'failed',
      message: LOGIN_FAILED_MESSAGE,
    });
  });

  it('does nothing when code is missing', () => {
    const { result } = renderHook(() =>
      useTinaAuthRedirect({ code: null, state: STATE, error: null })
    );
    expect(result.current).toEqual({ status: 'idle' });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does nothing when state is missing', () => {
    renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: null, error: null })
    );

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does nothing when disabled even with code and state', () => {
    const { result } = renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null }, false)
    );
    expect(result.current).toEqual({ status: 'idle' });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
  });

  it('bails when no PKCE data is stored', () => {
    const { result } = renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null })
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'No PKCE data found in localStorage'
    );
    expect(result.current).toEqual({
      status: 'failed',
      message: LOGIN_FAILED_MESSAGE,
    });
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a state mismatch and clears the stored PKCE data', () => {
    seedPkceStorage();

    renderHook(() =>
      useTinaAuthRedirect({
        code: CODE,
        state: 'attacker-controlled-state',
        error: null,
      })
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'State mismatch - possible CSRF attack'
    );
    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('exchanges the code and stores the tokens on success', async () => {
    seedPkceStorage();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: 'access-token', refresh_token: '' }),
    });

    const { result } = renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null })
    );
    expect(result.current).toEqual({ status: 'pending' });

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${IDENTITY_API_URL}/oauth/token`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    );

    const body = fetchSpy.mock.calls[0][1].body as string;
    expect(new URLSearchParams(body).toString()).toBe(
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: CODE,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: CODE_VERIFIER,
      }).toString()
    );

    await vi.waitFor(() => {
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(
        JSON.stringify({ access_token: 'access-token', refresh_token: '' })
      );
    });
    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('bails and clears storage when the token endpoint returns an error', async () => {
    seedPkceStorage();
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'invalid_grant' }),
    });

    const { result } = renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null })
    );

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Token exchange failed:',
        expect.any(Error)
      );
    });

    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    await vi.waitFor(() => {
      expect(result.current).toEqual({
        status: 'failed',
        message: LOGIN_FAILED_MESSAGE,
      });
    });
  });

  it('asks for a different account when the token endpoint returns 403', async () => {
    seedPkceStorage();
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({
          message: 'this account does not have access to this project',
        }),
    });

    const { result } = renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null })
    );

    await vi.waitFor(() => {
      expect(result.current).toEqual({
        status: 'failed',
        message: NO_PROJECT_ACCESS_MESSAGE,
      });
    });
    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('bails and clears storage when the response is ok but body contains an error', async () => {
    seedPkceStorage();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ error: 'invalid_grant' }),
    });

    renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null })
    );

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Token exchange failed:',
        expect.any(Error)
      );
    });

    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('bails and clears storage when the token fetch fails', async () => {
    seedPkceStorage();
    fetchSpy.mockRejectedValueOnce(new Error('network down'));

    renderHook(() =>
      useTinaAuthRedirect({ code: CODE, state: STATE, error: null })
    );

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Token exchange failed:',
        new Error('network down')
      );
    });

    expect(localStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      window.location.pathname
    );
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  describe('onLogin', () => {
    const mockExchange = () => {
      seedPkceStorage();
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'access-token', refresh_token: 'r' }),
      });
    };

    it('runs once with the real token, after the URL is cleaned and before the reload', async () => {
      mockExchange();
      const order: string[] = [];
      replaceStateSpy.mockImplementation(() => {
        order.push('clean url');
      });
      const onLogin = vi.fn(async () => {
        order.push(`login:${localStorage.getItem(AUTH_TOKEN_KEY)}`);
      });
      (window.location.reload as any).mockImplementation(() => {
        order.push('reload');
      });

      renderHook(() =>
        useTinaAuthRedirect(
          { code: CODE, state: STATE, error: null },
          true,
          onLogin
        )
      );

      await vi.waitFor(() => expect(window.location.reload).toHaveBeenCalled());
      expect(onLogin).toHaveBeenCalledTimes(1);
      expect(onLogin).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'r',
      });
      expect(order).toEqual([
        'clean url',
        `login:${JSON.stringify({ access_token: 'access-token', refresh_token: 'r' })}`,
        'reload',
      ]);
    });

    it('shows the error, drops the token and does not reload when it throws', async () => {
      mockExchange();
      const onLogin = vi.fn().mockRejectedValue(new Error('hook failed'));

      const { result } = renderHook(() =>
        useTinaAuthRedirect(
          { code: CODE, state: STATE, error: null },
          true,
          onLogin
        )
      );

      await vi.waitFor(() =>
        expect(result.current).toEqual({
          status: 'failed',
          message: 'Error: hook failed',
        })
      );
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });
});
