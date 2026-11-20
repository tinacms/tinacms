import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import {
  type ContentProvider,
  ContentError,
  type DocumentEntry,
  type DocumentSummary,
} from '../core/content/contract';
import type { TinaStoreState } from '../core/plugin';
import type { CollectionSchema, ValidatorRef } from '../core/schema/types';
import { t } from '../index';
import {
  contentKeys,
  useCollectionDocuments,
  useDocument,
  useSaveDocument,
} from './content-queries';
import { type TinaRuntime, TinaRuntimeContext } from './context';
import { connectionOf } from '../test/connection';

const ENTRIES: DocumentEntry[] = [
  { path: 'content/posts/hello.mdx', document: { title: 'Hello' } },
  { path: 'content/posts/second.mdx', document: { title: 'Second' } },
];

const SUMMARIES: DocumentSummary[] = ENTRIES.map(({ path }) => ({ path }));

const renderWithContent = (
  provider: ContentProvider,
  collections: CollectionSchema[] = [],
  serverHooks: ReadonlySet<string> = new Set(),
  rpcUrl = '/api/tina',
  customValidators: ReadonlySet<string> = new Set()
) => {
  const store = createStore<TinaStoreState>()(() => ({
    content: provider as unknown as Record<string, unknown>,
  }));
  const runtime = {
    store,
    schema: { collections },
    serverHooks,
    customValidators,
    rpcUrl,
  } as unknown as TinaRuntime;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
    </QueryClientProvider>
  );
  return { wrapper, queryClient };
};

const stubProvider = (
  overrides: Partial<ContentProvider> = {}
): ContentProvider => ({
  list: vi.fn(async () => connectionOf(SUMMARIES)),
  get: vi.fn(async () => ENTRIES[0]),
  update: vi.fn(async (_collection, path, value) => ({
    path,
    document: value,
  })),
  ...overrides,
});

describe('useCollectionDocuments', () => {
  it('reads the collection through the capability', async () => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(() => useCollectionDocuments('post'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.documents).toEqual(SUMMARIES));
    expect(provider.list).toHaveBeenCalledWith('post');
  });

  it('names the documents without carrying their content', async () => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(() => useCollectionDocuments('post'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.documents).toHaveLength(2));
    for (const summary of result.current.documents) {
      expect(Object.keys(summary)).toEqual(['path']);
    }
  });

  it('reads nothing and reports no load without a collection', async () => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(() => useCollectionDocuments(undefined), {
      wrapper,
    });

    expect(result.current.documents).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(provider.list).not.toHaveBeenCalled();
  });

  it('returns the same empty list identity across renders', () => {
    const { wrapper } = renderWithContent(stubProvider());
    const { result, rerender } = renderHook(
      () => useCollectionDocuments(undefined),
      { wrapper }
    );
    const first = result.current.documents;
    rerender();
    expect(result.current.documents).toBe(first);
  });

  it('surfaces a failed read instead of an empty collection', async () => {
    const provider = stubProvider({
      list: vi.fn(async () => {
        throw new Error('data layer offline');
      }),
    });
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(() => useCollectionDocuments('post'), {
      wrapper,
    });

    await waitFor(() =>
      expect(result.current.error?.message).toBe('data layer offline')
    );
    expect(result.current.documents).toEqual([]);
  });
});

describe('useDocument', () => {
  it('reads one document through the capability', async () => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(
      () => useDocument('post', 'content/posts/hello.mdx'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.entry).toEqual(ENTRIES[0]));
    expect(provider.get).toHaveBeenCalledWith(
      'post',
      'content/posts/hello.mdx'
    );
  });

  it('reads nothing and reports no load without a path', async () => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(() => useDocument('post', undefined), {
      wrapper,
    });

    expect(result.current.entry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(provider.get).not.toHaveBeenCalled();
  });

  it('reports no entry for a document the data layer does not have', async () => {
    const provider = stubProvider({ get: vi.fn(async () => null) });
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(
      () => useDocument('post', 'content/posts/ghost.mdx'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toBeNull();
  });

  it('surfaces a failed read', async () => {
    const provider = stubProvider({
      get: vi.fn(async () => {
        throw new Error('cannot parse the file');
      }),
    });
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(
      () => useDocument('post', 'content/posts/broken.mdx'),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.error?.message).toBe('cannot parse the file')
    );
    expect(result.current.entry).toBeNull();
  });
});

