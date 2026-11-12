import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import type { AuthSlice, UserId } from '../core/auth/contract';
import {
  type ContentProvider,
  ContentError,
  type DocumentEntry,
} from '../core/content/contract';
import type { FieldRegistry } from '../core/field/registry';
import type { TinaStoreState } from '../core/plugin';
import type { CollectionSchema, FieldSchema } from '../core/schema/types';
import { readDraft, writeDraft } from '../form/drafts';
import {
  readFormStore,
  syncDrafts,
  toFormId,
  toFormValues,
  useFormStore,
} from '../form/form-store';
import { connectionOf } from '../test/connection';
import {
  UnsavedReferrersError,
  useCollectionActions,
  useCollectionCapabilities,
  useDocumentsPage,
  useDraftCounts,
  useNewDocumentDrafts,
} from './collection-documents';
import { contentKeys } from './content-queries';
import { type TinaRuntime, TinaRuntimeContext } from './context';

const POST: CollectionSchema = {
  name: 'post',
  path: 'content/posts',
  format: 'mdx',
  fields: [{ name: 'title', label: 'Title', type: 'string' }],
};

const REFERENCE_TO_POST: FieldSchema = {
  name: 'related',
  label: 'Related',
  type: 'reference',
  collections: ['post'],
};

const LINKING_POST: CollectionSchema = {
  ...POST,
  fields: [...POST.fields, REFERENCE_TO_POST],
};

const PAGE: CollectionSchema = {
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  fields: [
    { name: 'title', label: 'Title', type: 'string' },
    REFERENCE_TO_POST,
  ],
};

const ORIGINAL: DocumentEntry = {
  path: 'content/posts/a/hello.mdx',
  document: { title: 'Hello' },
};

const signedIn = (roles: string[], id = 'u1'): AuthSlice =>
  ({
    status: 'signed-in',
    user: { id: id as UserId },
    roles,
    getToken: async () => undefined,
    login: async () => undefined,
    logout: async () => undefined,
    LoginScreen: () => null,
  }) as unknown as AuthSlice;

const provider = (
  overrides: Partial<ContentProvider> = {}
): ContentProvider => ({
  list: vi.fn(async () => connectionOf([])),
  get: vi.fn(async () => null),
  update: vi.fn(async (_c, path, value) => ({ path, document: value })),
  create: vi.fn(async (_c, path, value) => ({ path, document: value })),
  rename: vi.fn(async (_c, from, to) => ({
    entry: { path: to },
    referrers: [],
  })),
  delete: vi.fn(async () => undefined),
  referrers: vi.fn(async () => []),
  createFolder: vi.fn(async (_c, folder) => ({
    path: folder,
    name: folder,
    documentCount: 0,
  })),
  renameFolder: vi.fn(async (_c, from, to) => ({
    folder: { path: to, name: to, documentCount: 1 },
    moved: [
      {
        from: `content/posts/${from}/hello.mdx`,
        to: `content/posts/${to}/hello.mdx`,
      },
    ],
    referrers: [],
  })),
  deleteFolder: vi.fn(async (_c, folder) => ({
    deleted: [`content/posts/${folder}/hello.mdx`],
  })),
  ...overrides,
});

const setup = (
  content: ContentProvider,
  {
    auth,
    collection = POST,
    collections = [collection],
  }: {
    auth?: AuthSlice;
    collection?: CollectionSchema;
    collections?: CollectionSchema[];
  } = {}
) => {
  const store = createStore<TinaStoreState>()(() => ({
    content: content as unknown as Record<string, unknown>,
    ...(auth ? { auth: auth as unknown as Record<string, unknown> } : {}),
  }));
  const runtime = {
    store,
    schema: { collections },
    registry: { get: () => undefined } as unknown as FieldRegistry,
    serverHooks: new Set<string>(),
    rpcUrl: '/api/tina',
  } as unknown as TinaRuntime;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
    </QueryClientProvider>
  );
  return { wrapper, queryClient, store };
};

