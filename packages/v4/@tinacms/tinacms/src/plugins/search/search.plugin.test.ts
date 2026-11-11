import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRpcHandler } from '../../rpc/handler';
import {
  clearInMemoryIndex,
  indexedRecords,
  inMemorySearchProvider,
} from '../../test/in-memory-search.server';
import { type Session, defineServerPlugin, toUserId } from '../../server';
import type { SearchRecord } from '../../server';
import { createTinaStore } from '../../store/create-store';
import type { ContentSaveInput } from '../../core/content/contract';
import { definePlugin, resolveClientSegments } from '../../core/plugin';
import type { CollectionSchema } from '../../core/schema/types';
import { createSearchClient } from './search.client';
import {
  type SearchProvider,
  SearchError,
  isSearchError,
  isSearchErrorCode,
} from '../../core/search/contract';
import { defineSearchPlugin, searchIndex } from './search.plugin';
import { codecFor } from '../fields/rich-text/rich-text-codecs';

vi.mock('../fields/rich-text/rich-text-codecs', async (importActual) => {
  const actual =
    await importActual<typeof import('../fields/rich-text/rich-text-codecs')>();
  return { ...actual, codecFor: vi.fn(actual.codecFor) };
});

const sessions: Record<string, Session> = {
  'admin-token': { identity: { id: toUserId('ada') }, roles: ['admin'] },
  'editor-token': { identity: { id: toUserId('eli') }, roles: ['editor'] },
};

const collections: CollectionSchema[] = [
  {
    name: 'post',
    format: 'mdx',
    hooks: [searchIndex()],
    fields: [
      { name: 'title', type: 'string' },
      { name: 'excerpt', type: 'string' },
      {
        name: 'body',
        type: 'rich-text',
        templates: [
          { name: 'Cta', fields: [{ name: 'label', type: 'string' }] },
          { name: 'Note', fields: [{ name: 'label', type: 'string' }] },
          {
            name: 'Callout',
            fields: [{ name: 'children', type: 'rich-text' }],
          },
          { name: 'Badge', fields: [{ name: 'children', type: 'rich-text' }] },
        ],
      },
    ],
  },
  { name: 'page', format: 'mdx', fields: [{ name: 'title', type: 'string' }] },
  {
    name: 'note',
    format: 'md',
    hooks: [searchIndex()],
    fields: [
      { name: 'title', type: 'string' },
      { name: 'intro', type: 'rich-text' },
      { name: 'body', type: 'rich-text', isBody: true },
    ],
  },
];

const searchPlugin = defineSearchPlugin({
  name: 'test:search',
  fields: {
    post: { title: 3, excerpt: 2, body: 1 },
    page: { title: 3 },
    note: { title: 3, intro: 2, body: 1 },
  },
  server: () => import('../../test/in-memory-search.server'),
});

// A content provider that mounts as content and auth, as tinaCloud() does.
const contentPlugin = (options: { resolveBranch?: boolean } = {}) => {
  const stored = new Map<string, Record<string, unknown>>();
  const update = vi.fn(async (input: ContentSaveInput) => {
    stored.set(`${input.collection}:${input.path}`, input.value);
    return { path: input.path, document: input.value };
  });
  const plugin = definePlugin({
    name: 'test:cloud',
    provides: ['content', 'auth'],
    server: async () => ({
      default: defineServerPlugin({
        getSession: async (request: Request) => {
          const token = request.headers
            .get('authorization')
            ?.replace('Bearer ', '');
          return (token && sessions[token]) || null;
        },
        update,
        ...(options.resolveBranch === false
          ? {}
          : {
              resolveBranch: async (branch: string | undefined) =>
                branch ?? 'main',
            }),
      }),
    }),
  });
  return { plugin, update, stored };
};

const handlerWith = (content = contentPlugin(), plugins = [searchPlugin]) =>
  createRpcHandler({
    plugins: [content.plugin, ...plugins],
    schema: { collections },
  });