describe('useSaveDocument', () => {
  it('keeps the stored content out of the cached list, and in the document', async () => {
    const persisted: DocumentEntry = {
      path: 'content/posts/hello.mdx',
      document: { title: 'Renamed', category: 'not-in-schema' },
    };
    const provider = stubProvider({ update: vi.fn(async () => persisted) });
    const { wrapper, queryClient } = renderWithContent(provider);
    const { result } = renderHook(
      () => ({
        list: useCollectionDocuments('post'),
        saving: useSaveDocument(),
      }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.list.documents).toEqual(SUMMARIES)
    );
    await result.current.saving.save({
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Renamed' },
    });

    await waitFor(() =>
      expect(result.current.list.documents).toEqual(SUMMARIES)
    );
    expect(
      queryClient.getQueryData(
        contentKeys.document('post', 'content/posts/hello.mdx')
      )
    ).toEqual(persisted);
    expect(provider.list).toHaveBeenCalledTimes(1);
  });

  it('keeps the summary fields the save returned in the cached list and the document', async () => {
    const summary: DocumentSummary = {
      path: 'content/posts/hello.mdx',
      title: 'Renamed',
      updatedAt: '2026-01-02T03:04:05.000Z',
      lastAuthor: { name: 'Ada' },
    };
    const persisted: DocumentEntry = {
      ...summary,
      document: { title: 'Renamed' },
    };
    const provider = stubProvider({ update: vi.fn(async () => persisted) });
    const { wrapper, queryClient } = renderWithContent(provider);
    const { result } = renderHook(
      () => ({
        list: useCollectionDocuments('post'),
        saving: useSaveDocument(),
      }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.list.documents).toEqual(SUMMARIES)
    );
    await result.current.saving.save({
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Renamed' },
    });

    await waitFor(() =>
      expect(result.current.list.documents).toStrictEqual([
        summary,
        SUMMARIES[1],
      ])
    );
    expect(
      queryClient.getQueryData(
        contentKeys.document('post', 'content/posts/hello.mdx')
      )
    ).toEqual(persisted);
  });

  it('appends the path when it is not in the cached list', async () => {
    const persisted: DocumentEntry = {
      path: 'content/posts/new.mdx',
      document: { title: 'New' },
    };
    const provider = stubProvider({ update: vi.fn(async () => persisted) });
    const { wrapper, queryClient } = renderWithContent(provider);
    const { result } = renderHook(
      () => ({
        list: useCollectionDocuments('post'),
        saving: useSaveDocument(),
      }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.list.documents).toEqual(SUMMARIES)
    );
    await result.current.saving.save({
      collection: 'post',
      path: 'content/posts/new.mdx',
      value: { title: 'New' },
    });

    await waitFor(() =>
      expect(result.current.list.documents).toEqual([
        ...SUMMARIES,
        { path: 'content/posts/new.mdx' },
      ])
    );
    expect(
      queryClient.getQueryData(
        contentKeys.document('post', 'content/posts/new.mdx')
      )
    ).toEqual(persisted);
  });

  it('rejects when the write does', async () => {
    const provider = stubProvider({
      update: vi.fn(async () => {
        throw new Error('update failed (500)');
      }),
    });
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(() => useSaveDocument(), { wrapper });

    await expect(
      result.current.save({
        collection: 'post',
        path: 'content/posts/hello.mdx',
        value: {},
      })
    ).rejects.toThrow(/update failed \(500\)/);
  });
});