const draftOf = (path: string) => readDraft(toFormId(path), undefined);

const keepEditsTo = (path: string, title: string) => {
  const id = toFormId(path);
  const store = readFormStore();
  store.registerForm(id, toFormValues({ title: 'Hello' }));
  store.setFieldValue(id, 'title' as never, title);
};

let stopSyncingDrafts: () => void;

beforeEach(() => {
  useFormStore.setState({ userId: undefined });
  stopSyncingDrafts = syncDrafts();
});

afterEach(() => {
  stopSyncingDrafts();
});

describe('useDocumentsPage', () => {
  it('asks list for one page and keys it under the collection list key', async () => {
    const content = provider({
      list: vi.fn(async () => connectionOf([{ path: 'content/posts/a.mdx' }])),
    });
    const { wrapper, queryClient } = setup(content);
    const query = { folder: 'a', first: 50 };
    const { result } = renderHook(() => useDocumentsPage('post', query), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(content.list).toHaveBeenCalledWith('post', query);
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: contentKeys.list('post') })
    ).toHaveLength(1);
  });
});

describe('useCollectionCapabilities', () => {
  const capabilities = (
    content: ContentProvider,
    options?: Parameters<typeof setup>[1],
    folder = ''
  ) => {
    const { wrapper } = setup(content, options);
    return renderHook(() => useCollectionCapabilities('post', folder), {
      wrapper,
    }).result.current;
  };

  it('allows everything when no auth plugin is mounted', () => {
    expect(capabilities(provider())).toEqual({
      canCreateFolder: true,
      canCreateDocument: true,
      canRename: true,
      canDuplicate: true,
      canDelete: true,
    });
  });

  it('hides an action the provider has no operation for', () => {
    const result = capabilities(
      provider({ rename: undefined, delete: undefined })
    );
    expect(result.canRename).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDuplicate).toBe(true);
  });

  describe('with an auth plugin (session/permissions)', () => {
    const NONE = {
      canCreateFolder: false,
      canCreateDocument: false,
      canRename: false,
      canDuplicate: false,
      canDelete: false,
    };
    const ALL = {
      canCreateFolder: true,
      canCreateDocument: true,
      canRename: true,
      canDuplicate: true,
      canDelete: true,
    };
    const answer = (respond: () => Promise<Response> | Response) => {
      const fetchMock = vi.fn(async () => respond());
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    };
    const capabilitiesOf = (auth: AuthSlice) => {
      const { wrapper, store } = setup(provider(), { auth });
      const hook = renderHook(() => useCollectionCapabilities('post', ''), {
        wrapper,
      });
      return { hook, store };
    };
    afterEach(() => vi.unstubAllGlobals());

    it('shows only Delete to an author whose server role holds only content:delete', async () => {
      answer(() => Response.json(['content:delete']));
      const { hook } = capabilitiesOf(signedIn(['author']));
      await waitFor(() => expect(hook.result.current.canDelete).toBe(true));
      expect(hook.result.current).toEqual({ ...NONE, canDelete: true });
    });

    it('shows every action when the answer grants them', async () => {
      answer(() =>
        Response.json([
          'content:save',
          'content:create',
          'content:rename',
          'content:delete',
        ])
      );
      const { hook } = capabilitiesOf(signedIn(['editor']));
      await waitFor(() => expect(hook.result.current).toEqual(ALL));
    });

    it('shows no action to a role with no permissions', async () => {
      const fetchMock = answer(() => Response.json([]));
      const { hook } = capabilitiesOf(signedIn(['viewer']));
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      await act(async () => {});
      expect(hook.result.current).toEqual(NONE);
    });

    it('shows no action while the answer is pending', async () => {
      const pending = answer(() => new Promise<Response>(() => {}));
      const waiting = capabilitiesOf(signedIn(['editor']));
      await waitFor(() => expect(pending).toHaveBeenCalled());
      expect(waiting.hook.result.current).toEqual(NONE);
    });

    it('falls back to the default role map after the question failed, so the table stays usable', async () => {
      const failing = answer(() =>
        Response.json(
          { error: { code: 'boom', message: 'Server error' } },
          { status: 500 }
        )
      );
      const editor = capabilitiesOf(signedIn(['editor']));
      await waitFor(() => expect(failing).toHaveBeenCalled());
      await waitFor(() =>
        expect(editor.hook.result.current.canDelete).toBe(true)
      );
      expect(editor.hook.result.current.canRename).toBe(true);
      editor.hook.unmount();

      const guest = capabilitiesOf(signedIn(['guest']));
      await waitFor(() => expect(failing).toHaveBeenCalledTimes(2));
      await act(async () => {});
      expect(guest.hook.result.current).toEqual(NONE);
    });

    it.each([
      ['404', () => new Response('', { status: 404 })],
      ['405', () => new Response('', { status: 405 })],
      [
        'a non-JSON body',
        () =>
          new Response('<html></html>', {
            headers: { 'content-type': 'text/html' },
          }),
      ],
    ])(
      'falls back to the default role map when the route answers %s',
      async (_case, respond) => {
        answer(respond);
        const editor = capabilitiesOf(signedIn(['editor']));
        await waitFor(() => expect(editor.hook.result.current).toEqual(ALL));
        editor.hook.unmount();
        const guest = capabilitiesOf(signedIn(['guest']));
        await act(async () => {});
        expect(guest.hook.result.current).toEqual(NONE);
      }
    );

    it('shows every action when the server answers the wildcard', async () => {
      answer(() => Response.json(['*']));
      const { hook } = capabilitiesOf(signedIn(['guest']));
      await waitFor(() => expect(hook.result.current).toEqual(ALL));
    });

    it("never shows the previous user's answer after a switch of user", async () => {
      let release: (response: Response) => void = () => {};
      const fetchMock = answer(() => Response.json(['*']));
      const { hook, store } = capabilitiesOf(signedIn(['admin'], 'ada'));
      await waitFor(() => expect(hook.result.current).toEqual(ALL));

      fetchMock.mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          })
      );
      act(() => {
        store.setState({
          auth: signedIn(['admin'], 'grace') as unknown as Record<
            string,
            unknown
          >,
        });
      });
      expect(hook.result.current).toEqual(NONE);
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      await act(async () => release(Response.json(['content:delete'])));
      await waitFor(() =>
        expect(hook.result.current).toEqual({ ...NONE, canDelete: true })
      );
    });
  });

  it('follows the allowedActions switches', () => {
    const result = capabilities(
      provider(),
      {
        collection: {
          ...POST,
          allowedActions: {
            canDelete: false,
            canDuplicate: false,
            canCreateNestedFolder: false,
          },
        },
      },
      'a'
    );
    expect(result).toMatchObject({
      canDelete: false,
      canDuplicate: false,
      canCreateFolder: false,
      canRename: true,
    });
  });
});

