import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ResolvedConfig } from '../config';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import { useFormId } from '../editor/hooks';
import { TinaProvider } from '../editor/provider';
import { useFormStore } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { TinaAdmin } from './admin';

// An in-memory content provider standing in for the Local Data Layer: the admin
// talks to the capability, so what backs it is irrelevant to these assertions.
const saved: { path: string; value: TinaDocument }[] = [];

const store: Record<string, DocumentEntry[]> = {
  post: [
    { path: 'content/posts/hello.mdx', document: { title: 'Hello' } },
    { path: 'content/posts/second.mdx', document: { title: 'Second' } },
  ],
  page: [{ path: 'content/pages/about.mdx', document: { title: 'About' } }],
};

const provider: ContentProvider = {
  list: async (collection) => store[collection] ?? [],
  get: async (collection, path) =>
    (store[collection] ?? []).find((entry) => entry.path === path) ?? null,
  update: async (collection, path, value) => {
    saved.push({ path, value });
    const entry = { path, document: value };
    store[collection] = (store[collection] ?? []).map((candidate) =>
      candidate.path === path ? entry : candidate
    );
    return entry;
  },
};

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: (set, get) => ({
        documents: {},
        loadDocuments: async (collection: string) => {
          const documents = await provider.list(collection);
          const cache = get().content?.documents as Record<string, unknown>;
          set({ documents: { ...cache, [collection]: documents } });
          return documents;
        },
        getDocument: provider.get,
        // Feeds the persisted entry back into the list cache, as the real local
        // slice does. Without that the cache never changes after a save and the
        // re-seed this file guards against cannot happen here at all.
        saveDocument: async (
          collection: string,
          path: string,
          value: TinaDocument
        ) => {
          const entry = await provider.update(collection, path, value);
          const cache = get().content?.documents as Record<
            string,
            DocumentEntry[]
          >;
          set({
            documents: {
              ...cache,
              [collection]: (cache?.[collection] ?? []).map((candidate) =>
                candidate.path === path ? entry : candidate
              ),
            },
          });
          return entry;
        },
      }),
    },
  }),
});

const config: ResolvedConfig = {
  plugins: [contentPlugin, stringFieldPlugin],
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
};

const renderAdmin = (preview?: React.ReactNode) =>
  render(
    <TinaProvider config={config}>
      <TinaAdmin preview={preview} />
    </TinaProvider>
  );

// Anything reading the open form from the main pane. usePreviewConnection is the real
// one; this is the smallest thing with the same requirement.
function PreviewProbe() {
  return <p>previewing {useFormId()}</p>;
}

beforeEach(() => {
  saved.length = 0;
  window.location.hash = '';
  useFormStore.setState({ forms: {} });
});

describe('TinaAdmin', () => {
  it('lists every collection the schema declares, and nothing else', async () => {
    renderAdmin();
    // A SidebarMenu is a <ul>, so the menu is a labelled list rather than a nav
    // landmark — the sidebar as a whole is the landmark.
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

  // The route IS the state, so a deep link has to open the document on first paint
  // rather than after a click.
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

  // Stale link, renamed collection: say so rather than silently showing the list.
  it('reports a collection the schema does not have', async () => {
    window.location.hash = '#/collections/ghost';
    renderAdmin();
    expect(await screen.findByText(/No collection named/)).toBeInTheDocument();
  });

  // The preview renders in the main pane and reads the open form, so the form scope
  // has to sit above the whole layout rather than around the sidebar's fields.
  // Scoped to the sidebar this threw at runtime, and only in a browser — the vitest
  // suite passed no preview, so nothing exercised it.
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

  // ADR-012: the store keeps an unsaved form after its scope unmounts, and the
  // document list reads that store — so the badge survives navigating away.
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
