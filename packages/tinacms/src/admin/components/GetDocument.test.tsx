import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { ModalProvider, type TinaCMS } from '@tinacms/toolkit';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TinaAdminApi } from '../api';
import GetDocument, { useGetDocument } from './GetDocument';

const buildCms = (isAuthenticated: boolean) =>
  ({
    api: {
      tina: {
        schema: {},
        authProvider: {
          isAuthenticated: vi.fn().mockResolvedValue(isAuthenticated),
        },
      },
    },
    alerts: { error: vi.fn() },
    events: { dispatch: vi.fn() },
  }) as unknown as TinaCMS;

const renderGetDocument = (cms: TinaCMS) =>
  renderHook(() => useGetDocument(cms, 'post', 'hello.mdx'));

describe('useGetDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the document when authenticated', async () => {
    const fetchDocument = vi
      .spyOn(TinaAdminApi.prototype, 'fetchDocument')
      .mockResolvedValue({ document: { _values: { title: 'Hello' } } });

    const { result } = renderGetDocument(buildCms(true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchDocument).toHaveBeenCalledWith('post', 'hello.mdx');
    expect(result.current.document).toEqual({ _values: { title: 'Hello' } });
    expect(result.current.error).toBeUndefined();
  });

  it('skips the request and stops loading when not authenticated', async () => {
    const fetchDocument = vi.spyOn(TinaAdminApi.prototype, 'fetchDocument');

    const { result } = renderGetDocument(buildCms(false));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchDocument).not.toHaveBeenCalled();
    expect(result.current.document).toBeUndefined();
  });

  it('surfaces a fetch failure instead of loading forever', async () => {
    vi.spyOn(TinaAdminApi.prototype, 'fetchDocument').mockRejectedValue(
      new Error('boom')
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderGetDocument(buildCms(true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toEqual(new Error('boom'));
  });
});

describe('GetDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an error instead of handing children an undefined document', async () => {
    const fetchDocument = vi.spyOn(TinaAdminApi.prototype, 'fetchDocument');

    render(
      <ModalProvider>
        <GetDocument
          cms={buildCms(false)}
          collectionName='post'
          relativePath='hello.mdx'
        >
          {(document) => (
            <div data-testid='child'>{document._values.title}</div>
          )}
        </GetDocument>
      </ModalProvider>
    );

    await waitFor(() =>
      expect(screen.getByText('Unable to load')).toBeTruthy()
    );
    expect(fetchDocument).not.toHaveBeenCalled();
    expect(screen.queryByTestId('child')).toBeNull();
  });
});