const post = (path: string, body?: unknown, token?: string) =>
  new Request(`http://tina.local/api/tina${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const routeFetchTo =
  (handler: (request: Request) => Promise<Response>): typeof fetch =>
  async (input, init) =>
    handler(new Request(new URL(String(input), 'http://tina.local'), init));

const record = (
  collection: string,
  path: string,
  title: string,
  weight = 3
): SearchRecord => ({
  ref: { collection, path },
  fields: [{ name: 'title', weight, value: title }],
});

const seed = () =>
  inMemorySearchProvider.replace([
    record('post', 'content/posts/a.mdx', 'hello world'),
    record('post', 'content/posts/b.mdx', 'hello again'),
    record('page', 'content/pages/home.mdx', 'hello home'),
    record('post', 'content/posts/c.mdx', 'unrelated'),
  ]);

beforeEach(() => {
  clearInMemoryIndex();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('the search query path', () => {
  it('answers the admin slice through the RPC handler in rank order', async () => {
    await seed();
    const handler = handlerWith();
    vi.stubGlobal('fetch', routeFetchTo(handler));
    const resolved = await resolveClientSegments([searchPlugin]);
    const store = createTinaStore(resolved, { rpcUrl: '/api/tina' });
    const provider = store.getState().search as unknown as SearchProvider;

    const hits = await provider.search('hello', { limit: 10 });

    expect(hits.map(({ ref }) => ref.path)).toEqual([
      'content/pages/home.mdx',
      'content/posts/a.mdx',
      'content/posts/b.mdx',
    ]);
    expect(hits[0]).toEqual({
      ref: { collection: 'page', path: 'content/pages/home.mdx' },
      score: 3,
      snippet: 'hello home',
    });
  });

  it('gives a website the same hits with no cookie or session', async () => {
    await seed();
    const handler = handlerWith();
    const { search } = createSearchClient({
      rpcUrl: '/api/tina',
      fetch: routeFetchTo(handler),
    });
    const hits = await search('hello', { limit: 10 });
    expect(hits).toHaveLength(3);
  });

  it('posts to the configured rpcUrl, not the default', async () => {
    const seen: string[] = [];
    const { search } = createSearchClient({
      rpcUrl: '/cms/rpc',
      fetch: async (input) => {
        seen.push(String(input));
        return Response.json([]);
      },
    });
    await search('hello', { limit: 1 });
    expect(seen).toEqual(['/cms/rpc/search/query']);
  });

  it('narrows to the collections asked for', async () => {
    await seed();
    const { search } = createSearchClient({
      rpcUrl: '/api/tina',
      fetch: routeFetchTo(handlerWith()),
    });
    const hits = await search('hello', { limit: 10, collections: ['post'] });
    expect(hits.every(({ ref }) => ref.collection === 'post')).toBe(true);
    expect(hits).toHaveLength(2);
  });

  it.each([
    ['a collection that is not searchable', { collections: ['author'] }],
    ['an empty collections list', { collections: [] }],
  ])('refuses %s and never calls the provider', async (_name, options) => {
    const query = vi.spyOn(inMemorySearchProvider, 'query');
    const { search } = createSearchClient({
      rpcUrl: '/api/tina',
      fetch: routeFetchTo(handlerWith()),
    });
    await expect(
      search('hello', { limit: 10, ...options })
    ).rejects.toMatchObject({ code: 'invalid-query' });
    expect(query).not.toHaveBeenCalled();
  });

  const tooManyFilters = Object.fromEntries(
    Array.from({ length: 11 }, (_, index) => [`f${index}`, 'x'])
  );
  it.each([
    ['limit 0', 'hello', { limit: 0 }],
    ['limit 101', 'hello', { limit: 101 }],
    ['limit 1.5', 'hello', { limit: 1.5 }],
    ['an empty query', '', { limit: 10 }],
    ['a whitespace query', '   ', { limit: 10 }],
    ['a 257 character query', 'a'.repeat(257), { limit: 10 }],
    ['11 filters', 'hello', { limit: 10, filters: tooManyFilters }],
    ['an object filter', 'hello', { limit: 10, filters: { a: { b: 1 } } }],
  ])(
    'refuses %s from the client and from a raw POST',
    async (_name, query, options) => {
      const spy = vi.spyOn(inMemorySearchProvider, 'query');
      const handler = handlerWith();
      const { search } = createSearchClient({
        rpcUrl: '/api/tina',
        fetch: routeFetchTo(handler),
      });
      await expect(search(query, options as never)).rejects.toMatchObject({
        code: 'invalid-query',
      });
      const response = await handler(post('/search/query', { query, options }));
      expect(response.status).toBe(422);
      expect((await response.json()).error.code).toBe('invalid-query');
      expect(spy).not.toHaveBeenCalled();
    }
  );

  it('pages with the last ref as the cursor', async () => {
    await inMemorySearchProvider.replace(
      Array.from({ length: 25 }, (_, index) =>
        record(
          'post',
          `content/posts/${String(index).padStart(2, '0')}.mdx`,
          'hello'
        )
      )
    );
    const { search } = createSearchClient({
      rpcUrl: '/api/tina',
      fetch: routeFetchTo(handlerWith()),
    });
    const first = await search('hello', { limit: 10 });
    const second = await search('hello', {
      limit: 10,
      cursor: JSON.stringify(first[9].ref),
    });
    const third = await search('hello', {
      limit: 10,
      cursor: JSON.stringify(second[9].ref),
    });
    expect([first.length, second.length, third.length]).toEqual([10, 10, 5]);
    expect(second[0].ref.path).toBe('content/posts/10.mdx');
    expect(third[4].ref.path).toBe('content/posts/24.mdx');
  });

  it.each([
    ['not JSON', 'nope'],
    ['missing path', JSON.stringify({ collection: 'post' })],
    [
      'a collection that is not searchable',
      JSON.stringify({ collection: 'author', path: 'x' }),
    ],
  ])(
    'refuses a cursor that is %s before the provider runs',
    async (_name, cursor) => {
      const spy = vi.spyOn(inMemorySearchProvider, 'query');
      const { search } = createSearchClient({
        rpcUrl: '/api/tina',
        fetch: routeFetchTo(handlerWith()),
      });
      await expect(
        search('hello', { limit: 10, cursor })
      ).rejects.toMatchObject({
        code: 'invalid-query',
      });
      expect(spy).not.toHaveBeenCalled();
    }
  );

  it('lets the provider refuse a cursor that left the results', async () => {
    await seed();
    const { search } = createSearchClient({
      rpcUrl: '/api/tina',
      fetch: routeFetchTo(handlerWith()),
    });
    await expect(
      search('hello', {
        limit: 10,
        cursor: JSON.stringify({ collection: 'post', path: 'gone.mdx' }),
      })
    ).rejects.toMatchObject({ code: 'invalid-query' });
  });
});

describe('search errors', () => {
  const searchWith = (fetchImpl: typeof fetch) =>
    createSearchClient({ rpcUrl: '/api/tina', fetch: fetchImpl }).search;

  it('answers 503 and rejects with unavailable when the backend is down', async () => {
    vi.spyOn(inMemorySearchProvider, 'query').mockRejectedValue(
      new SearchError('unavailable', 'connect ECONNREFUSED')
    );
    const handler = handlerWith();
    const raw = await handler(
      post('/search/query', { query: 'hello', options: { limit: 5 } })
    );
    expect(raw.status).toBe(503);
    expect((await raw.json()).error.code).toBe('unavailable');
    await expect(
      searchWith(routeFetchTo(handler))('hello', { limit: 5 })
    ).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('keeps the message of an unknown failure out of the body', async () => {
    vi.spyOn(inMemorySearchProvider, 'query').mockRejectedValue(
      new Error('secret key abc123')
    );
    const handler = handlerWith();
    const raw = await handler(
      post('/search/query', { query: 'hello', options: { limit: 5 } })
    );
    expect(raw.status).toBe(500);
    const text = await raw.text();
    expect(text).toContain('op-failed');
    expect(text).not.toContain('abc123');
    await expect(
      searchWith(routeFetchTo(handler))('hello', { limit: 5 })
    ).rejects.toMatchObject({ code: 'backend-failure' });
  });

  it('answers 422 unsupported for filters the provider cannot apply', async () => {
    const handler = handlerWith();
    const raw = await handler(
      post('/search/query', {
        query: 'hello',
        options: { limit: 5, filters: { tag: 'a' } },
      })
    );
    expect(raw.status).toBe(422);
    expect((await raw.json()).error.code).toBe('unsupported');
  });

  it('rejects with unavailable when the site has no handler route', async () => {
    const search = searchWith(
      async () => new Response('Not found', { status: 404 })
    );
    const failure = await search('hello', { limit: 5 }).catch(
      (cause: unknown) => cause
    );
    expect(failure).toMatchObject({ code: 'unavailable' });
    expect((failure as SearchError).detail).toContain('/api/tina/search/query');
  });

  it('rejects with unavailable when the fetch fails', async () => {
    const search = searchWith(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(search('hello', { limit: 5 })).rejects.toMatchObject({
      code: 'unavailable',
    });
  });

  it('recognises an error from another copy of the module', () => {
    const foreign = Object.assign(new Error('x'), {
      [Symbol.for('tinacms.error.search')]: true,
    });
    expect(isSearchError(foreign)).toBe(true);
    expect(isSearchError(new Error('x'))).toBe(false);
    expect(isSearchErrorCode('unavailable')).toBe(true);
    expect(isSearchErrorCode('nope')).toBe(false);
    expect(isSearchErrorCode('toString')).toBe(false);
  });
});

describe('who can reach what', () => {
  it('serves search/query with no session', async () => {
    const response = await handlerWith()(
      post('/search/query', { query: 'hello', options: { limit: 5 } })
    );
    expect(response.status).toBe(200);
  });

  it.each(['upsert', 'replace'])(
    'has no HTTP route for %s, even for an admin',
    async (op) => {
      const handler = handlerWith();
      const response = await handler(post(`/search/${op}`, [], 'admin-token'));
      expect(response.status).toBe(404);
    }
  );
});

describe('save-time indexing', () => {
  const save = (
    handler: ReturnType<typeof handlerWith>,
    extra: {
      branch?: string;
      value?: Record<string, unknown>;
      collection?: string;
      path?: string;
    } = {}
  ) =>
    handler(
      post(
        '/content/update',
        {
          collection: extra.collection ?? 'post',
          path: extra.path ?? 'content/posts/a.mdx',
          value: extra.value ?? { title: 'Hello' },
          branch: extra.branch,
        },
        'editor-token'
      )
    );

  it('upserts one record with the saved values when an editor saves to the default branch', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    const content = contentPlugin();
    const body = [
      'Intro',
      '<Callout>Read this</Callout>',
      '<Note label="hidden" />',
      'Some <b>bold html</b> &amp; more',
    ].join('\n\n');
    const response = await save(handlerWith(content), {
      branch: 'main',
      value: { title: 'Hello', excerpt: '', body },
    });

    expect((await response.json()).hookWarnings).toEqual([]);
    expect(upsert).toHaveBeenCalledTimes(1);
    const [record] = upsert.mock.calls[0][0];
    expect(record).toEqual({
      ref: { collection: 'post', path: 'content/posts/a.mdx' },
      fields: [
        { name: 'title', weight: 3, value: 'Hello' },
        { name: 'body', weight: 1, value: body },
      ],
    });
    const stored = content.stored.get(
      `${record.ref.collection}:${record.ref.path}`
    );
    for (const { name, value } of record.fields) {
      expect(value).toEqual(stored?.[name]);
    }
  });

  it('hands over a non-string value as the content provider returned it', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    const body = {
      type: 'root',
      children: [{ type: 'p', children: [{ text: 'First block' }] }],
    };
    await save(handlerWith(), {
      branch: 'main',
      value: { title: 'Hello', body },
    });
    const field = upsert.mock.calls[0][0][0].fields.find(
      ({ name }) => name === 'body'
    );
    expect(field?.value).toEqual(body);
  });

  it('keeps a whitespace-only value and leaves out a missing, null or empty one', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    await save(handlerWith(), {
      branch: 'main',
      value: { title: '   ', excerpt: null },
    });
    expect(upsert.mock.calls[0][0][0].fields).toEqual([
      { name: 'title', weight: 3, value: '   ' },
    ]);
  });

  it('leaves out a configured field named like an Object.prototype member when the document lacks it, and keeps it when present', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    const protoSearch = defineSearchPlugin({
      name: 'test:proto-search',
      fields: { post: { title: 3, constructor: 1, valueOf: 1 } },
      server: () => import('../../test/in-memory-search.server'),
    });
    await save(handlerWith(contentPlugin(), [protoSearch]), {
      branch: 'main',
      value: { title: 'T' },
    });
    expect(upsert.mock.calls[0][0][0].fields).toEqual([
      { name: 'title', weight: 3, value: 'T' },
    ]);
    await save(handlerWith(contentPlugin(), [protoSearch]), {
      branch: 'main',
      value: { title: 'T', constructor: 'own' },
    });
    expect(upsert.mock.calls[1][0][0].fields).toEqual([
      { name: 'title', weight: 3, value: 'T' },
      { name: 'constructor', weight: 1, value: 'own' },
    ]);
  });

  it('indexes a body the rich-text codec would refuse, as saved', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    const response = await save(handlerWith(), {
      branch: 'main',
      value: { title: 'T', body: '<Callout>unclosed' },
    });
    expect((await response.json()).hookWarnings).toEqual([]);
    expect(upsert.mock.calls[0][0][0].fields).toContainEqual({
      name: 'body',
      weight: 1,
      value: '<Callout>unclosed',
    });
    expect(codecFor).not.toHaveBeenCalled();
  });

  it('finds saved text through the provider', async () => {
    const handler = handlerWith();
    await save(handler, {
      branch: 'main',
      collection: 'note',
      path: 'content/notes/a.md',
      value: { title: 'T', body: 'Water is wet' },
    });
    const response = await handler(
      post('/search/query', { query: 'water', options: { limit: 5 } })
    );
    const hits = await response.json();
    expect(hits).toHaveLength(1);
    expect(hits[0].ref.path).toBe('content/notes/a.md');
  });

  it('leaves an empty source body out of the record', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    await save(handlerWith(), {
      branch: 'main',
      value: { title: 'T', body: '' },
    });
    expect(upsert.mock.calls[0][0][0].fields.map(({ name }) => name)).toEqual([
      'title',
    ]);
  });

  it('indexes the default branch when the caller names none', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    await save(handlerWith());
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it('sends a record with no fields when a save blanks every searchable field', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    await save(handlerWith(), { branch: 'main', value: { title: '' } });
    expect(upsert.mock.calls[0][0][0].fields).toEqual([]);
  });

  it('indexes nothing for a working branch', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    await save(handlerWith(), { branch: 'feature' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('indexes nothing when the content provider cannot name a default branch', async () => {
    const upsert = vi.spyOn(inMemorySearchProvider, 'upsert');
    await save(handlerWith(contentPlugin({ resolveBranch: false })), {
      branch: 'main',
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('keeps the save and warns once when the index update fails', async () => {
    vi.spyOn(inMemorySearchProvider, 'upsert').mockRejectedValue(
      new Error('index down')
    );
    const response = await save(handlerWith(), { branch: 'main' });
    expect(response.status).toBe(200);
    expect((await response.json()).hookWarnings).toEqual([
      'The afterSave hook "searchIndex" failed.',
    ]);
  });
});

describe('provider shape checks', () => {
  it('fails server compose naming the plugin and the missing members', async () => {
    const broken = defineSearchPlugin({
      name: 'test:broken-search',
      fields: { post: { title: 1 } },
      server: async () => ({
        default: { query: async () => [] } as never,
      }),
    });
    const handler = createRpcHandler({
      plugins: [contentPlugin().plugin, broken],
      schema: { collections },
    });
    const response = await handler(
      post('/search/query', { query: 'a', options: { limit: 1 } })
    );
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe('runtime-compose-failed');
    const logged = vi
      .mocked(console.error)
      .mock.calls.flat()
      .map(String)
      .join();
    expect(logged).toContain('test:broken-search');
    expect(logged).toContain('`upsert`, `replace`');
  });

  it.each([
    ['no search function', () => ({})],
    ['a search that is not a function', () => ({ search: 'nope' })],
  ])('fails client boot for a slice with %s', async (_name, slice) => {
    const plugin = definePlugin({
      name: 'test:hand-written',
      provides: ['search'],
      client: async () => ({ default: { slice } }),
    });
    const resolved = await resolveClientSegments([plugin]);
    expect(() => createTinaStore(resolved)).toThrow(
      /search-provider-shape.*test:hand-written.*`search`/
    );
  });
});

describe('filter keys', () => {
  const rawQuery = (filters: string) =>
    new Request('http://tina.local/api/tina/search/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: `{"query":"x","options":{"limit":5,"filters":${filters}}}`,
    });

  it('passes a __proto__ key to the provider as an own key with its value', async () => {
    const query = vi
      .spyOn(inMemorySearchProvider, 'query')
      .mockResolvedValue([]);
    const response = await handlerWith()(
      rawQuery('{"__proto__":"x","tag":"a"}')
    );
    expect(response.status).toBe(200);
    const filters = query.mock.calls[0][0].filters;
    expect(Object.keys(filters ?? {})).toEqual(['__proto__', 'tag']);
    expect(Object.getOwnPropertyDescriptor(filters, '__proto__')?.value).toBe(
      'x'
    );
  });

  it('answers 422 unsupported when the provider cannot apply a __proto__ filter', async () => {
    const response = await handlerWith()(rawQuery('{"__proto__":"x"}'));
    expect(response.status).toBe(422);
    expect((await response.json()).error.code).toBe('unsupported');
  });

  it('keeps the key through createSearchClient', async () => {
    const query = vi
      .spyOn(inMemorySearchProvider, 'query')
      .mockResolvedValue([]);
    const { search } = createSearchClient({
      rpcUrl: '/api/tina',
      fetch: routeFetchTo(handlerWith()),
    });
    await search('x', { limit: 5, filters: JSON.parse('{"__proto__":"x"}') });
    expect(Object.keys(query.mock.calls[0][0].filters ?? {})).toEqual([
      '__proto__',
    ]);
  });
});
