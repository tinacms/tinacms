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
import type { CollectionSchema } from '../core/schema/types';
import { readDraft } from '../form/drafts';
import {
  readFormStore,
  syncDrafts,
  toFormId,
  toFormValues,
  useFormStore,
} from '../form/form-store';
import { connectionOf } from '../test/connection';
import {
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

const ORIGINAL: DocumentEntry = {
  path: 'content/posts/a/hello.mdx',
  document: { title: 'Hello' },
};

const signedIn = (roles: string[]): AuthSlice =>
  ({
    status: 'signed-in',
    user: { id: 'u1' as UserId },
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
  }: { auth?: AuthSlice; collection?: CollectionSchema } = {}
) => {
  const store = createStore<TinaStoreState>()(() => ({
    content: content as unknown as Record<string, unknown>,
    ...(auth ? { auth: auth as unknown as Record<string, unknown> } : {}),
  }));
  const runtime = {
    store,
    schema: { collections: [collection] },
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
  return { wrapper, queryClient };
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

  it('gives the editor role the structural actions and an unknown role none', () => {
    expect(
      capabilities(provider(), { auth: signedIn(['editor']) }).canDelete
    ).toBe(true);
    const unknown = capabilities(provider(), { auth: signedIn(['guest']) });
    expect(Object.values(unknown).filter(Boolean)).toEqual([true]);
    expect(unknown.canCreateDocument).toBe(true);
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
