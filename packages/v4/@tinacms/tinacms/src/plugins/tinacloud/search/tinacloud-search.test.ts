import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CollectionSchema } from '../../../core/schema/types';
import { toUserId } from '../../../core/auth/contract';
import { definePlugin, resolveClientSegments } from '../../../core/plugin';
import { validateCapabilityGraph } from '../../../core/resolve';
import { createRpcHandler } from '../../../rpc/handler';
import { createSearchClient } from '../../search/search.client';
import { defineSearchPlugin } from '../../search/search.plugin';
import { createTinaStore } from '../../../store/create-store';
import { isSearchProvider } from '../../../core/search/contract';
import { tinaCloudUser } from '../../../test/tinacloud-login';
import { TINACLOUD_CONTENT_URL, TINACLOUD_IDENTITY_URL } from '../client';
import { tinaCloud } from '../tinacloud.plugin';

const collections: CollectionSchema[] = [
  {
    name: 'post',
    path: 'content/posts/',
    format: 'mdx',
    fields: [{ name: 'title', type: 'string' }],
  },
  {
    name: 'page',
    path: 'content/pages',
    format: 'mdx',
    fields: [{ name: 'title', type: 'string' }],
  },
];

const plugin = () =>
  tinaCloud({ clientId: 'abc', search: { fields: { post: { title: 1 } } } });

const ids = (...names: string[]) => ({
  results: names.map((_id) => ({ _id })),
});

interface Stub {
  project?: unknown | (() => Response | Promise<Response>);
  search?: unknown | (() => Response | Promise<Response>);
}

const respond = (value: unknown): Response | Promise<Response> =>
  typeof value === 'function'
    ? (value as () => Response | Promise<Response>)()
    : Response.json(value);

/** A mocked TinaCloud. Nothing here has been checked against the live route. */
const stubTinaCloud = ({
  project = { defaultBranch: 'main' },
  search = ids(),
}: Stub = {}) => {
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.startsWith(`${TINACLOUD_CONTENT_URL}/v2/searchIndex/`)) {
      return respond(search);
    }
    if (url.endsWith('/currentUser')) return Response.json(tinaCloudUser);
    if (url.startsWith(TINACLOUD_IDENTITY_URL)) {
      // The session check reads `role`; the branch lookup reads `defaultBranch`.
      const body = respond(project);
      if (body instanceof Response) return body;
      return body.then((response) =>
        response.ok
          ? Response.json({ role: 'admin', ...(project as object) })
          : response
      );
    }
    return Response.json({});
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const searchCalls = (fetchMock: ReturnType<typeof stubTinaCloud>) =>
  fetchMock.mock.calls.filter(([url]) =>
    url.startsWith(`${TINACLOUD_CONTENT_URL}/v2/searchIndex/`)
  );

const projectCalls = (fetchMock: ReturnType<typeof stubTinaCloud>) =>
  fetchMock.mock.calls.filter(
    ([url]) =>
      url.startsWith(`${TINACLOUD_IDENTITY_URL}/v2/apps/abc`) &&
      !url.endsWith('/currentUser')
  );

const bearerOf = (init?: RequestInit) =>
  new Headers(init?.headers).get('authorization');

const handlerFor = (plugins = [plugin()], withSchema = true) =>
  createRpcHandler({
    plugins,
    ...(withSchema && { schema: { collections } }),
  });

const query = (
  handler: ReturnType<typeof handlerFor>,
  options: Record<string, unknown> = { limit: 10 },
  token: string | null = 'editor-jwt',
  text = 'hello'
) =>
  handler(
    new Request('http://tina.local/api/tina/search/query', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query: text, options }),
    })
  );

