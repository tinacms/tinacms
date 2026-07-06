import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// isAuthorized reads the bearer token from next/headers and validates it
// against the site's own clientID (arg or NEXT_PUBLIC_TINA_CLIENT_ID), never a
// request value. Mock next/headers so we can drive the token per test.
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

import { headers } from 'next/headers';
import { isAuthorized } from '../packages/next-tinacms-azure/src/auth';

const mockedHeaders = vi.mocked(headers);

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  verified: true,
  role: 'admin' as const,
  enabled: true,
  fullName: 'Test User',
};

// isAuthorized ignores req entirely; token comes from next/headers.
const req = {} as NextRequest;

const headerBag = (authorization?: string) => ({
  get: (name: string) =>
    name.toLowerCase() === 'authorization' ? (authorization ?? null) : null,
});

let fetchSpy: ReturnType<typeof vi.spyOn>;
const ORIGINAL_ENV_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // Each test sets its own clientID source (arg or env).
  delete process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
});

afterEach(() => {
  vi.restoreAllMocks();
  mockedHeaders.mockReset();
  if (ORIGINAL_ENV_CLIENT_ID === undefined) {
    delete process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  } else {
    process.env.NEXT_PUBLIC_TINA_CLIENT_ID = ORIGINAL_ENV_CLIENT_ID;
  }
});

describe('isAuthorized (next-tinacms-azure)', () => {
  it("returns undefined when this site's clientID cannot be resolved", async () => {
    mockedHeaders.mockResolvedValue(headerBag('Bearer some-token'));

    const result = await isAuthorized(req);

    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns undefined when the resolved clientID is blank', async () => {
    mockedHeaders.mockResolvedValue(headerBag('Bearer some-token'));

    const result = await isAuthorized(req, '   ');

    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns undefined when the authorization header is missing', async () => {
    mockedHeaders.mockResolvedValue(headerBag(undefined));

    const result = await isAuthorized(req, 'my-site-app');

    expect(result).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('validates the token against the site clientID passed explicitly', async () => {
    mockedHeaders.mockResolvedValue(headerBag('Bearer valid-token'));
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    } as Response);

    const result = await isAuthorized(req, 'my-site-app');

    expect(result).toEqual(mockUser);
    expect(String(fetchSpy.mock.calls[0][0])).toContain('/apps/my-site-app/');
  });

  it('falls back to NEXT_PUBLIC_TINA_CLIENT_ID when no clientID is passed', async () => {
    process.env.NEXT_PUBLIC_TINA_CLIENT_ID = 'env-site-app';
    mockedHeaders.mockResolvedValue(headerBag('Bearer valid-token'));
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    } as Response);

    const result = await isAuthorized(req);

    expect(result).toEqual(mockUser);
    expect(String(fetchSpy.mock.calls[0][0])).toContain('/apps/env-site-app/');
  });

  it("rejects a token that is not valid for this site's app", async () => {
    mockedHeaders.mockResolvedValue(headerBag('Bearer token-for-another-app'));
    // The identity server returns non-ok when the token holder is not a member
    // of the requested app; authorization must then be refused.
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'unauthorized' }),
    } as Response);

    const result = await isAuthorized(req, 'this-site-app');

    expect(result).toBeUndefined();
    expect(String(fetchSpy.mock.calls[0][0])).toContain('/apps/this-site-app/');
  });
});