describe('useSaveDocument on a collection with a server hook', () => {
  const post: CollectionSchema = {
    name: 'post',
    format: 'mdx',
    hooks: [{ name: 'guard' }],
    fields: [],
  };
  const tag: CollectionSchema = { name: 'tag', format: 'json', fields: [] };

  const renderServerHooked = (rpcUrl?: string) => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(
      provider,
      [post, tag],
      new Set(['guard']),
      rpcUrl
    );
    const { result } = renderHook(() => useSaveDocument(), { wrapper });
    return { provider, save: result.current.save };
  };

  const stubRoute = (respond: () => Response | Promise<Response>) => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      respond()
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  afterEach(() => vi.unstubAllGlobals());

  it('saves a server-hooked collection through content/update, and any other straight to the provider', async () => {
    const fetchMock = stubRoute(() =>
      Response.json({
        entry: { path: 'content/posts/a.mdx', document: { title: 'A' } },
        hookWarnings: [],
      })
    );
    const { provider, save } = renderServerHooked();

    await save({ collection: 'tag', path: 'content/tags/t.json', value: {} });
    expect(provider.update).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();

    const saved = await save({
      collection: 'post',
      path: 'content/posts/a.mdx',
      value: { title: 'A' },
    });
    expect(provider.update).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/tina/content/update');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      collection: 'post',
      path: 'content/posts/a.mdx',
      value: { title: 'A' },
    });
    expect(saved).toEqual({
      path: 'content/posts/a.mdx',
      document: { title: 'A' },
      hookWarnings: [],
    });
  });

  it('fails with the server-route error when the site server answers 404, and never writes directly', async () => {
    stubRoute(() => new Response('Not found', { status: 404 }));
    const { provider, save } = renderServerHooked();

    const rejection = save({
      collection: 'post',
      path: 'content/posts/a.mdx',
      value: {},
    });
    await expect(rejection).rejects.toBeInstanceOf(ContentError);
    await expect(rejection).rejects.toThrow(
      "This collection runs checks on the site's server, so it needs the site's server route."
    );
    expect(provider.update).not.toHaveBeenCalled();
  });

  it('reports an unreachable site server as a network failure', async () => {
    stubRoute(() => {
      throw new TypeError('Failed to fetch');
    });
    const { provider, save } = renderServerHooked();
    await expect(
      save({ collection: 'post', path: 'content/posts/a.mdx', value: {} })
    ).rejects.toMatchObject({ code: 'network' });
    expect(provider.update).not.toHaveBeenCalled();
  });

  it("passes a provider's refusal through with its code", async () => {
    stubRoute(() =>
      Response.json(
        { error: { code: 'branch-not-found', message: 'gone' } },
        { status: 422 }
      )
    );
    const { save } = renderServerHooked();
    await expect(
      save({ collection: 'post', path: 'content/posts/a.mdx', value: {} })
    ).rejects.toMatchObject({ code: 'branch-not-found' });
  });

  it("shows a hook's rejection message", async () => {
    stubRoute(() =>
      Response.json(
        {
          error: { code: 'hook-rejected', message: 'Only admins can publish' },
        },
        { status: 422 }
      )
    );
    const { save } = renderServerHooked();

    await expect(
      save({ collection: 'post', path: 'content/posts/a.mdx', value: {} })
    ).rejects.toMatchObject({
      code: 'hook-rejected',
      message: 'Only admins can publish',
    });
  });
});

