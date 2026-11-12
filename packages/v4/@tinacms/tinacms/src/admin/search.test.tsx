import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { ContentError, type DocumentEntry } from '../core/content/contract';
import { type PluginManifest, definePlugin } from '../core/plugin';
import type { SearchHit } from '../core/search/contract';
import { SearchError } from '../core/search/contract';
import { defineSearchPlugin } from '../plugins/search/search.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { TinaProvider } from '../editor/provider';
import { toFormId, useFormStore } from '../form/form-store';
import { TinaAdmin } from './admin';
import { SearchControl } from './search';
import { connectionOf } from '../test/connection';

const hit = (path: string, snippet = ''): SearchHit => ({
  ref: { collection: 'post', path },
  score: 1,
  snippet,
});

const DOCUMENTS: Record<string, DocumentEntry | Error | null> = {
  // The title only a document value holds, as the local and TinaCloud providers return it.
  'content/posts/hello.mdx': {
    path: 'content/posts/hello.mdx',
    document: { title: 'Hello post' },
  },
  'content/posts/both.mdx': {
    path: 'content/posts/both.mdx',
    title: 'Entry title',
    document: { title: 'Document title' },
  },
  'content/posts/blank-entry.mdx': {
    path: 'content/posts/blank-entry.mdx',
    title: '  ',
    document: { title: 'Document title' },
  },
  'content/posts/blank-both.mdx': {
    path: 'content/posts/blank-both.mdx',
    title: '',
    document: { title: '   ' },
  },
  'content/posts/untitled.mdx': {
    path: 'content/posts/untitled.mdx',
    document: {},
  },
  'content/posts/number-title.mdx': {
    path: 'content/posts/number-title.mdx',
    document: { title: 7 },
  },
  'content/posts/gone.mdx': null,
  'content/posts/missing.mdx': new ContentError('not-found'),
  'content/posts/broken.mdx': new ContentError('network'),
};

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: async () => connectionOf([]),
        get: async (_collection: string, path: string) => {
          const found = DOCUMENTS[path];
          if (found instanceof Error) throw found;
          return found ?? null;
        },
        update: async () => {
          throw new Error('unused');
        },
      }),
    },
  }),
});

const searchProviderPlugin = (
  search: (query: string) => Promise<SearchHit[]>
) =>
  definePlugin({
    name: 'test:search',
    provides: ['search'],
    client: async () => ({ default: { slice: () => ({ search }) } }),
  });

const renderAdmin = (search: PluginManifest, rpcUrl?: string) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [contentPlugin, search, stringFieldPlugin],
        ...(rpcUrl ? { rpcUrl } : {}),
        schema: {
          collections: [
            {
              name: 'post',
              path: 'content/posts',
              format: 'mdx',
              fields: [{ name: 'title', type: 'string' }],
            },
          ],
        },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

// The rest of the admin shell reads content too, so only the Search control is
// rendered here: it must not be the part that throws `content-capability-missing`.
const renderWithoutContent = (search: PluginManifest) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [search, stringFieldPlugin],
        schema: { collections: [] },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <HashRouter>
        <SearchControl />
      </HashRouter>
    </TinaProvider>
  );

