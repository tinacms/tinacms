import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The fs-backed cache is loaded via a dynamic `import('../cache/node-cache.js')`.
// Mock it so the cache path can be exercised without touching the real
// filesystem, and so we can assert whether the client even tried to load it.
const { nodeCacheMock } = vi.hoisted(() => ({ nodeCacheMock: vi.fn() }));
vi.mock('../cache/node-cache.js', () => ({ NodeCache: nodeCacheMock }));

import { createClient } from './index';

const CACHE_DIR = '/tmp/tina-cache/abc';

// requestFromServer only reads ok/status/statusText/json(), so a plain object
// stands in for a real Response and avoids depending on the test env's globals.
const okResponse = () => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => ({ data: { ok: true }, errors: null }),
});

const makeClient = (args: Record<string, unknown> = {}) =>
  createClient({
    url: 'https://content.tinajs.io/content/abc/github/main',
    queries: () => ({}),
    cacheDir: CACHE_DIR,
    ...args,
  });

// The vitest env is happy-dom, so `window`/`navigator` exist by default; every
// test stubs the globals it cares about and restores them afterwards.
const asEdge = (userAgent = 'Cloudflare-Workers') => {
  vi.stubGlobal('window', undefined);
  vi.stubGlobal('navigator', { userAgent });
};

const asNode = () => {
  vi.stubGlobal('window', undefined);
  vi.stubGlobal('navigator', undefined);
};

beforeEach(() => {
  nodeCacheMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TinaClient cache initialization', () => {
  it('skips the fs cache on the Cloudflare Workers runtime', async () => {
    asEdge();
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient();
    await client.init();

    expect(nodeCacheMock).not.toHaveBeenCalled();
    expect(client.cache).toBeFalsy();
    expect(client.cacheLock).toBeUndefined();

    await client.request({ query: 'query { x }' }, {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('skips the fs cache on the Vercel Edge runtime', async () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('EdgeRuntime', 'edge-runtime');

    const client = makeClient();
    await client.init();

    expect(nodeCacheMock).not.toHaveBeenCalled();
    expect(client.cache).toBeFalsy();
    expect(client.cacheLock).toBeUndefined();
  });

  it('enables the fs cache in a Node runtime', async () => {
    asNode();
    const cacheStub = {
      makeKey: vi.fn(() => 'k'),
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    };
    nodeCacheMock.mockResolvedValue(cacheStub);

    const client = makeClient();
    await client.init();

    expect(nodeCacheMock).toHaveBeenCalledWith(CACHE_DIR);
    expect(client.cache).toBe(cacheStub);
    expect(client.cacheLock).toBeDefined();
  });

  it('respects cache: false even when a cacheDir is provided', async () => {
    asNode();
    nodeCacheMock.mockResolvedValue({
      makeKey: () => 'k',
      get: vi.fn(),
      set: vi.fn(),
    });
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient({ cache: false });
    await client.init();

    expect(nodeCacheMock).not.toHaveBeenCalled();
    expect(client.cache).toBeFalsy();
    expect(client.cacheLock).toBeUndefined();

    await client.request({ query: 'query { x }' }, {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('TinaClient concurrent requests on edge', () => {
  it('resolves concurrent identical requests without deadlocking', async () => {
    asEdge();
    // A slow resolve makes two same-key requests overlap in flight. With the
    // fs cache disabled there is no per-key lock, so both proceed; the test
    // passing within the default timeout is the no-deadlock assertion.
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(okResponse()), 5))
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient();
    const query = { query: 'query { same }' };

    await expect(
      Promise.all([client.request(query, {}), client.request(query, {})])
    ).resolves.toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
