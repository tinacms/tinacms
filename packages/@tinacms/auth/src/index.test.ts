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

// Replace the global fetch with a Jest mock before each test
let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('isUserAuthorized', () => {
  it('returns undefined when TinaCloud responds with a non-ok status', async () => {
    // Simulate TinaCloud rejecting the token (expired, malformed, etc.)
    fetchMock.mockResolvedValueOnce({
      ok: false,
    });

    const result = await isUserAuthorized({
      clientID: 'my-client-id',
      token: 'Bearer expired-token',
    });

    // A rejected token must never return a user
    expect(result).toBeUndefined();
  });

  it('returns a user when TinaCloud responds with a valid token', async () => {
    fetchMock.mockResolvedValueOnce({
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
  it('returns undefined when clientID is missing from the request', async () => {
    const req = {
      query: {},
      headers: { authorization: 'Bearer some-token' },
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req);

    // Should never reach TinaCloud — fetch must not be called
    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns undefined when authorization header is missing from the request', async () => {
    const req = {
      query: { clientID: 'my-client-id' },
      headers: {},
    } as unknown as NextApiRequest;

    const result = await isAuthorized(req);

    // Should never reach TinaCloud — fetch must not be called
    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('TinaCloudBackendAuthProvider', () => {
  it('returns isAuthorized: false when the user is not verified', async () => {
    // Simulate TinaCloud returning a user that exists but has not verified their email
    const unverifiedUser = { ...mockUser, verified: false };
    fetchMock.mockResolvedValueOnce({
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
    fetchMock.mockResolvedValueOnce({
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
