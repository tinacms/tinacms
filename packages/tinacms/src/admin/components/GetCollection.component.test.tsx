import { render, screen, waitFor } from '@testing-library/react';
import { ModalProvider, type TinaCMS } from '@tinacms/toolkit';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TinaAdminApi } from '../api';
import GetCollection from './GetCollection';

const loadedFolder = { loading: false, fullyQualifiedName: '' };

const buildCms = (isAuthenticated: boolean) =>
  ({
    api: {
      tina: {
        schema: { getCollection: () => ({ name: 'post', fields: [] }) },
        authProvider: {
          isAuthenticated: vi.fn().mockResolvedValue(isAuthenticated),
        },
      },
      search: { supportsClientSideIndexing: () => false, query: vi.fn() },
    },
    alerts: { error: vi.fn() },
  }) as unknown as TinaCMS;

// An effect that throws unmounts the tree in React 18, so a boundary is the only
// way to assert on it from a test
class Boundary extends React.Component<
  { onError: (e: Error) => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const renderCollection = (cms: TinaCMS) => {
  const caught: Error[] = [];
  render(
    <Boundary onError={(e) => caught.push(e)}>
      <ModalProvider>
        <MemoryRouter>
          <GetCollection cms={cms} collectionName='post' folder={loadedFolder}>
            {(collection) => (
              <div data-testid='child'>{collection.documents.edges.length}</div>
            )}
          </GetCollection>
        </MemoryRouter>
      </ModalProvider>
    </Boundary>
  );
  return { caught };
};

describe('GetCollection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an error instead of throwing when the session check says not signed in', async () => {
    const fetchCollection = vi.spyOn(TinaAdminApi.prototype, 'fetchCollection');
    const { caught } = renderCollection(buildCms(false));

    await waitFor(() =>
      expect(screen.getByText('Unable to load')).toBeTruthy()
    );
    expect(fetchCollection).not.toHaveBeenCalled();
    expect(screen.queryByTestId('child')).toBeNull();
    expect(caught).toEqual([]);
  });

  it('renders an error instead of throwing when the fetch fails', async () => {
    vi.spyOn(TinaAdminApi.prototype, 'fetchCollection').mockRejectedValue(
      new Error('boom')
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { caught } = renderCollection(buildCms(true));

    await waitFor(() => expect(screen.getByText('Error')).toBeTruthy());
    expect(caught).toEqual([]);
  });
});
