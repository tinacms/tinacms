import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import type { AdminScreenProps } from '../core/screen/contract';
import { useFormId } from '../editor/hooks';
import { TinaProvider } from '../editor/provider';
import { useFormStore } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { TinaAdmin } from './admin';
import { useAdminRoute } from './use-admin-route';

// A content provider in memory, which stands in for the local data layer. The admin
// talks to the capability, so the code behind it does not affect these tests.
const saved: { path: string; value: TinaDocument }[] = [];

const store: Record<string, DocumentEntry[]> = {
  post: [
    {
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    },
    {
      path: 'content/posts/second.mdx',
      document: { title: 'Second' },
    },
  ],
  page: [{ path: 'content/pages/about.mdx', document: { title: 'About' } }],
};

const provider: ContentProvider = {
  list: async (collection) => store[collection] ?? [],
  get: async (collection, path) =>
    (store[collection] ?? []).find((entry) => entry.path === path) ?? null,
  update: async (collection, path, value) => {
    saved.push({ path, value });
    // Re-parsed, not echoed. The real slice returns what the data layer read back off
    // disk, which is a different object with a normalised value — echoing the form's
    // own value made the re-seed this file guards against unreachable.
    const entry = { path, document: { ...value } };
    store[collection] = (store[collection] ?? []).map((candidate) =>
      candidate.path === path ? entry : candidate
    );
    return entry;
  },
};

// Counted, so a test can assert that two components reading one collection share a
// single request rather than each running their own.
const listCalls: string[] = [];

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      // The slice is the transport, and holds no cache. The query client caches, so a
      // stub only has to answer.
      slice: () => ({
        list: (collection: string) => {
          listCalls.push(collection);
          return provider.list(collection);
        },
        get: provider.get,
        update: provider.update,
      }),
    },
  }),
});

// A screen a plugin contributes, to prove the shell routes to a view it knows nothing
// about. It reads its own route segments.
function MediaScreen({ segments }: AdminScreenProps) {
  const { navigate } = useAdminRoute();
  return (
    <div>
      <p>media library at /{segments.join('/')}</p>
      <button
        type='button'
        onClick={() =>
          navigate({ view: 'screen', screen: 'media', segments: ['photos'] })
        }
      >
        Open photos
      </button>
    </div>
  );
}

const screenPlugin = definePlugin({
  name: 'test:media-screen',
  client: async () => ({
    default: {
      screens: [{ name: 'media', label: 'Media', component: MediaScreen }],
    },
  }),
});

const config = asResolvedConfig({
  plugins: [contentPlugin, screenPlugin, stringFieldPlugin],
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        format: 'mdx',
        fields: [{ name: 'title', label: 'Title', type: 'string' }],
      },
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'mdx',
        fields: [{ name: 'title', label: 'Title', type: 'string' }],
      },
    ],
  },
});

// A client per render, so no cached list crosses between tests, and no retry hides a
// rejection behind a delay.
const renderAdmin = (preview?: React.ReactNode) =>
  render(
    <TinaProvider
      config={config}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <TinaAdmin preview={preview} />
    </TinaProvider>
  );

// A component that reads the open form from the main pane. usePreviewConnection is the
// real one. This is the smallest component with the same requirement.
function PreviewProbe() {
  return <p>previewing {useFormId()}</p>;
}

const FIXTURES: Record<string, DocumentEntry[]> = {
  post: [
    {
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    },
    {
      path: 'content/posts/second.mdx',
      document: { title: 'Second' },
    },
  ],
  page: [{ path: 'content/pages/about.mdx', document: { title: 'About' } }],
};

beforeEach(() => {
  saved.length = 0;
  listCalls.length = 0;
  window.location.hash = '';
  useFormStore.setState({ forms: {} });
  // provider.update mutates `store`, and nothing reset it, so a test that saved
  // changed the fixture every later test read.
  for (const [collection, entries] of Object.entries(FIXTURES)) {
    store[collection] = entries.map((entry) => ({ ...entry }));
  }
});

