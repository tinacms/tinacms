import { afterEach, describe, expect, it, vi } from 'vitest';
import { TINACLOUD_ASSETS_URL, createTinaCloudClient } from '../client';
import { listMedia, mediaUrl } from './read';

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

describe('listMedia', () => {
  it('maps the list response to a page, directories first', async () => {
    stubFetch(
      json({
        cursor: 'next-1',
        files: [{ filename: 'a.png', src: 'https://assets.tina.io/abc/a.png' }],
        directories: ['nested/', 'plain'],
      })
    );
    expect(await listMedia(client, undefined, 'posts')).toEqual({
      items: [
        { path: 'posts/nested', kind: 'directory' },
        { path: 'posts/plain', kind: 'directory' },
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
