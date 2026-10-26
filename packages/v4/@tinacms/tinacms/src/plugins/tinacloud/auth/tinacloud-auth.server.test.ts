import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  tinaCloudIdentity,
  tinaCloudUser,
} from '../../../test/tinacloud-login';
import { TINACLOUD_IDENTITY_URL } from '../client';
import { createTinaCloudAuthServer } from './tinacloud-auth.server';

const { getSession } = createTinaCloudAuthServer({ clientId: 'abc' });

const request = (authorization?: string) =>
  new Request('http://tina.local/api/tina/media/list', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
  });

const stubIdentity = (
  respond: (url: string) => Response | Promise<Response>
) => {
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
    respond(url)
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => vi.unstubAllGlobals());

describe('TinaCloud getSession', () => {
  it('verifies the bearer token as the sign-in does, with the project role', async () => {
    const fetchMock = stubIdentity((url) => tinaCloudIdentity(url));
    expect(await getSession(request('Bearer id-token'))).toEqual({
      identity: { id: 'ada', name: 'Ada Lovelace', email: 'ada@example.com' },
      roles: ['admin'],
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${TINACLOUD_IDENTITY_URL}/v2/apps/abc/currentUser`,
      `${TINACLOUD_IDENTITY_URL}/v2/apps/abc`,
    ]);
    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers(init?.headers).get('Authorization')).toBe(
        'Bearer id-token'
      );
    }
  });

  it('gives a project member who is not an admin the editor role', async () => {
    stubIdentity((url) => tinaCloudIdentity(url, { role: 'editor' }));
    expect(await getSession(request('Bearer id-token'))).toMatchObject({
      roles: ['editor'],
    });
  });

  it.each([
    ['no authorization header', undefined],
    ['a scheme other than Bearer', 'Basic YWRhOnB3'],
    ['an empty bearer token', 'Bearer '],
  ])('returns null without a call to TinaCloud for %s', async (_, header) => {
    const fetchMock = stubIdentity((url) => tinaCloudIdentity(url));
    expect(await getSession(request(header))).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['refuses the token', () => Response.json({}, { status: 401 })],
    ['is not a project member', () => Response.json({}, { status: 403 })],
    [
      'returns an unverified user',
      (url: string) =>
        tinaCloudIdentity(url, { user: { ...tinaCloudUser, verified: false } }),
    ],
    ['returns a malformed user', () => Response.json({ verified: true })],
    ['returns a body that is not JSON', () => new Response('<html>')],
  ])('returns null when TinaCloud %s', async (_, respond) => {
    stubIdentity(respond);
    expect(await getSession(request('Bearer id-token'))).toBeNull();
  });

  it.each([
    [
      'cannot be reached',
      () => Promise.reject(new TypeError('Failed to fetch')),
    ],
    ['fails', () => Response.json({}, { status: 502 })],
  ])(
    'throws when TinaCloud %s, so the handler fails closed',
    async (_, respond) => {
      stubIdentity(respond);
      await expect(getSession(request('Bearer id-token'))).rejects.toThrow();
    }
  );
});