describe('TinaAdmin', () => {
  it('lists every collection the schema declares, and nothing else', async () => {
    renderAdmin();
    // A SidebarMenu is a <ul>, so the menu is a labelled list and not a navigation
    // landmark. The sidebar as a whole is the landmark.
    const menu = await screen.findByRole('list', { name: 'Collections' });
    expect(
      within(menu)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Posts', 'Pages']);
  });

  it('opens a collection, then a document, and edits it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));

    const input = await screen.findByLabelText('title');
    expect(input).toHaveValue('Hello');

    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toEqual({
      path: 'content/posts/hello.mdx',
      value: { title: 'Hello!' },
    });
  });

  // The route is the state, so a deep link must open the document at the first paint,
  // and not after a click.
  it('opens the document a deep link names', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fsecond.mdx';
    renderAdmin();
    expect(await screen.findByLabelText('title')).toHaveValue('Second');
  });

  it('navigating writes a shareable hash', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Pages' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/page')
    );
  });

  // A stale link, or a collection with a new name. Say so, and do not show the list
  // with no message.
  it('reports a collection the schema does not have', async () => {
    window.location.hash = '#/collections/ghost';
    renderAdmin();
    expect(await screen.findByText(/No collection named/)).toBeInTheDocument();
  });

  // The preview renders in the main pane, and it reads the open form. The form scope
  // must therefore sit above the whole layout, and not around the fields in the
  // sidebar. A scope around the sidebar threw at runtime, and only in a browser. The
  // vitest suite passed no preview, so nothing ran that path.
  it('renders the preview inside the open document form scope', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin(<PreviewProbe />);
    expect(await screen.findByText(/^previewing /)).toBeInTheDocument();
  });

  it('shows no preview until a document is open', async () => {
    renderAdmin(<PreviewProbe />);
    await screen.findByRole('list', { name: 'Collections' });
    expect(screen.queryByText(/^previewing /)).not.toBeInTheDocument();
  });

  // The store keeps an unsaved form after its scope unmounts (ADR-012), and the
  // document list reads that store. The badge therefore stays after a move away.
  it('still badges a document as unsaved after navigating away from it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');

    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );

    const helloEntry = await screen.findByRole('button', {
      name: /hello\.mdx/,
    });
    expect(helloEntry).toHaveTextContent('Unsaved');
  });
});

describe('TinaAdmin content reads', () => {
  // The sidebar's document list and the open document's scope both read the collection.
  // Each ran its own effect and its own fetch before the query client, so opening a
  // collection listed it twice.
  it('reads a collection once when two components ask for it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });

    expect(listCalls.filter((name) => name === 'post')).toEqual(['post']);
  });

  // Returning to a collection inside the stale window serves the cache.
  it('does not read a collection again on returning to it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });
    await user.click(await screen.findByRole('button', { name: 'Pages' }));
    await screen.findByRole('button', { name: /about\.mdx/ });
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });

    expect(listCalls).toEqual(['post', 'page']);
  });

  // A failed read and an empty collection are different answers. The failure used to
  // reach console.error alone, and the sidebar said "No documents yet".
  it('reports a collection that failed to load', async () => {
    const user = userEvent.setup();
    const failing = vi
      .spyOn(provider, 'list')
      .mockRejectedValueOnce(new Error('data layer offline'));
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));

    expect(await screen.findByText(/data layer offline/)).toBeInTheDocument();
    expect(screen.queryByText('No documents yet.')).not.toBeInTheDocument();
    failing.mockRestore();
  });

  // The save writes the stored entry into the cached list, so the sidebar shows it
  // without a second read of the collection.
  it('shows a save in the document list without re-reading the collection', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saved).toHaveLength(1));
    expect(listCalls).toEqual(['post']);
  });
});

describe('TinaAdmin screens', () => {
  it('lists the screens a plugin registered', async () => {
    renderAdmin();
    const menu = await screen.findByRole('list', { name: 'Screens' });
    expect(
      within(menu)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Media']);
  });

  it('opens a screen and writes a shareable hash', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Media' }));

    expect(await screen.findByText(/media library at/)).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#/screens/media'));
  });

  // The screen owns the segments below its name, so it can navigate within itself and
  // stay linkable.
  it('gives a screen its own route segments', async () => {
    window.location.hash = '#/screens/media/photos/2026';
    renderAdmin();
    expect(
      await screen.findByText('media library at /photos/2026')
    ).toBeInTheDocument();
  });

  it('lets a screen navigate within itself', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await user.click(
      await screen.findByRole('button', { name: 'Open photos' })
    );

    expect(
      await screen.findByText('media library at /photos')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(window.location.hash).toBe('#/screens/media/photos')
    );
  });

  // A stale link, or a screen whose plugin is no longer installed.
  it('reports a screen no plugin registered', async () => {
    window.location.hash = '#/screens/ghost';
    renderAdmin();
    expect(await screen.findByText(/No screen named/)).toBeInTheDocument();
  });

  // A screen names no collection, so opening one closes the document list. The route is
  // the state: `#/screens/media` has no collection in it, and a sidebar that kept one
  // would be showing something a reload could not restore.
  it('closes the open collection when a screen opens', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('list', { name: 'Posts documents' });

    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await screen.findByText(/media library at/);

    expect(
      screen.queryByRole('list', { name: 'Posts documents' })
    ).not.toBeInTheDocument();
  });

  // The form store keeps an unsaved form after its scope unmounts (ADR-012), and a
  // screen unmounts that scope.
  it('keeps unsaved edits across a visit to a screen', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');

    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await screen.findByText(/media library at/);

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));

    expect(await screen.findByLabelText('title')).toHaveValue('Hello!');
  });
});

describe('TinaAdmin form continuity', () => {
  // Swapping the element type at the scope's position rebuilt everything below it, so
  // the sidebar's document list re-fetched on every open and close.
  it('keeps the collection list mounted across opening a document', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    const before = await screen.findByRole('list', { name: 'Posts documents' });

    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await screen.findByLabelText('title');

    expect(screen.getByRole('list', { name: 'Posts documents' })).toBe(before);
  });
});