const searchUrlOf = (fetchMock: ReturnType<typeof stubTinaCloud>, at = 0) =>
  new URL(searchCalls(fetchMock)[at][0]);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('tinaCloud() search: manifest', () => {
  it('provides no search without the option (AC1)', async () => {
    const manifest = tinaCloud({ clientId: 'abc' });
    expect(manifest.provides).toEqual(['media', 'auth', 'content']);
    expect(manifest).not.toHaveProperty('search');
    const store = createTinaStore(await resolveClientSegments([manifest]));
    expect(store.getState().search).toBeUndefined();
    stubTinaCloud();
    expect((await query(handlerFor([manifest]))).status).toBe(404);
  });

  it('provides search with its fields, and the store mounts it (AC2)', async () => {
    const manifest = plugin();
    expect(manifest.provides).toEqual(['media', 'auth', 'content', 'search']);
    expect(manifest.search).toEqual({ fields: { post: { title: 1 } } });
    expect(manifest.hooks).toBeUndefined();
    const store = createTinaStore(await resolveClientSegments([manifest]));
    expect(isSearchProvider(store.getState().search)).toBe(true);
  });

  it('conflicts with another search plugin, which wins with an override (AC2)', async () => {
    const other = (overrides?: { capability: 'search' }[]) =>
      defineSearchPlugin({
        name: 'test:other',
        fields: { post: { title: 1 } },
        server: async () => ({
          default: {
            query: vi.fn(async () => []),
            upsert: async () => {},
            replace: async () => {},
          },
        }),
        overrides,
      });
    expect(() => validateCapabilityGraph([plugin(), other()])).toThrow();

    const fetchMock = stubTinaCloud();
    const handler = handlerFor([plugin(), other([{ capability: 'search' }])]);
    expect((await query(handler)).status).toBe(200);
    expect(searchCalls(fetchMock)).toHaveLength(0);
  });
});

describe('tinaCloud() search: query', () => {
  it('sends the lookup and one search with the caller token and maps hits (AC5, AC6, AC7)', async () => {
    const fetchMock = stubTinaCloud({
      search: ids(
        'post:hello.mdx',
        'post:2024/a.mdx',
        'post:a:b.mdx',
        'page:home.mdx',
        'post:hello.mdx',
        'nope:x.mdx',
        'no-colon'
      ),
    });
    const response = await query(handlerFor());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        ref: { collection: 'post', path: 'content/posts/hello.mdx' },
        score: 1,
        snippet: '',
      },
      {
        ref: { collection: 'post', path: 'content/posts/2024/a.mdx' },
        score: 1 / 2,
        snippet: '',
      },
      {
        ref: { collection: 'post', path: 'content/posts/a:b.mdx' },
        score: 1 / 3,
        snippet: '',
      },
    ]);
    const lookups = projectCalls(fetchMock);
    expect(lookups.length).toBeGreaterThan(0);
    for (const [, init] of [...lookups, ...searchCalls(fetchMock)]) {
      expect(bearerOf(init)).toBe('Bearer editor-jwt');
    }
    expect(searchCalls(fetchMock)).toHaveLength(1);
    const url = searchUrlOf(fetchMock);
    expect(url.pathname).toBe('/v2/searchIndex/abc/main');
    expect(url.searchParams.get('query')).toBe('hello');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.has('collection')).toBe(false);
  });

  it('encodes the branch as one segment and the query as one param (AC22)', async () => {
    const fetchMock = stubTinaCloud({
      project: { defaultBranch: 'feature/x y' },
    });
    await query(handlerFor(), { limit: 5 }, 'editor-jwt', '  a&b #c ');
    const [[raw]] = searchCalls(fetchMock);
    expect(raw).toContain('/abc/feature%2Fx%20y?');
    expect(searchUrlOf(fetchMock).searchParams.get('query')).toBe('a&b #c');
  });

  it('narrows to one collection and refuses two or filters (AC8)', async () => {
    const fetchMock = stubTinaCloud();
    const handler = handlerFor([
      tinaCloud({
        clientId: 'abc',
        search: { fields: { post: { title: 1 }, page: { title: 1 } } },
      }),
    ]);
    await query(handler, { limit: 5, collections: ['post'] });
    expect(searchUrlOf(fetchMock).searchParams.get('collection')).toBe('post');

    const before = searchCalls(fetchMock).length;
    const two = await query(handler, {
      limit: 5,
      collections: ['post', 'page'],
    });
    expect(two.status).toBe(422);
    const filtered = await query(handler, { limit: 5, filters: { a: 'b' } });
    expect(filtered.status).toBe(422);
    expect(searchCalls(fetchMock)).toHaveLength(before);

    const unknown = await query(handlerFor(), {
      limit: 5,
      collections: ['page'],
    });
    expect(unknown.status).toBe(422);
  });
});

