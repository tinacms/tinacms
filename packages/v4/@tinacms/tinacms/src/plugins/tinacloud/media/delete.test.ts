import { afterEach, describe, expect, it, vi } from 'vitest';
import { TINACLOUD_ASSETS_URL, createTinaCloudClient } from '../client';
import { deleteMedia } from './delete';

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

describe('deleteMedia', () => {
  it('deletes the file on the branch, then waits for the request', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch(
      json({ requestId: 'req-1' }),
      json({ error: false })
    );
    const done = deleteMedia(client, 'feat/x', 'posts/a b.png');
    await vi.advanceTimersByTimeAsync(1000);
    await done;
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/posts/a%20b.png?branch=feat%2Fx`
    );
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    expect(fetchMock.mock.calls[1][0]).toContain('/request-status/abc/req-1');
  });

  it('reports a 404 as not-found', async () => {
    stubFetch(json({}, 404));
    await expect(
      deleteMedia(client, undefined, 'gone.png')
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  it('reports a failed request as backend-failure', async () => {
    vi.useFakeTimers();
    stubFetch(
      json({ requestId: 'req-1' }),
      json({ error: true, message: 'Commit failed' })
    );
    const done = deleteMedia(client, undefined, 'a.png');
    const assertion = expect(done).rejects.toMatchObject({
      code: 'backend-failure',
      detail: 'Commit failed',
    });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});
