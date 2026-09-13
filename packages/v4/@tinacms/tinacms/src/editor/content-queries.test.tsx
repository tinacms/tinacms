import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import type {
  ContentProvider,
  DocumentEntry,
  DocumentSummary,
} from '../core/content/contract';
import type { TinaStoreState } from '../core/plugin';
import {
  contentKeys,
  useCollectionDocuments,
  useDocument,
  useSaveDocument,
} from './content-queries';
import { type TinaRuntime, TinaRuntimeContext } from './context';

const ENTRIES: DocumentEntry[] = [
  { path: 'content/posts/hello.mdx', document: { title: 'Hello' } },
  { path: 'content/posts/second.mdx', document: { title: 'Second' } },
];

const SUMMARIES: DocumentSummary[] = ENTRIES.map(({ path }) => ({ path }));

const renderWithContent = (provider: ContentProvider) => {
  const store = createStore<TinaStoreState>()(() => ({
    content: provider as unknown as Record<string, unknown>,
  }));
  const runtime = { store } as unknown as TinaRuntime;
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
  list: vi.fn(async () => SUMMARIES),
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
