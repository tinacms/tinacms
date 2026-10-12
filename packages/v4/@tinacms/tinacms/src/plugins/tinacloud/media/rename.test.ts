import { afterEach, describe, expect, it, vi } from 'vitest';
import { TINACLOUD_ASSETS_URL, createTinaCloudClient } from '../client';
import { renameMedia } from './rename';

const client = createTinaCloudClient({
  clientId: 'abc',
  getToken: () => 'secret',
});

const stubFetch = (...responses: Response[]) => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
    const next = responses.shift();
    if (!next) throw new Error('unexpected fetch');
    return next;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('renameMedia', () => {
  it('posts the rename and returns the new path', async () => {
    const fetchMock = stubFetch(json({ success: true, path: 'posts/b.png' }));
    expect(
      await renameMedia(client, 'feat/x', 'posts/a.png', 'posts/b.png')
    ).toBe('posts/b.png');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${TINACLOUD_ASSETS_URL}/v1/abc/rename`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      from: 'posts/a.png',
      to: 'posts/b.png',
      branch: 'feat/x',
    });
  });

  it('waits for the request when the response has a requestId', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(
      json({ success: true, requestId: 'r-1' }),
      json({ error: false })
    );
    const done = renameMedia(client, undefined, 'a.png', 'b.png');
    await vi.advanceTimersByTimeAsync(1000);
    expect(await done).toBe('b.png');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      from: 'a.png',
      to: 'b.png',
    });
    expect(fetchMock.mock.calls[1][0]).toContain('/request-status/abc/r-1');
  });

  it.each([
    [409, {}, 'name-taken'],
    [500, { message: 'A file already exists at b.png' }, 'name-taken'],
    [400, { message: 'Bad name' }, 'invalid-name'],
    [404, {}, 'not-found'],
    [403, {}, 'unauthorized'],
    [500, {}, 'backend-failure'],
    [422, { code: 'INVALID_PATH', message: 'No' }, 'invalid-path'],
  ])('maps a %i with %j to %s', async (status, body, code) => {
    stubFetch(json(body, status));
    await expect(
      renameMedia(client, undefined, 'a.png', 'b.png')
    ).rejects.toMatchObject({ code });
  });

  it('reports a response without success as backend-failure', async () => {
    stubFetch(json({ success: false }));
    await expect(
      renameMedia(client, undefined, 'a.png', 'b.png')
    ).rejects.toMatchObject({ code: 'backend-failure' });
  });

  it('asks for a refresh when the request fails after the rename', async () => {
    vi.useFakeTimers();
    stubFetch(
      json({ success: true, requestId: 'r-1' }),
      json({ error: true, message: 'Commit failed' })
    );
    const done = renameMedia(client, undefined, 'a.png', 'b.png');
    const assertion = expect(done).rejects.toMatchObject({
      code: 'backend-failure',
      detail: expect.stringMatching(/^Commit failed .*Refresh/),
    });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});