describe('tinaCloud() search: paging', () => {
  const many = Array.from({ length: 25 }, (_, i) => `post:p${i}.mdx`);
  const refOf = (i: number) =>
    JSON.stringify({ collection: 'post', path: `content/posts/p${i}.mdx` });

  it('returns the hits after the cursor, scanning a 1,000 window (AC9)', async () => {
    const fetchMock = stubTinaCloud({ search: ids(...many) });
    const handler = handlerFor();
    const page = await (
      await query(handler, { limit: 10, cursor: refOf(9) })
    ).json();
    expect(page.map((hit: { ref: { path: string } }) => hit.ref.path)).toEqual(
      Array.from({ length: 10 }, (_, i) => `content/posts/p${i + 10}.mdx`)
    );
    expect(searchUrlOf(fetchMock).searchParams.get('limit')).toBe('1000');
    expect(searchUrlOf(fetchMock).searchParams.has('cursor')).toBe(false);
  });

  it('returns [] after the last hit and refuses an unknown cursor (AC9)', async () => {
    stubTinaCloud({ search: ids(...many) });
    const handler = handlerFor();
    const last = await query(handler, { limit: 10, cursor: refOf(24) });
    expect(await last.json()).toEqual([]);
    const lost = await query(handler, { limit: 10, cursor: refOf(99) });
    expect(lost.status).toBe(422);
    expect((await lost.json()).error.code).toBe('invalid-query');
  });

  it('never returns more than limit on the first page (AC9)', async () => {
    stubTinaCloud({ search: ids(...many) });
    const hits = await (await query(handlerFor(), { limit: 3 })).json();
    expect(hits).toHaveLength(3);
  });

  it('pages to the end when TinaCloud also returns hits outside fields (AC6)', async () => {
    const mixed = [
      'post:a.mdx',
      'page:x.mdx',
      'post:b.mdx',
      'page:y.mdx',
      'post:c.mdx',
    ];
    stubTinaCloud({ search: ids(...mixed) });
    const handler = handlerFor();
    const first = await (await query(handler, { limit: 2 })).json();
    expect(first).toHaveLength(2);
    const second = await query(handler, {
      limit: 2,
      cursor: JSON.stringify(first[1].ref),
    });
    expect(second.status).toBe(200);
    expect(await second.json()).toHaveLength(1);
  });
});

describe('tinaCloud() search: refusals', () => {
  it('answers 503 unavailable with no token and calls no TinaCloud (AC10, AC13)', async () => {
    const fetchMock = stubTinaCloud();
    const response = await query(handlerFor(), { limit: 5 }, null);
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('unavailable');
    expect(searchCalls(fetchMock)).toHaveLength(0);
    expect(projectCalls(fetchMock)).toHaveLength(0);
  });

  it("never forwards another auth provider's token (AC19)", async () => {
    const fetchMock = stubTinaCloud();
    const otherAuth = definePlugin({
      name: 'test:auth',
      provides: ['auth'],
      overrides: [{ capability: 'auth' }],
      server: async () => ({
        default: {
          getSession: async () => ({
            identity: { id: toUserId('x') },
            roles: ['editor'],
          }),
        },
      }),
    });
    const handler = handlerFor([plugin(), otherAuth]);
    const response = await query(handler, { limit: 5 }, 'foreign-token');
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers backend-failure with no schema, never 200 [] (AC20)', async () => {
    const fetchMock = stubTinaCloud();
    const response = await query(handlerFor([plugin()], false), { limit: 5 });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe('backend-failure');
    expect(searchCalls(fetchMock)).toHaveLength(0);
  });

  it('uses the configured client id and does not retry after a 403 (AC12)', async () => {
    const fetchMock = stubTinaCloud({
      search: () => new Response('no', { status: 403 }),
    });
    const response = await query(handlerFor(), { limit: 5 });
    expect(response.status).toBe(503);
    expect(searchCalls(fetchMock)).toHaveLength(1);
    expect(
      searchUrlOf(fetchMock).pathname.startsWith('/v2/searchIndex/abc/')
    ).toBe(true);
  });
});

