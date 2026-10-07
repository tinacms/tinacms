import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaError } from '../../../core/media/contract';
import {
  TINACLOUD_ASSETS_URL,
  TinaCloudError,
  createTinaCloudClient,
} from '../client';
import { deleteMedia, listMedia, mediaUrl, toMediaError } from './read';

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

describe('toMediaError', () => {
  it.each([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not-found'],
    [413, 'too-large'],
    [500, 'backend-failure'],
  ])('maps a %i to %s', (status, code) => {
    expect(
      toMediaError(new TinaCloudError('failed', { status }))
    ).toMatchObject({ code });
  });

  it('keeps the status and the server message in the detail', () => {
    const error = toMediaError(
      new TinaCloudError('TinaCloud responded with 500.', {
        status: 500,
        body: { message: 'S3 is down' },
      })
    );
    expect(error.detail).toBe('TinaCloud responded with 500. S3 is down');
  });

  it('passes a MediaError through and wraps any other value', () => {
    const original = new MediaError('name-taken');
    expect(toMediaError(original)).toBe(original);
    expect(toMediaError(new Error('boom'))).toMatchObject({
      code: 'backend-failure',
      detail: 'boom',
    });
    expect(toMediaError('boom')).toMatchObject({
      code: 'backend-failure',
      detail: 'boom',
    });
  });
});

describe('listMedia', () => {
  it('maps the list response to a page, directories first', async () => {
    stubFetch(
      json({
        cursor: 'next-1',
        files: [{ filename: 'a.png', src: 'https://assets.tina.io/abc/a.png' }],
        directories: ['nested'],
      })
    );
    expect(await listMedia(client, undefined, 'posts')).toEqual({
      items: [
        { path: 'posts/nested', kind: 'directory' },
        { path: 'posts/a.png', kind: 'file' },
      ],
      cursor: 'next-1',
    });
  });

  it('sends the page request and the branch in the query string', async () => {
    const fetchMock = stubFetch(
      json({ cursor: 0, files: [], directories: [] })
    );
    const page = await listMedia(client, 'feat/x', 'my posts', {
      limit: 50,
      cursor: 'c1',
      search: 'hero',
      extensions: ['jpg', 'png'],
    });
    expect(page).toEqual({ items: [], cursor: undefined });
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v2/abc/list/my%20posts?limit=50&cursor=c1&search=hero&ext=jpg%2Cpng&branch=feat%2Fx`
    );
  });

  it('sends no branch parameter on the media branch', async () => {
    const fetchMock = stubFetch(json({ files: [], directories: [] }));
    await listMedia(client, undefined, '');
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v2/abc/list/?limit=20`
    );
  });

  it('reports a response in an unknown format as backend-failure', async () => {
    stubFetch(json({ items: [] }));
    await expect(listMedia(client, undefined, '')).rejects.toMatchObject({
      code: 'backend-failure',
    });
  });

  it('reports a 401 as unauthorized', async () => {
    stubFetch(json({ message: 'expired' }, 401));
    await expect(listMedia(client, undefined, '')).rejects.toMatchObject({
      code: 'unauthorized',
    });
  });
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

describe('mediaUrl', () => {
  it('serves the media branch from the CDN root of the project', () => {
    expect(mediaUrl('abc', undefined, 'posts/my hero.png')).toBe(
      'https://assets.tina.io/abc/posts/my%20hero.png'
    );
  });

  it('serves another branch from its staging folder', () => {
    expect(mediaUrl('abc', 'feat/x', 'posts/hero.png')).toBe(
      'https://assets.tina.io/abc/__staging/feat/x/__file/posts/hero.png'
    );
  });

  it('adds a crop for a size', () => {
    expect(
      mediaUrl('abc', undefined, 'hero.png', { width: 400, height: 300 })
    ).toBe('https://assets.tina.io/abc/hero.png?fit=crop&max-w=400&max-h=300');
    expect(mediaUrl('abc', 'feat/x', 'hero.png', { width: 75 })).toBe(
      'https://assets.tina.io/abc/__staging/feat/x/__file/hero.png?fit=crop&max-w=75'
    );
  });
});