describe('useCollectionActions', () => {
  it('moves the drafts of a renamed document and refreshes the lists', async () => {
    const content = provider();
    const { wrapper, queryClient } = setup(content);
    const from = 'content/posts/a/hello.mdx';
    const to = 'content/posts/a/renamed.mdx';
    keepEditsTo(from, 'Edited');
    expect(draftOf(from)).toBeDefined();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    await act(() => result.current.renameDocument(from, to));
    expect(content.rename).toHaveBeenCalledWith('post', from, to);
    expect(draftOf(from)).toBeUndefined();
    expect(draftOf(to)?.values).toMatchObject({ title: 'Edited' });
    expect(readFormStore().forms[toFormId(to)]).toBeDefined();
    expect(readFormStore().forms[toFormId(from)]).toBeUndefined();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: contentKeys.list('post', undefined),
    });
  });

  it('leaves the drafts alone when the rename fails', async () => {
    const content = provider({
      rename: vi.fn(async () => {
        throw new ContentError('name-taken');
      }),
    });
    const { wrapper } = setup(content);
    const from = 'content/posts/hello.mdx';
    keepEditsTo(from, 'Edited');
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    await expect(
      act(() => result.current.renameDocument(from, 'content/posts/other.mdx'))
    ).rejects.toMatchObject({ code: 'name-taken' });
    expect(draftOf(from)).toBeDefined();
  });

  it('discards every draft of a deleted document', async () => {
    const { wrapper } = setup(provider());
    const path = 'content/posts/hello.mdx';
    keepEditsTo(path, 'Edited');
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    await act(() => result.current.deleteDocument(path));
    expect(draftOf(path)).toBeUndefined();
    expect(readFormStore().forms[toFormId(path)]).toBeUndefined();
  });

  it('keeps the draft when the delete fails', async () => {
    const content = provider({
      delete: vi.fn(async () => {
        throw new ContentError('forbidden');
      }),
    });
    const { wrapper } = setup(content);
    const path = 'content/posts/hello.mdx';
    keepEditsTo(path, 'Edited');
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    await expect(
      act(() => result.current.deleteDocument(path))
    ).rejects.toMatchObject({
      code: 'forbidden',
    });
    expect(draftOf(path)).toBeDefined();
  });

  it('moves the drafts inside a renamed folder, unsaved copies included', async () => {
    const { wrapper } = setup(provider());
    const edited = 'content/posts/a/hello.mdx';
    const copy = 'content/posts/a/copy.mdx';
    keepEditsTo(edited, 'Edited');
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(copy), { title: 'Copy' });
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    await act(() => result.current.renameFolder('a', 'b'));
    expect(draftOf('content/posts/b/hello.mdx')).toBeDefined();
    expect(draftOf('content/posts/b/copy.mdx')?.new).toBe(true);
    expect(draftOf(edited)).toBeUndefined();
    expect(draftOf(copy)).toBeUndefined();
  });

  it('discards the drafts inside a deleted folder, unsaved copies included', async () => {
    const { wrapper } = setup(provider());
    keepEditsTo('content/posts/a/hello.mdx', 'Edited');
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId('content/posts/a/copy.mdx'), {
        title: 'Copy',
      });
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId('content/posts/b/keep.mdx'), {
        title: 'Keep',
      });
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    await act(() => result.current.deleteFolder('a'));
    expect(draftOf('content/posts/a/hello.mdx')).toBeUndefined();
    expect(draftOf('content/posts/a/copy.mdx')).toBeUndefined();
    expect(draftOf('content/posts/b/keep.mdx')).toBeDefined();
  });

  describe('duplicateDocument', () => {
    const duplicate = (content: ContentProvider, to: string) => {
      const { wrapper } = setup(content);
      const { result } = renderHook(() => useCollectionActions('post'), {
        wrapper,
      });
      return act(() => result.current.duplicateDocument(ORIGINAL.path, to));
    };
    const reading = (taken: Record<string, DocumentEntry> = {}) =>
      provider({
        get: vi.fn(async (_c, path) =>
          path === ORIGINAL.path ? ORIGINAL : (taken[path] ?? null)
        ),
      });

    it('stores a new-document draft of the saved original and writes nothing', async () => {
      const content = reading();
      await duplicate(content, 'content/posts/a/hello-copy.mdx');
      const stored = draftOf('content/posts/a/hello-copy.mdx');
      expect(stored).toMatchObject({
        new: true,
        baseline: {},
        values: { title: 'Hello' },
      });
      expect(content.create).not.toHaveBeenCalled();
      expect(content.update).not.toHaveBeenCalled();
    });

    it('refuses a name a file already holds', async () => {
      const taken = { 'content/posts/a/taken.mdx': ORIGINAL };
      await expect(
        duplicate(reading(taken), 'content/posts/a/taken.mdx')
      ).rejects.toMatchObject({ code: 'name-taken' });
    });

    it('refuses a name another unsaved copy holds', async () => {
      useFormStore
        .getState()
        .storeNewDocumentDraft(toFormId('content/posts/a/held.mdx'), {});
      await expect(
        duplicate(reading(), 'content/posts/a/held.mdx')
      ).rejects.toMatchObject({ code: 'name-taken' });
    });

    it.each([
      'content/posts/a/.hidden.mdx',
      'content/posts/a/hello-copy.md',
      'content/posts/b/hello-copy.mdx',
      'content/posts/a/ .mdx',
    ])('refuses the invalid name %s', async (to) => {
      await expect(duplicate(reading(), to)).rejects.toMatchObject({
        code: 'invalid-path',
      });
      expect(draftOf(to)).toBeUndefined();
    });
  });
});