describe('tinaCloud() search: failures (AC11, AC21)', () => {
  const secret = 'SECRET-BODY-TEXT';
  const status = (code: number) => () => new Response(secret, { status: code });

  it.each([
    ['502', status(502), 503, 'unavailable'],
    ['503', status(503), 503, 'unavailable'],
    ['504', status(504), 503, 'unavailable'],
    ['401', status(401), 503, 'unavailable'],
    ['403', status(403), 503, 'unavailable'],
    ['400', status(400), 502, 'backend-failure'],
    ['500', status(500), 502, 'backend-failure'],
    ['unknown body', () => Response.json({ other: 1 }), 502, 'backend-failure'],
    [
      'network failure',
      () => {
        throw new TypeError('fetch failed');
      },
      503,
      'unavailable',
    ],
  ])('search call: %s', async (_name, search, httpStatus, code) => {
    stubTinaCloud({ search });
    const response = await query(handlerFor(), { limit: 5 });
    expect(response.status).toBe(httpStatus);
    const text = await response.text();
    expect(JSON.parse(text).error.code).toBe(code);
    expect(text).not.toContain(secret);
    expect(text).not.toContain('editor-jwt');
  });

  it.each([
    ['502', status(502), 'unavailable'],
    ['403', status(403), 'unavailable'],
    ['400', status(400), 'backend-failure'],
    ['500', status(500), 'backend-failure'],
    ['unknown body', () => Response.json([1]), 'backend-failure'],
    ['no default branch', () => Response.json({}), 'backend-failure'],
  ])('project lookup: %s sends no search', async (_name, project, code) => {
    const fetchMock = stubTinaCloud({ project });
    const response = await query(handlerFor(), { limit: 5 });
    expect((await response.json()).error.code).toBe(code);
    expect(searchCalls(fetchMock)).toHaveLength(0);
  });

  it('gives every TinaCloud call an abort signal and maps an abort to unavailable', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    const fetchMock = stubTinaCloud({
      search: () => {
        throw new DOMException('aborted', 'TimeoutError');
      },
    });
    const response = await query(handlerFor(), { limit: 5 });
    expect((await response.json()).error.code).toBe('unavailable');
    expect(timeout).toHaveBeenCalledWith(10_000);
    const [, init] = searchCalls(fetchMock)[0];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('maps an abort during the body read to unavailable', async () => {
    stubTinaCloud({
      search: () =>
        ({
          ok: true,
          status: 200,
          text: async () => {
            throw new DOMException('aborted', 'TimeoutError');
          },
        }) as unknown as Response,
    });
    const response = await query(handlerFor(), { limit: 5 });
    expect((await response.json()).error.code).toBe('unavailable');
  });
});

describe('tinaCloud() search: index writes (AC16)', () => {
  it('has no HTTP route for upsert or replace, and in-process calls send nothing', async () => {
    const fetchMock = stubTinaCloud();
    const handler = handlerFor();
    for (const op of ['upsert', 'replace', 'searchIndex']) {
      for (const namespace of ['search', 'content']) {
        const response = await handler(
          new Request(`http://tina.local/api/tina/${namespace}/${op}`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: 'Bearer editor-jwt',
            },
            body: '[]',
          })
        );
        expect(response.status).toBe(404);
      }
    }
    const { createTinaCloudSearchProvider } = await import(
      './tinacloud-search.server'
    );
    const provider = createTinaCloudSearchProvider({ clientId: 'abc' }, {});
    await provider.upsert([]);
    await provider.replace([]);
    expect(searchCalls(fetchMock)).toHaveLength(0);
  });
});

describe('createSearchClient token (AC14, AC15)', () => {
  const sent = async (getToken?: () => string | undefined) => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json([])
    );
    await createSearchClient({
      rpcUrl: '/api/tina',
      getToken,
      fetch: fetchMock as unknown as typeof fetch,
    }).search('x', { limit: 1 });
    return new Headers(fetchMock.mock.calls[0][1]?.headers).get(
      'authorization'
    );
  };

  it('sends a bearer token only when it has a getter', async () => {
    expect(await sent(() => 'tok')).toBe('Bearer tok');
    expect(await sent()).toBeNull();
  });

  it('sends no token, and rejects unavailable, when another plugin overrides auth', async () => {
    const fetchMock = stubTinaCloud();
    const otherAuth = definePlugin({
      name: 'test:auth',
      provides: ['auth'],
      overrides: [{ capability: 'auth' }],
      client: async () => ({
        default: {
          slice: () => ({
            status: 'signed-out',
            user: null,
            getToken: async () => undefined,
            login: async () => {},
            logout: async () => {},
          }),
        },
      }),
    });
    const store = createTinaStore(
      await resolveClientSegments([plugin(), otherAuth])
    );
    const slice = store.getState().search;
    if (!isSearchProvider(slice)) throw new Error('no search slice');
    // The store posts to /api/tina, which this stub answers with the server's refusal.
    fetchMock.mockImplementation(async (_url, init) =>
      Response.json(
        { error: { code: 'unavailable', message: 'x' } },
        { status: bearerOf(init) ? 200 : 503 }
      )
    );
    await expect(slice.search('x', { limit: 1 })).rejects.toMatchObject({
      code: 'unavailable',
    });
    expect(bearerOf(fetchMock.mock.calls[0][1])).toBeNull();
  });
});
