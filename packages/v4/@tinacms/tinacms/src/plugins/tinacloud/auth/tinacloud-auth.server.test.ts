import { afterEach, describe, expect, it, vi } from 'vitest';
import { tinaCloudUser } from '../../../test/tinacloud-login';
import { TINACLOUD_IDENTITY_URL } from '../client';
import { createTinaCloudAuthServer } from './tinacloud-auth.server';

const { getSession } = createTinaCloudAuthServer({ clientId: 'abc' });

const request = (authorization?: string) =>
  new Request('http://tina.local/api/tina/media/list', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
  });

const stubIdentity = (respond: () => Response | Promise<Response>) => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
    respond()
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe('TinaCloud getSession', () => {
  it('verifies the bearer token against the project and maps the role', async () => {
    const fetchMock = stubIdentity(() => json(tinaCloudUser));
    expect(await getSession(request('Bearer id-token'))).toEqual({
      identity: { id: 'ada', name: 'Ada Lovelace', email: 'ada@example.com' },
      roles: ['admin'],
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${TINACLOUD_IDENTITY_URL}/v2/apps/abc/currentUser`);
    expect(new Headers(init?.headers).get('Authorization')).toBe(
      'Bearer id-token'
    );
  });

  it('gives a TinaCloud user that is not an admin the editor role', async () => {
    stubIdentity(() => json({ ...tinaCloudUser, role: 'user' }));
    expect(await getSession(request('Bearer id-token'))).toMatchObject({
      roles: ['editor'],
    });
  });

  it.each([
    ['no authorization header', undefined],
    ['a scheme other than Bearer', 'Basic YWRhOnB3'],
    ['an empty bearer token', 'Bearer '],
  ])('returns null without a call to TinaCloud for %s', async (_, header) => {
    const fetchMock = stubIdentity(() => json(tinaCloudUser));
    expect(await getSession(request(header))).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['refuses the token', () => json({ message: 'expired' }, 401)],
    ['is not a project member', () => json({}, 403)],
    [
      'returns an unverified user',
      () => json({ ...tinaCloudUser, verified: false }),
    ],
    [
      'returns a disabled user',
      () => json({ ...tinaCloudUser, enabled: false }),
    ],
    ['returns a malformed user', () => json({ verified: true })],
    ['returns a body that is not JSON', () => new Response('<html>')],
  ])('returns null when TinaCloud %s', async (_, respond) => {
    stubIdentity(respond);
    expect(await getSession(request('Bearer id-token'))).toBeNull();
  });

  it('throws when TinaCloud cannot be reached, so the handler fails closed', async () => {
    stubIdentity(() => Promise.reject(new TypeError('Failed to fetch')));
    await expect(getSession(request('Bearer id-token'))).rejects.toThrow(
      'Failed to fetch'
    );
  });
});
