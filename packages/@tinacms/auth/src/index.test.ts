import {
  TinaCloudBackendAuthProvider,
  isAuthorized,
  isUserAuthorized,
} from './index';
import type { NextApiRequest } from 'next';
import type { ServerResponse } from 'http';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  verified: true,
  role: 'admin' as const,
  enabled: true,
  fullName: 'Test User',
};

let fetchSpy: jest.SpyInstance;
const ORIGINAL_ENV_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch');
  // Each test sets its own clientID source (arg or env).
  delete process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
});

afterEach(() => {
  jest.restoreAllMocks();
  if (ORIGINAL_ENV_CLIENT_ID === undefined) {
    delete process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  } else {
    process.env.NEXT_PUBLIC_TINA_CLIENT_ID = ORIGINAL_ENV_CLIENT_ID;
  }
});

describe('isUserAuthorized', () => {
  it('returns undefined when TinaCloud responds with a non-ok status', async () => {
    // Simulate TinaCloud rejecting the token (expired, malformed, etc.)
    fetchSpy.mockResolvedValueOnce({
      ok: false,
    });

    const result = await isUserAuthorized({
      clientID: 'my-client-id',
      token: 'Bearer expired-token',
    });

    // A rejected token must never return a user
    expect(result).toBeUndefined();
  });

  it('re-throws the original error when a network error occurs', async () => {
    const networkError = new Error('Network failure');
    fetchSpy.mockRejectedValueOnce(networkError);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      isUserAuthorized({ clientID: 'my-client-id', token: 'Bearer some-token' })
    ).rejects.toThrow(networkError);
  });

  it('returns a user when TinaCloud responds with a valid token', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const result = await isUserAuthorized({
      clientID: 'my-client-id',
      token: 'Bearer valid-token',
    });

    expect(result).toEqual(mockUser);
  });
});

describe('isAuthorized', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it("returns undefined when this site's clientID cannot be resolved", async () => {
    // No arg and no env: nothing to validate against, so refuse.
    const req = {
      query: { clientID: 'some-other-app' },
      headers: { authorization: 'Bearer some-token' },
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req);

    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('clientID')
    );
  });

  it('returns undefined when the resolved clientID is blank', async () => {
    const req = {
      query: {},
      headers: { authorization: 'Bearer some-token' },
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req, '   ');

    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns undefined when authorization header is missing from the request', async () => {
    const req = {
      query: {},
      headers: {},
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req, 'my-client-id');

    // Should never reach TinaCloud — fetch must not be called
    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('authorization')
    );
  });

  it('validates the token against expectedClientID, ignoring req.query.clientID', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const req = {
      // the request names a different app; this must be ignored
      query: { clientID: 'some-other-app' },
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req, 'my-site-app');

    expect(result).toEqual(mockUser);
    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain('/apps/my-site-app/');
    expect(calledUrl).not.toContain('some-other-app');
  });

  it('falls back to NEXT_PUBLIC_TINA_CLIENT_ID when no expectedClientID is passed', async () => {
    process.env.NEXT_PUBLIC_TINA_CLIENT_ID = 'env-site-app';
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const req = {
      query: { clientID: 'some-other-app' },
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req);

    expect(result).toEqual(mockUser);
    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain('/apps/env-site-app/');
    expect(calledUrl).not.toContain('some-other-app');
  });
});

describe('TinaCloudBackendAuthProvider', () => {
  it('returns isAuthorized: false when the user is not verified', async () => {
    // Simulate TinaCloud returning a user that exists but has not verified their email
    const unverifiedUser = { ...mockUser, verified: false };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => unverifiedUser,
    });

    const provider = TinaCloudBackendAuthProvider('my-site-app');
    const req = {
      query: {},
      headers: { authorization: 'Bearer some-token' },
    } as unknown as NextApiRequest;

    const result = await provider.isAuthorized(req, {} as ServerResponse);

    // An unverified user must never be granted access
    expect(result).toEqual({
      isAuthorized: false,
      errorCode: 401,
      errorMessage: 'Unauthorized',
    });
  });

  it('returns isAuthorized: true when the user is verified', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const provider = TinaCloudBackendAuthProvider('my-site-app');
    const req = {
      query: {},
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as NextApiRequest;

    const result = await provider.isAuthorized(req, {} as ServerResponse);

    expect(result).toEqual({ isAuthorized: true });
  });

  it('refuses (401) when no clientID is configured', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const provider = TinaCloudBackendAuthProvider(undefined);
    const req = {
      query: { clientID: 'some-other-app' },
      headers: { authorization: 'Bearer some-token' },
    } as unknown as NextApiRequest;

    const result = await provider.isAuthorized(req, {} as ServerResponse);

    expect(result).toEqual({
      isAuthorized: false,
      errorCode: 401,
      errorMessage: 'Unauthorized',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('authorization is scoped to the site clientID', () => {
  // A token is only valid for its own app; validate against the site's app id.
  const APP_TOKEN: Record<string, string> = {
    'this-site-app': 'token-this-site',
    'other-app': 'token-other',
  };
  const APP_USER: Record<string, typeof mockUser> = {
    'this-site-app': {
      ...mockUser,
      id: 'u-this-site',
      email: 'owner@example.com',
    },
    'other-app': { ...mockUser, id: 'u-other', email: 'other@example.com' },
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchSpy.mockImplementation(async (url: any, init: any) => {
      const m = String(url).match(/\/v2\/apps\/([^/]+)\/currentUser$/);
      const app = m ? decodeURIComponent(m[1]) : '';
      const auth = init?.headers?.get?.('authorization');
      if (APP_TOKEN[app] && auth === APP_TOKEN[app]) {
        return { ok: true, json: async () => APP_USER[app] } as any;
      }
      return { ok: false, json: async () => ({ message: 'unauthorized' }) } as any;
    });
  });

  // The media-store README gate, wired with this site's app id.
  const SITE_CLIENT_ID = 'this-site-app';
  const authorized = async (req: NextApiRequest) => {
    const user = await isAuthorized(req, SITE_CLIENT_ID);
    return Boolean(user && user.verified);
  };
  const makeReq = (clientID: string, token: string) =>
    ({
      query: { clientID },
      headers: { authorization: token },
    } as unknown as NextApiRequest);

  it("a token for this site's app is authorized", async () => {
    expect(
      await authorized(makeReq('this-site-app', 'token-this-site'))
    ).toBe(true);
  });

  it("a token for another app cannot reach this site's app", async () => {
    expect(await authorized(makeReq('this-site-app', 'token-other'))).toBe(
      false
    );
  });

  it('a request naming a different app is not authorized on this site', async () => {
    // The request names other-app, but the token is validated against the
    // site's pinned app id and rejected.
    expect(await authorized(makeReq('other-app', 'token-other'))).toBe(false);
  });
});