const openSearch = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /Search/ }));
  return screen.findByRole('dialog', { name: 'Search' });
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  window.location.hash = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('the Search dialog content results', () => {
  it('shows the title and snippet of a hit whose document exists, or its path', async () => {
    const search = vi.fn(async () => [
      hit('content/posts/hello.mdx', 'a snippet'),
      hit('content/posts/untitled.mdx'),
    ]);
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'hello');
    const results = within(dialog).getByRole('list', {
      name: 'Search results',
    });
    await waitFor(() =>
      expect(within(results).getAllByRole('listitem')).toHaveLength(2)
    );
    expect(search).toHaveBeenCalledWith('hello', { limit: 10 });
    const [first, second] = within(results).getAllByRole('listitem');
    expect(first).toHaveTextContent('Hello post');
    expect(first).toHaveTextContent('a snippet');
    expect(second).toHaveTextContent('content/posts/untitled.mdx');
    expect(within(results).queryByRole('button')).toBeNull();
  });

  it.each([
    [
      'the document title when the entry has none',
      'content/posts/hello.mdx',
      'Hello post',
    ],
    [
      'the entry title over the document title',
      'content/posts/both.mdx',
      'Entry title',
    ],
    [
      'the document title when the entry title is blank',
      'content/posts/blank-entry.mdx',
      'Document title',
    ],
    [
      'the path when both titles are blank',
      'content/posts/blank-both.mdx',
      'content/posts/blank-both.mdx',
    ],
    [
      'the path when there is no title',
      'content/posts/untitled.mdx',
      'content/posts/untitled.mdx',
    ],
    [
      'the path when the title is not a string',
      'content/posts/number-title.mdx',
      'content/posts/number-title.mdx',
    ],
  ])('shows %s', async (_name, path, expected) => {
    const search = vi.fn(async () => [hit(path)]);
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'x');
    const results = within(dialog).getByRole('list', {
      name: 'Search results',
    });
    await waitFor(() =>
      expect(within(results).getAllByRole('listitem')).toHaveLength(1)
    );
    expect(
      within(results).getByRole('listitem').firstElementChild
    ).toHaveTextContent(
      new RegExp(`^${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    );
  });

  it('marks a hit whose document holds unsaved edits and no other', async () => {
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId('content/posts/hello.mdx'), {
        title: 'Hello post',
      });
    const search = vi.fn(async () => [
      hit('content/posts/hello.mdx'),
      hit('content/posts/both.mdx'),
    ]);
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'x');
    const results = within(dialog).getByRole('list', {
      name: 'Search results',
    });
    await waitFor(() =>
      expect(within(results).getAllByRole('listitem')).toHaveLength(2)
    );
    const [edited, clean] = within(results).getAllByRole('listitem');
    expect(within(edited).getByText('Unsaved')).toBeVisible();
    expect(within(clean).queryByText('Unsaved')).toBeNull();
  });

  it('renders the Search control and its dialog with no content plugin, and never searches', async () => {
    const search = vi.fn(async () => [hit('content/posts/hello.mdx')]);
    const user = userEvent.setup();
    renderWithoutContent(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'sett');
    expect(
      within(dialog).getByRole('list', { name: 'Navigation results' })
    ).toBeVisible();
    expect(
      within(dialog).getByText('Full-text search needs a search provider.')
    ).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(search).not.toHaveBeenCalled();
    expect(within(dialog).queryByRole('alert')).toBeNull();
  });

  it('drops hits whose document is gone and shows another read error once', async () => {
    const search = vi.fn(async () => [
      hit('content/posts/hello.mdx'),
      hit('content/posts/gone.mdx'),
      hit('content/posts/missing.mdx'),
      hit('content/posts/broken.mdx'),
    ]);
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'x');
    const results = within(dialog).getByRole('list', {
      name: 'Search results',
    });
    await waitFor(() =>
      expect(within(results).getAllByRole('listitem')).toHaveLength(1)
    );
    expect(within(results).getByRole('listitem')).toHaveTextContent(
      'Hello post'
    );
    const alerts = within(dialog).getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(new ContentError('network').message);
  });

  it("shows a SearchError's message instead of the list", async () => {
    const search = vi.fn(async () => {
      throw new SearchError('unavailable');
    });
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'x');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      new SearchError('unavailable').message
    );
  });

  it('sends one search for a burst of keystrokes', async () => {
    const search = vi.fn(async () => []);
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'hello');
    await waitFor(() => expect(search).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(search.mock.calls).toEqual([['hello', { limit: 10 }]]);
  });

  it('ignores a response that arrives after a newer query was sent', async () => {
    let releaseFirst: (hits: SearchHit[]) => void = () => {};
    const search = vi.fn((query: string) =>
      query === 'a'
        ? new Promise<SearchHit[]>((resolve) => {
            releaseFirst = resolve;
          })
        : Promise.resolve([hit('content/posts/untitled.mdx')])
    );
    const user = userEvent.setup();
    renderAdmin(searchProviderPlugin(search));
    const dialog = await openSearch(user);
    const box = within(dialog).getByRole('searchbox');
    await user.type(box, 'a');
    await waitFor(() =>
      expect(search).toHaveBeenCalledWith('a', { limit: 10 })
    );
    await user.type(box, 'b');
    await waitFor(() =>
      expect(search).toHaveBeenCalledWith('ab', { limit: 10 })
    );
    const results = within(dialog).getByRole('list', {
      name: 'Search results',
    });
    await waitFor(() =>
      expect(within(results).getAllByRole('listitem')).toHaveLength(1)
    );
    releaseFirst([hit('content/posts/hello.mdx')]);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(within(results).getByRole('listitem')).toHaveTextContent(
      'content/posts/untitled.mdx'
    );
  });

  it('posts to the configured rpcUrl and shows the hits', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      Response.json([hit('content/posts/hello.mdx', 'from the route')])
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderAdmin(
      defineSearchPlugin({
        name: 'test:rpc-search',
        fields: { post: { title: 1 } },
        server: async () => {
          throw new Error('the browser never loads the server segment');
        },
      }),
      '/cms/rpc'
    );
    const dialog = await openSearch(user);
    await user.type(within(dialog).getByRole('searchbox'), 'hello');
    const results = within(dialog).getByRole('list', {
      name: 'Search results',
    });
    await waitFor(() =>
      expect(within(results).getAllByRole('listitem')).toHaveLength(1)
    );
    expect(fetchMock.mock.calls[0][0]).toBe('/cms/rpc/search/query');
    expect(results).toHaveTextContent('from the route');
  });
});
