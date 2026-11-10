import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { ContentError, type DocumentEntry } from '../core/content/contract';
import { type PluginManifest, definePlugin } from '../core/plugin';
import type { SearchHit } from '../core/search/contract';
import { SearchError } from '../core/search/contract';
import { defineSearchPlugin } from '../core/search/define-search-plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { TinaAdmin } from './admin';

const hit = (path: string, snippet = ''): SearchHit => ({
  ref: { collection: 'post', path },
  score: 1,
  snippet,
});

const DOCUMENTS: Record<string, DocumentEntry | Error | null> = {
  'content/posts/hello.mdx': {
    path: 'content/posts/hello.mdx',
    title: 'Hello post',
    document: { title: 'Hello' },
  },
  'content/posts/untitled.mdx': {
    path: 'content/posts/untitled.mdx',
    document: {},
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
        list: async () => [],
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

const openSearch = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /Search/ }));
  return screen.findByRole('dialog', { name: 'Search' });
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
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