describe('rename guards', () => {
  const actionsFor = (content: ContentProvider) => {
    const { wrapper, queryClient } = setup(content, {
      collections: [LINKING_POST, PAGE],
    });
    const { result } = renderHook(() => useCollectionActions('post'), {
      wrapper,
    });
    return { actions: result, queryClient };
  };
  const target = 'content/posts/a.mdx';
  const referrer = 'content/pages/p.mdx';
  const keepEditsReferencing = (path: string, reference: string) => {
    const id = toFormId(path);
    const store = readFormStore();
    store.registerForm(id, toFormValues({ title: 'Page' }));
    store.setFieldValue(id, 'title' as never, 'Page, edited');
    store.setFieldValue(id, 'related' as never, reference);
  };

  it('refuses a document rename onto an unsaved copy and moves nothing', async () => {
    const content = provider();
    const { actions } = actionsFor(content);
    readFormStore().storeNewDocumentDraft(toFormId('content/posts/b.mdx'), {
      title: 'Copy',
    });
    keepEditsTo('content/posts/c.mdx', 'Edited');
    await expect(
      act(() =>
        actions.current.renameDocument(
          'content/posts/c.mdx',
          'content/posts/b.mdx'
        )
      )
    ).rejects.toMatchObject({ code: 'name-taken' });
    expect(content.rename).not.toHaveBeenCalled();
    expect(draftOf('content/posts/c.mdx')).toBeDefined();
    expect(draftOf('content/posts/b.mdx')?.new).toBe(true);
  });

  it('refuses a folder rename onto a path that holds an unsaved copy', async () => {
    const content = provider();
    const { actions } = actionsFor(content);
    readFormStore().storeNewDocumentDraft(toFormId('content/posts/g/new.mdx'), {
      title: 'Copy',
    });
    await expect(
      act(() => actions.current.renameFolder('f', 'g'))
    ).rejects.toMatchObject({ code: 'name-taken' });
    expect(content.renameFolder).not.toHaveBeenCalled();
  });

  const refused = async (
    attempt: () => Promise<unknown>
  ): Promise<UnsavedReferrersError> => {
    try {
      await act(attempt);
    } catch (cause) {
      if (cause instanceof UnsavedReferrersError) return cause;
      throw cause;
    }
    throw new Error('The rename was not refused.');
  };

  it('lists a referrer with an open dirty form and renames nothing', async () => {
    const content = provider();
    const { actions } = actionsFor(content);
    keepEditsReferencing(referrer, target);
    const error = await refused(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(error.referrers).toEqual([
      { collection: 'page', path: referrer, title: 'Page, edited' },
    ]);
    expect(content.rename).not.toHaveBeenCalled();
    expect(draftOf(referrer)).toBeDefined();
  });

  it('lists a referrer that only has a stored draft', async () => {
    const { actions } = actionsFor(provider());
    writeDraft(toFormId(referrer), {
      values: { related: target },
      baseline: {},
    });
    const error = await refused(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(error.referrers.map(({ path }) => path)).toEqual([referrer]);
  });

  it('lists a referrer that is itself an unsaved copy', async () => {
    const { actions } = actionsFor(provider());
    readFormStore().storeNewDocumentDraft(toFormId(referrer), {
      related: target,
    });
    const error = await refused(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(error.referrers.map(({ path }) => path)).toEqual([referrer]);
  });

  it('blocks a document whose own unsaved edits reference itself', async () => {
    const { actions } = actionsFor(provider());
    keepEditsReferencing(target, target);
    const error = await refused(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(error.referrers.map(({ path }) => path)).toEqual([target]);
  });

  it('renames when unsaved edits reference no moved path, and the drafts move', async () => {
    const content = provider();
    const { actions } = actionsFor(content);
    keepEditsReferencing(referrer, 'content/posts/other.mdx');
    keepEditsTo(target, 'Edited');
    await act(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(content.rename).toHaveBeenCalled();
    expect(draftOf('content/posts/b.mdx')?.values).toMatchObject({
      title: 'Edited',
    });
  });

  it('blocks a folder rename for a referrer outside and inside the folder', async () => {
    const content = provider();
    const { actions } = actionsFor(content);
    keepEditsReferencing(referrer, 'content/posts/f/x.mdx');
    keepEditsReferencing('content/posts/f/y.mdx', 'content/posts/f/x.mdx');
    const error = await refused(() => actions.current.renameFolder('f', 'g'));
    expect(error.referrers.map(({ path }) => path).sort()).toEqual([
      referrer,
      'content/posts/f/y.mdx',
    ]);
    expect(content.renameFolder).not.toHaveBeenCalled();
  });

  it('renames a folder when no unsaved document references it', async () => {
    const content = provider();
    const { actions } = actionsFor(content);
    keepEditsReferencing(referrer, 'content/posts/elsewhere.mdx');
    await act(() => actions.current.renameFolder('f', 'g'));
    expect(content.renameFolder).toHaveBeenCalled();
  });

  it("invalidates another collection's lists when a rename rewrites its referrers", async () => {
    const content = provider({
      rename: vi.fn(async (_c, _from, to) => ({
        entry: { path: to },
        referrers: [referrer],
      })),
    });
    const { actions, queryClient } = actionsFor(content);
    const pageList = [...contentKeys.list('page', undefined), 'page', ''];
    queryClient.setQueryData(pageList, { nodes: [] });
    await act(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(queryClient.getQueryState(pageList)?.isInvalidated).toBe(true);
  });

  it("leaves another collection's lists alone when no referrer was rewritten", async () => {
    const { actions, queryClient } = actionsFor(provider());
    const pageList = [...contentKeys.list('page', undefined), 'page', ''];
    queryClient.setQueryData(pageList, { nodes: [] });
    await act(() =>
      actions.current.renameDocument(target, 'content/posts/b.mdx')
    );
    expect(queryClient.getQueryState(pageList)?.isInvalidated).toBe(false);
  });
});

describe('unsaved copies', () => {
  it('lists the new-document drafts directly in a folder and counts a subtree', () => {
    const { wrapper } = setup(provider());
    const store = useFormStore.getState();
    store.storeNewDocumentDraft(toFormId('content/posts/a/one.mdx'), {});
    store.storeNewDocumentDraft(toFormId('content/posts/a/deep/two.mdx'), {});
    store.storeNewDocumentDraft(toFormId('content/posts/top.mdx'), {});
    keepEditsTo('content/posts/a/hello.mdx', 'Edited');

    const folder = renderHook(() => useNewDocumentDrafts('post', 'a'), {
      wrapper,
    });
    expect(folder.result.current).toEqual([
      { path: 'content/posts/a/one.mdx' },
    ]);
    const top = renderHook(() => useNewDocumentDrafts('post', ''), { wrapper });
    expect(top.result.current).toEqual([{ path: 'content/posts/top.mdx' }]);

    const counts = renderHook(() => useDraftCounts('post'), { wrapper }).result
      .current;
    expect(counts.newDraftsUnder('a')).toBe(2);
    expect(counts.draftsUnder('a')).toBe(3);
    expect(
      counts.documentsWithDraft([
        'content/posts/a/hello.mdx',
        'content/posts/a/none.mdx',
      ])
    ).toBe(1);
  });
});
