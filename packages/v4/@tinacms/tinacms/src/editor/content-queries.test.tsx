import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import type { TinaStoreState } from '../core/plugin';
import { useCollectionDocuments, useSaveDocument } from './content-queries';
import { type TinaRuntime, TinaRuntimeContext } from './context';

const ENTRIES: DocumentEntry[] = [
  { path: 'content/posts/hello.mdx', document: { title: 'Hello' } },
  { path: 'content/posts/second.mdx', document: { title: 'Second' } },
];

// The runtime these hooks read: a store with a content namespace, and nothing else they
// touch. The registry and the schema are not on this path.
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
  list: vi.fn(async () => ENTRIES),
  get: vi.fn(async () => null),
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

    await waitFor(() => expect(result.current.documents).toEqual(ENTRIES));
    expect(provider.list).toHaveBeenCalledWith('post');
  });

  // No collection is a real state — nothing is open — and not a read of one named ''.
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

  // The list renders straight from this, so a new array each render would re-render
  // every consumer of it.
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

describe('useSaveDocument', () => {
  // The stored entry can hold more than the value that was sent, and the cached list
  // has to show what was stored rather than what the form had.
  it('replaces the cached entry with what the data layer stored', async () => {
    const persisted: DocumentEntry = {
      path: 'content/posts/hello.mdx',
      document: { title: 'Renamed', category: 'not-in-schema' },
    };
    const provider = stubProvider({ update: vi.fn(async () => persisted) });
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(
      () => ({
        list: useCollectionDocuments('post'),
        saving: useSaveDocument(),
      }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.list.documents).toEqual(ENTRIES));
    await result.current.saving.save({
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Renamed' },
    });

    await waitFor(() =>
      expect(result.current.list.documents).toEqual([persisted, ENTRIES[1]])
    );
    // Written into the cache, not refetched: the stored entry is already the
    // authoritative result of the write.
    expect(provider.list).toHaveBeenCalledTimes(1);
  });

  it('appends the stored entry when the path is not in the cached list', async () => {
    const persisted: DocumentEntry = {
      path: 'content/posts/new.mdx',
      document: { title: 'New' },
    };
    const provider = stubProvider({ update: vi.fn(async () => persisted) });
    const { wrapper } = renderWithContent(provider);
    const { result } = renderHook(
      () => ({
        list: useCollectionDocuments('post'),
        saving: useSaveDocument(),
      }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.list.documents).toEqual(ENTRIES));
    await result.current.saving.save({
      collection: 'post',
      path: 'content/posts/new.mdx',
      value: { title: 'New' },
    });

    await waitFor(() =>
      expect(result.current.list.documents).toEqual([...ENTRIES, persisted])
    );
  });

  // useFormSave marks the form clean only after the save resolves, so the rejection has
  // to reach it.
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