describe('useSaveDocument on a collection with a custom validator', () => {
  const field = (name: string, rest: { validators?: ValidatorRef[] } = {}) =>
    t.string({ name, ...rest });
  const custom = [{ name: 'acme.after' }];
  const collection = (name: string, fields: CollectionSchema['fields']) =>
    ({ name, format: 'mdx', fields }) satisfies CollectionSchema;
  const collections = [
    collection('top', [field('a', { validators: custom })]),
    collection('nested', [
      t.object({ name: 'seo', fields: [field('a', { validators: custom })] }),
    ]),
    collection('item', [
      t.array({ name: 'tags', of: field('tag', { validators: custom }) }),
    ]),
    collection('blocks', [
      t.array({
        name: 'blocks',
        templates: [
          { name: 'hero', fields: [field('a')] },
          { name: 'cta', fields: [field('a', { validators: custom })] },
        ],
      }),
    ]),
    collection('builtin', [field('a', { validators: [{ name: 'required' }] })]),
    collection('overridden', [
      field('a', { validators: [{ name: 'required' }] }),
    ]),
  ];

  const render = (customNames: string[]) => {
    const provider = stubProvider();
    const { wrapper } = renderWithContent(
      provider,
      collections,
      new Set(),
      '/api/tina',
      new Set(customNames)
    );
    return { provider, ...renderHook(() => useSaveDocument(), { wrapper }) };
  };
  const stubRoute = (respond: () => Response) => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      respond()
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  afterEach(() => vi.unstubAllGlobals());

  it.each(['top', 'nested', 'item', 'blocks'])(
    'routes %s through content/update at any depth, even with no values',
    async (name) => {
      const fetchMock = stubRoute(() =>
        Response.json({
          entry: { path: 'p.mdx', document: {} },
          hookWarnings: [],
        })
      );
      const { provider, result } = render(['acme.after']);
      await result.current.save({ collection: name, path: 'p.mdx', value: {} });
      expect(fetchMock.mock.calls[0][0]).toBe('/api/tina/content/update');
      expect(provider.update).not.toHaveBeenCalled();
    }
  );

  it('writes straight to the provider while only built-in validators are listed', async () => {
    const fetchMock = stubRoute(() => new Response('no', { status: 500 }));
    const { provider, result } = render(['acme.after']);
    await result.current.save({
      collection: 'builtin',
      path: 'p.mdx',
      value: {},
    });
    expect(provider.update).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('routes a built-in name that another plugin overrides', async () => {
    const fetchMock = stubRoute(() =>
      Response.json({
        entry: { path: 'p.mdx', document: {} },
        hookWarnings: [],
      })
    );
    const { result } = render(['required']);
    await result.current.save({
      collection: 'overridden',
      path: 'p.mdx',
      value: {},
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('turns a 422 validation answer into a ContentError with its field errors', async () => {
    stubRoute(() =>
      Response.json(
        {
          error: {
            code: 'validation',
            message: 'Some fields are not valid. Fix them and try again.',
            fieldErrors: {
              'authors.1.alias': ['Must differ'],
              '': ['dropped'],
              bad: 'not a list',
              also: [1],
            },
          },
        },
        { status: 422 }
      )
    );
    const { result } = render(['acme.after']);
    const rejection = result.current.save({
      collection: 'top',
      path: 'p.mdx',
      value: {},
    });
    await expect(rejection).rejects.toMatchObject({
      code: 'validation',
      fieldErrors: { 'authors.1.alias': ['Must differ'] },
    });
  });

  it('keeps the validation code when no field error is valid', async () => {
    stubRoute(() =>
      Response.json(
        {
          error: {
            code: 'validation',
            message: 'x',
            fieldErrors: { '': ['a'] },
          },
        },
        { status: 422 }
      )
    );
    const { result } = render(['acme.after']);
    const rejection = result.current.save({
      collection: 'top',
      path: 'p.mdx',
      value: {},
    });
    await expect(rejection).rejects.toMatchObject({ code: 'validation' });
    await expect(rejection).rejects.toHaveProperty('fieldErrors', undefined);
  });

  it('fails a new document with server-route-missing when the Backend has no create op, and writes nothing', async () => {
    const fetchMock = stubRoute(
      () => new Response('Not found', { status: 404 })
    );
    const { provider, result } = render(['acme.after']);
    await expect(
      result.current.save({
        collection: 'top',
        path: 'p.mdx',
        value: {},
        isNew: true,
      })
    ).rejects.toMatchObject({ code: 'server-route-missing' });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/tina/content/create');
    expect(provider.update).not.toHaveBeenCalled();
    expect(provider.create).toBeUndefined();
  });

  it('fails with the server-route error on a site with no server route, and never writes directly', async () => {
    stubRoute(() => new Response('Not found', { status: 404 }));
    const { provider, result } = render(['acme.after']);
    await expect(
      result.current.save({ collection: 'top', path: 'p.mdx', value: {} })
    ).rejects.toMatchObject({ code: 'server-route-missing' });
    expect(provider.update).not.toHaveBeenCalled();
  });
});
