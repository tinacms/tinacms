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
import { useFormStore } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { TinaAdmin } from './admin';
import { useAdminRoute } from './use-admin-route';

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
    const entry = { path, document: { ...value } };
    store[collection] = (store[collection] ?? []).map((candidate) =>
      candidate.path === path ? entry : candidate
    );
    return entry;
  },
};

const listCalls: string[] = [];

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
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

const renderAdmin = (preview?: React.ReactNode) =>
  render(
    <TinaAdmin
      config={config}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
      preview={preview}
    />
  );

function PreviewProbe() {
  return <p>previewing {useFormId()}</p>;
}

const reloadIsBlocked = (): boolean => {
  const unload = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(unload);
  return unload.defaultPrevented;
};

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
  for (const [collection, entries] of Object.entries(FIXTURES)) {
    store[collection] = entries.map((entry) => ({ ...entry }));
  }
});

describe('TinaAdmin', () => {
  it('lists every collection the schema declares, and nothing else', async () => {
    renderAdmin();
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
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Saved')
    );
    expect(input).toHaveValue('Hello!');
  });

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

  it('reports a collection the schema does not have', async () => {
    window.location.hash = '#/collections/ghost';
    renderAdmin();
    expect(await screen.findByText(/No collection named/)).toBeInTheDocument();
  });

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

  it('still badges a document as unsaved after navigating away from it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');

    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    expect(await screen.findByLabelText('title')).toHaveValue('Second');

    const helloEntry = await screen.findByRole('button', {
      name: /hello\.mdx/,
    });
    expect(helloEntry).toHaveTextContent('Unsaved');
  });
});

describe('TinaAdmin unsaved changes', () => {
  it('blocks a reload while edits are unsaved, and lets it through once they are saved', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await screen.findByLabelText('title');
    expect(reloadIsBlocked()).toBe(false);

    await user.type(screen.getByLabelText('title'), '!');
    expect(reloadIsBlocked()).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(saved).toHaveLength(1));
    await waitFor(() => expect(reloadIsBlocked()).toBe(false));
  });

  it('blocks a reload for a document that another one is open over', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');

    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Second')
    );
    expect(reloadIsBlocked()).toBe(true);
  });

  it('stops blocking the reload when the admin unmounts', async () => {
    const user = userEvent.setup();
    const { unmount } = renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');
    expect(reloadIsBlocked()).toBe(true);

    unmount();
    expect(reloadIsBlocked()).toBe(false);
  });

  it('discards unsaved edits back to the loaded document', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText('title'), '!');
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved');

    await user.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Hello')
    );
    expect(screen.getByRole('status')).toHaveTextContent('No changes');
    expect(reloadIsBlocked()).toBe(false);
  });
});

describe('TinaAdmin content reads', () => {
  it('reads a collection once when two components ask for it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });

    expect(listCalls.filter((name) => name === 'post')).toEqual(['post']);
  });

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

  it('reports a screen no plugin registered', async () => {
    window.location.hash = '#/screens/ghost';
    renderAdmin();
    expect(await screen.findByText(/No screen named/)).toBeInTheDocument();
  });

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
