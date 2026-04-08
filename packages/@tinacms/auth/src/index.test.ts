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

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch');
});

afterEach(() => {
  jest.restoreAllMocks();
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

  it('returns undefined when clientID is missing from the request', async () => {
    const req = {
      query: {},
      headers: { authorization: 'Bearer some-token' },
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req);

    // Should never reach TinaCloud — fetch must not be called
    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('clientID')
    );
  });

  it('returns undefined when authorization header is missing from the request', async () => {
    const req = {
      query: { clientID: 'my-client-id' },
      headers: {},
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req);

    // Should never reach TinaCloud — fetch must not be called
    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('authorization')
    );
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

    const provider = TinaCloudBackendAuthProvider();
    const req = {
      query: { clientID: 'my-client-id' },
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

    const provider = TinaCloudBackendAuthProvider();
    const req = {
      query: { clientID: 'my-client-id' },
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as NextApiRequest;

    const result = await provider.isAuthorized(req, {} as ServerResponse);

    expect(result).toEqual({ isAuthorized: true });
  });
});
