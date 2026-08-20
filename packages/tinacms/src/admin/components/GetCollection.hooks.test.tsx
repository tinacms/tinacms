import { renderHook, waitFor } from '@testing-library/react';
import type { TinaCMS } from '@tinacms/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TinaAdminApi } from '../api';
import { useGetCollection, useSearchCollection } from './GetCollection';

const loadedFolder = { loading: false, fullyQualifiedName: '' };

const buildCms = (isAuthenticated: boolean, searchResults = []) =>
  ({
    api: {
      tina: {
        schema: { getCollection: () => ({ name: 'post', fields: [] }) },
        authProvider: {
          isAuthenticated: vi.fn().mockResolvedValue(isAuthenticated),
        },
      },
      search: {
        supportsClientSideIndexing: () => false,
        query: vi.fn().mockResolvedValue({ results: searchResults }),
      },
    },
    alerts: { error: vi.fn() },
  }) as unknown as TinaCMS;

describe('useGetCollection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the collection when authenticated', async () => {
    const fetchCollection = vi
      .spyOn(TinaAdminApi.prototype, 'fetchCollection')
      .mockResolvedValue({ name: 'post' });

    const cms = buildCms(true);

    const { result } = renderHook(() =>
      useGetCollection(cms, 'post', true, loadedFolder)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchCollection).toHaveBeenCalled();
    expect(result.current.collection).toEqual({ name: 'post' });
  });

  it('skips the request and stops loading when not authenticated', async () => {
    const fetchCollection = vi.spyOn(TinaAdminApi.prototype, 'fetchCollection');

    const cms = buildCms(false);

    const { result } = renderHook(() =>
      useGetCollection(cms, 'post', true, loadedFolder)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchCollection).not.toHaveBeenCalled();
    expect(result.current.collection).toBeUndefined();
  });

  it('keeps loading while the folder is still resolving', async () => {
    const fetchCollection = vi.spyOn(TinaAdminApi.prototype, 'fetchCollection');

    const cms = buildCms(true);
    const pendingFolder = { loading: true, fullyQualifiedName: '' };

    const { result } = renderHook(() =>
      useGetCollection(cms, 'post', true, pendingFolder)
    );

    await waitFor(() => expect(fetchCollection).not.toHaveBeenCalled());
    expect(result.current.loading).toBe(true);
  });

  it('surfaces a fetch failure instead of loading forever', async () => {
    vi.spyOn(TinaAdminApi.prototype, 'fetchCollection').mockRejectedValue(
      new Error('boom')
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const cms = buildCms(true);

    const { result } = renderHook(() =>
      useGetCollection(cms, 'post', true, loadedFolder)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toEqual(new Error('boom'));
  });
});

describe('useSearchCollection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips the search and stops loading when not authenticated', async () => {
    const cms = buildCms(false);

    const { result } = renderHook(() =>
      useSearchCollection(cms, 'post', true, loadedFolder, '', 'hello')
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(cms.api.search.query).not.toHaveBeenCalled();
    expect(result.current.collection).toBeUndefined();
  });
});
