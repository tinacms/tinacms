import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig, defineConfig } from '../config';
import type { BranchInfo } from '../core/branch/contract';
import { currentBranchOf } from '../core/branch/contract';
import type { DocumentEntry, DocumentSummary } from '../core/content/contract';
import { type PluginManifest, definePlugin } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import type { AdminScreenProps } from '../core/screen/contract';
import { draftKey } from '../form/drafts';
import { toFormId } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { corePlugins } from '../plugins/fields';
import homePlugin from '../plugins/home/home.plugin';
import { guardConsole } from '../test/console-guard';
import { TinaAdmin } from './admin';

type Mode = 'local' | 'branches' | 'none';

const collection = (
  name: string,
  extra: Partial<CollectionSchema> = {}
): CollectionSchema => ({
  name,
  path: `content/${name}s`,
  format: 'mdx',
  fields: [{ name: 'title', label: 'Title', type: 'string' }],
  ...extra,
});

interface World {
  mode: Mode;
  collections: CollectionSchema[];
  branches: BranchInfo[];
  listBranches: () => Promise<BranchInfo[]>;
  /** The summaries of each collection, by branch then collection name. */
  summaries: Record<string, Record<string, DocumentSummary[]>>;
  list: (collection: string, branch: string) => Promise<DocumentSummary[]>;
  update: (
    collection: string,
    path: string,
    value: TinaDocument
  ) => Promise<DocumentEntry>;
  plugins: PluginManifest[];
  withHome: boolean;
}

let world: World;
let listCalls: string[];

const contentPlugin = () =>
  definePlugin({
    name: 'test:content',
    provides: ['content'],
    client: async () => ({
      default: {
        slice: (_set, get) => {
          const branch = () => currentBranchOf(get()) ?? 'main';
          return {
            ...(world.mode === 'local' ? { local: true } : {}),
            ...(world.mode === 'branches'
              ? {
                  branches: {
                    list: () => world.listBranches(),
                    defaultBranch: async () => 'main',
                  },
                }
              : {}),
            list: (name: string) => {
              listCalls.push(name);
              return world.list(name, branch());
            },
            get: async (_name: string, path: string) => ({
              path,
              document: { title: path },
            }),
            update: (name: string, path: string, value: TinaDocument) =>
              world.update(name, path, value),
          };
        },
      },
    }),
  });

const setWidth = (width: number) =>
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width: (\d+)px/.exec(query);
    const max = /max-width: (\d+)px/.exec(query);
    return {
      matches:
        (min ? width >= Number(min[1]) : false) ||
        (max ? width <= Number(max[1]) : false),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

const queryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderAdmin = () =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin(),
          stringFieldPlugin,
          ...(world.withHome ? [homePlugin] : []),
          ...world.plugins,
        ],
        schema: { collections: world.collections },
      })}
      queryClient={queryClient()}
    />
  );

const panelTitles = () =>
  within(screen.getByRole('main'))
    .getAllByRole('region')
    .map((region) => within(region).getByRole('heading').textContent);

const panel = async (name: string | RegExp) =>
  within(await screen.findByRole('main')).findByRole('region', { name });

const columnOf = (region: HTMLElement) =>
  region.closest('[data-home-column]')?.getAttribute('data-home-column');

const consoleGuard = guardConsole();

beforeEach(() => {
  listCalls = [];
  world = {
    mode: 'local',
    collections: [collection('post', { label: 'Posts' }), collection('page')],
    branches: [{ name: 'main', protected: true }, { name: 'feature/news' }],
    listBranches: async () => world.branches,
    summaries: {
      main: {
        post: [
          { path: 'content/posts/hello.mdx' },
          { path: 'content/posts/second.mdx' },
        ],
        page: [{ path: 'content/pages/about.mdx' }],
      },
    },
    list: async (name, branch) => world.summaries[branch]?.[name] ?? [],
    update: async (_name, path, value) => ({ path, document: value }),
    plugins: [],
    withHome: true,
  };
  window.location.hash = '';
  setWidth(1440);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const NOW = Date.parse('2026-11-11T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const fixClock = () => vi.useFakeTimers({ toFake: ['Date'], now: NOW });

const keepDraft = (path: string) =>
  localStorage.setItem(
    draftKey(toFormId(path)),
    JSON.stringify({
      version: 2,
      values: { title: 'Kept' },
      baseline: { title: path },
    })
  );

const recentRows = (recent: HTMLElement) =>
  within(within(recent).getByRole('list', { name: 'Recent documents' }))
    .getAllByRole('button')
    .map((row) => row.textContent);

let observers: FakeIntersectionObserver[] = [];

class FakeIntersectionObserver {
  constructor(
    private readonly callback: (entries: { isIntersecting: boolean }[]) => void
  ) {
    observers.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    observers = observers.filter((observer) => observer !== this);
  }
  takeRecords() {
    return [];
  }
  intersect() {
    this.callback([{ isIntersecting: true }]);
  }
}

const manyPosts = (count: number): DocumentSummary[] =>
  Array.from({ length: count }, (_, index) => ({
    path: `content/posts/post-${String(index).padStart(2, '0')}.mdx`,
    updatedAt: ago((index + 1) * HOUR),
  }));

const rail = () => screen.findByRole('navigation', { name: 'Content' });

const railRow = async (name: string) =>
  within(await rail()).queryByRole('button', { name });

const navigationResults = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Search' }));
  return within(
    await screen.findByRole('list', { name: 'Navigation results' })
  );
};

let seenSegments: string[][] = [];

const CustomHome = ({ segments }: AdminScreenProps) => {
  seenSegments.push(segments);
  return <p>custom home</p>;
};

const customHomePlugin = (overrides: boolean) =>
  definePlugin({
    name: 'acme:home',
    provides: ['screen'],
    ...(overrides
      ? { overrides: [{ capability: 'screen' as const, key: 'home' }] }
      : {}),
    client: async () => ({
      default: {
        screens: [{ name: 'home', label: 'Home', component: CustomHome }],
      },
    }),
  });

const removeHomePlugin = definePlugin({
  name: 'acme:no-home',
  provides: ['screen'],
  overrides: [{ capability: 'screen', key: 'home' }],
});

describe('Home screen', () => {
  beforeEach(() => {
    seenSegments = [];
  });

  it('is a screen named home that a core plugin contributes by default', async () => {
    expect(corePlugins).toContain(homePlugin);
    const { default: segment } = (await homePlugin.client?.()) ?? {};
    expect(segment?.screens?.map(({ name }) => name)).toEqual(['home']);
    expect(segment?.slots).toEqual({
      globalNav: [
        expect.objectContaining({
          label: 'Home',
          target: { kind: 'screen', screen: 'home' },
        }),
      ],
    });
    const { plugins } = defineConfig({
      plugins: [contentPlugin()],
      schema: { collections: [] },
    });
    expect(plugins).toContain(homePlugin);
  });

  it.each([
    ['#/', '#/'],
    ['an empty hash', ''],
    ['an unknown hash', '#/nowhere'],
    ['#/screens/home', '#/screens/home'],
  ])(
    'shows Home bare, with no panel header and no Close, at %s',
    async (_case, hash) => {
      window.location.hash = hash;
      renderAdmin();
      const main = await screen.findByRole('main');
      expect(
        await within(main).findByRole('region', { name: /^Collections/ })
      ).toBeVisible();
      expect(
        within(main).getAllByRole('heading', { name: 'Home' })
      ).toHaveLength(1);
      expect(within(main).queryByRole('button', { name: 'Close' })).toBeNull();
      expect(await railRow('Home')).toHaveAttribute('aria-current', 'page');
    }
  );

  it('shows a plugin screen that overrides home at #/, with none of the built-in Home', async () => {
    keepDraft('content/posts/hello.mdx');
    world.plugins = [customHomePlugin(true)];
    renderAdmin();
    const main = await screen.findByRole('main');
    expect(await within(main).findByText('custom home')).toBeVisible();
    expect(seenSegments.at(-1)).toEqual([]);
    expect(within(main).queryByRole('region')).toBeNull();
    expect(within(main).queryByRole('heading', { name: 'Home' })).toBeNull();
    expect(within(main).queryByRole('button', { name: 'Close' })).toBeNull();
    expect(screen.queryByText(/^Local files:/)).toBeNull();
    expect(screen.queryByRole('button', { name: /^Review/ })).toBeNull();
    expect(await railRow('Home')).toHaveAttribute('aria-current', 'page');
  });

  it('passes the rest of #/screens/home/a/b to a replacement Home as segments', async () => {
    world.plugins = [customHomePlugin(true)];
    window.location.hash = '#/screens/home/a/b';
    renderAdmin();
    const main = await screen.findByRole('main');
    expect(await within(main).findByText('custom home')).toBeVisible();
    expect(seenSegments.at(-1)).toEqual(['a', 'b']);
    expect(within(main).queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('refuses to start when a second screen named home has no override', async () => {
    consoleGuard.expect(/admin screen named "home"/);
    world.plugins = [customHomePlugin(false)];
    renderAdmin();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Two plugins both contribute an admin screen named "home"'
    );
  });

  const renderWithoutHome = {
    'an override that contributes no home screen': () => {
      world.plugins = [removeHomePlugin];
      return renderAdmin();
    },
    "a project plugin with the core Home plugin's name": () =>
      render(
        <TinaAdmin
          config={defineConfig({
            plugins: [contentPlugin(), definePlugin({ name: homePlugin.name })],
            schema: { collections: world.collections },
          })}
          queryClient={queryClient()}
        />
      ),
  };

  it.each(Object.entries(renderWithoutHome))(
    'shows a placeholder at #/ and no Home row or search entry after %s',
    async (_case, renderIt) => {
      const user = userEvent.setup();
      renderIt();
      const main = await screen.findByRole('main');
      expect(
        within(main).getByText('Pick a place from the sidebar.')
      ).toBeVisible();
      expect(within(main).queryByRole('region')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(await railRow('Home')).toBeNull();

      const results = await navigationResults(user);
      expect(results.queryByRole('button', { name: 'Home' })).toBeNull();
      await user.click(results.getByRole('button', { name: 'Collections' }));
      await waitFor(() => expect(window.location.hash).toBe('#/collections'));

      await user.click(
        (await screen.findAllByRole('button', { name: 'Close' }))[0]
      );
      await waitFor(() => expect(window.location.hash).toBe('#/'));
      expect(
        await screen.findByText('Pick a place from the sidebar.')
      ).toBeVisible();

      await user.click(
        within(await rail()).getByRole('button', { name: 'Collections' })
      );
      await waitFor(() => expect(window.location.hash).toBe('#/collections'));
    }
  );

  it('says that no screen is named home at #/screens/home once Home is removed', async () => {
    world.plugins = [removeHomePlugin];
    window.location.hash = '#/screens/home';
    renderAdmin();
    expect(await screen.findByText('No screen named “home”.')).toBeVisible();
    expect(await railRow('Home')).toBeNull();
  });

  it('has no Home row and no Home at #/ for a config with no Home plugin', async () => {
    world.withHome = false;
    const user = userEvent.setup();
    renderAdmin();
    expect(
      await screen.findByText('Pick a place from the sidebar.')
    ).toBeVisible();
    expect(await railRow('Home')).toBeNull();
    const results = await navigationResults(user);
    expect(results.queryByRole('button', { name: 'Home' })).toBeNull();
  });

  it('keeps Home as the first sidebar row, once, selected only on Home', async () => {
    window.location.hash = '#/collections';
    const user = userEvent.setup();
    renderAdmin();
    const rows = within(await rail()).getAllByRole('button');
    expect(rows[0]).toHaveAccessibleName('Home');
    expect(
      within(await rail()).getAllByRole('button', { name: 'Home' })
    ).toHaveLength(1);
    expect(rows[0]).not.toHaveAttribute('aria-current');
    const places = within(await rail()).getByRole('list', {
      name: 'Navigation',
    });
    expect(
      within(await rail())
        .getAllByRole('list')
        .filter((list) => list !== places)
        .flatMap((list) =>
          within(list).queryAllByRole('button', { name: 'Home' })
        )
    ).toEqual([]);

    await user.click(rows[0]);
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(await railRow('Home')).toHaveAttribute('aria-current', 'page');
    for (const name of ['Tools', 'Settings']) {
      await user.click(within(await rail()).getByRole('button', { name }));
      expect(await railRow('Home')).not.toHaveAttribute('aria-current');
    }
  });

  it('lists Home once in Search and opens #/ from it', async () => {
    window.location.hash = '#/collections';
    const user = userEvent.setup();
    renderAdmin();
    const results = await navigationResults(user);
    expect(results.getAllByRole('button', { name: 'Home' })).toHaveLength(1);
    await user.click(results.getByRole('button', { name: 'Home' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(
      await within(await screen.findByRole('main')).findByRole('heading', {
        name: 'Home',
      })
    ).toBeVisible();
  });

  it('replaces a built-in panel that throws with a sentence and Retry, and keeps the others working', async () => {
    consoleGuard.expect(/collections exploded/);
    // The Collections panel is the only panel that reads a collection's label.
    let broken = true;
    world.collections = [
      Object.defineProperty(collection('post'), 'label', {
        get: () => {
          if (broken) throw new Error('collections exploded');
          return 'Posts';
        },
      }),
    ];
    world.summaries.main = {
      post: [{ path: 'content/posts/hello.mdx', updatedAt: ago(HOUR) }],
    };
    const user = userEvent.setup();
    renderAdmin();
    const fallback = await panel('Panel');
    expect(
      within(fallback).getByText("Couldn't show this panel.")
    ).toBeVisible();
    expect(columnOf(fallback)).toBe('main');
    const recent = await panel('Recent documents');
    expect(
      await within(recent).findByRole('button', { name: /^hello/ })
    ).toBeVisible();

    await user.click(within(fallback).getByRole('button', { name: 'Retry' }));
    expect(
      within(await panel('Panel')).getByText("Couldn't show this panel.")
    ).toBeVisible();

    broken = false;
    await user.click(
      within(await panel('Panel')).getByRole('button', { name: 'Retry' })
    );
    expect(
      await within(await panel(/^Collections/)).findByText('1 document')
    ).toBeVisible();
    expect(screen.queryByText("Couldn't show this panel.")).toBeNull();

    await user.click(within(recent).getByRole('button', { name: /^hello/ }));
    await waitFor(() =>
      expect(window.location.hash).toBe(
        '#/collections/post/content%2Fposts%2Fhello.mdx'
      )
    );
  });
});

describe('Home head', () => {
  it('shows the local-files line, and Review N unsaved only while documents are unsaved', async () => {
    renderAdmin();
    expect(
      await screen.findByText(
        'Local files: Tina writes edits straight to disk.'
      )
    ).toBeVisible();
    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: 'Home' })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Review/ })).toBeNull();
  });

  it('opens the unsaved documents from Review N unsaved in local files', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Home' }));
    await user.click(
      await screen.findByRole('button', { name: 'Review 1 unsaved' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections?unsaved')
    );
    expect(
      await screen.findByRole('list', { name: 'Unsaved documents' })
    ).toBeVisible();
  });

  it('shows Home with no line, and Review N unsaved, for a provider that is not local and has no branches', async () => {
    world.mode = 'none';
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(
      await screen.findByRole('button', { name: 'Review 1 unsaved' })
    ).toBeVisible();
    expect(
      within(screen.getByRole('main')).queryByText(/^Local files/)
    ).toBeNull();
    expect(
      within(screen.getByRole('main')).queryByRole('region', { name: 'Branch' })
    ).toBeNull();
  });
});

describe('Collections panel', () => {
  it('shows a tile per collection in schema order with its count and a disabled New', async () => {
    renderAdmin();
    const collections = await panel('Collections 2');
    const list = within(collections).getByRole('list', { name: 'Collections' });
    const tiles = within(list).getAllByRole('listitem');
    expect(tiles).toHaveLength(2);
    expect(await within(tiles[0]).findByText('2 documents')).toBeVisible();
    expect(
      within(tiles[0]).getByRole('button', { name: 'Posts' })
    ).toBeVisible();
    expect(
      within(tiles[0]).getByRole('button', { name: 'New Posts document' })
    ).toBeDisabled();
    expect(
      within(tiles[1]).getByRole('button', { name: 'page' })
    ).toBeVisible();
    expect(within(tiles[1]).getByText('1 document')).toBeVisible();
  });

  it('says No collections yet. when the schema has none', async () => {
    world.collections = [];
    renderAdmin();
    const collections = await panel('Collections 0');
    expect(within(collections).getByText('No collections yet.')).toBeVisible();
  });

  it('opens the document table of a collection from its tile, by keyboard', async () => {
    const user = userEvent.setup();
    renderAdmin();
    const collections = await panel(/^Collections/);
    const tile = within(collections).getByRole('button', { name: 'Posts' });
    tile.focus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
    );
  });

  it('shows the name at once and a placeholder for the count while a list loads', async () => {
    let release: (summaries: DocumentSummary[]) => void = () => {};
    world.list = (name) =>
      name === 'post'
        ? new Promise((resolve) => {
            release = resolve;
          })
        : Promise.resolve([]);
    renderAdmin();
    const collections = await panel(/^Collections/);
    const [posts, pages] = within(collections).getAllByRole('listitem');
    expect(within(posts).getByRole('button', { name: 'Posts' })).toBeVisible();
    expect(posts.querySelector('[data-slot=skeleton]')).not.toBeNull();
    expect(await within(pages).findByText('0 documents')).toBeVisible();
    release([{ path: 'content/posts/hello.mdx' }]);
    expect(await within(posts).findByText('1 document')).toBeVisible();
    expect(posts.querySelector('[data-slot=skeleton]')).toBeNull();
  });

  it('shows the name and no count when a list fails, says so with Retry, and still opens the collection', async () => {
    let offline = true;
    world.list = async (name) => {
      if (name === 'post' && offline) throw new Error('offline');
      return name === 'post' ? [{ path: 'content/posts/hello.mdx' }] : [];
    };
    const user = userEvent.setup();
    renderAdmin();
    const collections = await panel(/^Collections/);
    const [posts, pages] = within(collections).getAllByRole('listitem');
    expect(await within(pages).findByText('0 documents')).toBeVisible();
    expect(
      await within(collections).findByText(
        "Couldn't load every document count."
      )
    ).toBeVisible();
    expect(posts.querySelector('[data-slot=skeleton]')).toBeNull();
    expect(within(posts).queryByText(/documents?$/)).toBeNull();

    listCalls = [];
    await user.click(
      within(collections).getByRole('button', { name: 'Retry' })
    );
    expect(
      await within(collections).findByText(
        "Couldn't load every document count."
      )
    ).toBeVisible();
    expect(listCalls).toEqual(['post']);

    offline = false;
    await user.click(
      within(collections).getByRole('button', { name: 'Retry' })
    );
    expect(await within(posts).findByText('1 document')).toBeVisible();
    expect(
      within(collections).queryByText("Couldn't load every document count.")
    ).toBeNull();
    await waitFor(() => expect(collections).toHaveFocus());
    await waitFor(() =>
      expect(
        collections.querySelector('[data-slot=announcement]')
      ).toHaveTextContent('Posts, 1 document. page, 0 documents')
    );
    expect(
      within(collections).queryByRole('button', { name: 'Retry' })
    ).toBeNull();

    await user.click(within(posts).getByRole('button', { name: 'Posts' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
    );
  });

  it('shows no failure line while every list loads or is read', async () => {
    renderAdmin();
    const collections = await panel(/^Collections/);
    expect(await within(collections).findByText('2 documents')).toBeVisible();
    expect(
      within(collections).queryByRole('button', { name: 'Retry' })
    ).toBeNull();
  });

  it('shows one-line rows with the count and no New on a phone', async () => {
    setWidth(390);
    renderAdmin();
    const collections = await panel(/^Collections/);
    const rows = within(collections).getAllByRole('listitem');
    expect(await within(rows[0]).findByText('2 documents')).toBeVisible();
    expect(
      within(rows[0]).getByRole('button', { name: /^Posts/ })
    ).toBeVisible();
    expect(
      within(collections).queryByRole('button', { name: /^New/ })
    ).toBeNull();
    expect(collections.querySelector('[data-slot=tile]')).toBeNull();
  });
});

describe('Recent documents panel', () => {
  it('lists unsaved documents first in path order, then dated documents newest first, across collections', async () => {
    fixClock();
    world.summaries.main = {
      post: [
        { path: 'content/posts/old.mdx', updatedAt: ago(3 * DAY) },
        { path: 'content/posts/tie-b.mdx', updatedAt: ago(2 * HOUR) },
        { path: 'content/posts/mine-b.mdx', updatedAt: ago(MINUTE) },
        { path: 'content/posts/undated.mdx' },
        { path: 'content/posts/bad-date.mdx', updatedAt: 'last tuesday' },
      ],
      page: [
        { path: 'content/pages/tie-a.mdx', updatedAt: ago(2 * HOUR) },
        { path: 'content/pages/newest.mdx', updatedAt: ago(5 * MINUTE) },
        { path: 'content/pages/mine-a.mdx' },
        { path: 'content/posts/old.mdx', updatedAt: ago(3 * DAY) },
      ],
    };
    keepDraft('content/posts/mine-b.mdx');
    keepDraft('content/pages/mine-a.mdx');
    keepDraft('content/posts/deleted.mdx');
    renderAdmin();
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    expect(recentRows(recent)).toEqual([
      'mine-aUnsaved',
      'mine-bUnsaved',
      'newest5 minutes ago',
      'tie-a2 hours ago',
      'tie-b2 hours ago',
      'old3 days ago',
    ]);
  });

  it('shows who and when where the provider knows them, the title where it sets one, and opens the document', async () => {
    fixClock();
    world.summaries.main = {
      post: [
        {
          path: 'content/posts/hello.mdx',
          title: 'Hello world',
          updatedAt: ago(30_000),
          lastAuthor: { name: 'Ada Lovelace' },
        },
        { path: 'content/posts/second.mdx', updatedAt: ago(30 * DAY) },
      ],
    };
    const user = userEvent.setup();
    renderAdmin();
    const recent = await panel('Recent documents');
    const hello = await within(recent).findByRole('button', {
      name: /^Hello world/,
    });
    expect(within(hello).getByText('Ada Lovelace')).toBeVisible();
    expect(within(hello).getByText('just now')).toHaveAttribute(
      'datetime',
      ago(30_000)
    );
    expect(hello.closest('li')).toHaveAttribute(
      'title',
      'content/posts/hello.mdx'
    );
    const second = within(recent).getByRole('button', { name: /^second/ });
    expect(second.querySelector('[data-slot=avatar]')).toBeNull();
    expect(within(second).getByText(/2026/)).toHaveAttribute(
      'title',
      expect.stringMatching(/2026/)
    );
    await user.click(hello);
    await waitFor(() =>
      expect(window.location.hash).toBe(
        '#/collections/post/content%2Fposts%2Fhello.mdx'
      )
    );
  });

  it('holds placeholder rows until every list settles', async () => {
    let release: (summaries: DocumentSummary[]) => void = () => {};
    world.list = (name) =>
      name === 'page'
        ? new Promise((resolve) => {
            release = resolve;
          })
        : Promise.resolve([
            { path: 'content/posts/hello.mdx', updatedAt: ago(HOUR) },
          ]);
    renderAdmin();
    const recent = await panel('Recent documents');
    const sheet = recent.querySelector('[data-slot=home-panel-sheet]');
    expect(sheet).toHaveAttribute('aria-busy', 'true');
    expect(
      await within(recent).findAllByText('Loading Recent documents')
    ).toHaveLength(1);
    expect(within(recent).queryByRole('button', { name: /^hello/ })).toBeNull();
    release([]);
    expect(
      await within(recent).findByRole('button', { name: /^hello/ })
    ).toBeVisible();
    expect(sheet).not.toHaveAttribute('aria-busy');
  });

  it('says it could not load when one list fails, keeps the other panels, and Retry reads the failed list again', async () => {
    let offline = true;
    world.list = async (name) => {
      if (name === 'post' && offline) throw new Error('offline');
      return [{ path: `content/${name}s/hello.mdx`, updatedAt: ago(HOUR) }];
    };
    const user = userEvent.setup();
    renderAdmin();
    const recent = await panel('Recent documents');
    expect(
      await within(recent).findByText("Couldn't load recent documents.")
    ).toBeVisible();
    const collections = await panel(/^Collections/);
    expect(within(collections).getByText('1 document')).toBeVisible();

    listCalls = [];
    await user.click(within(recent).getByRole('button', { name: 'Retry' }));
    expect(
      await within(recent).findByText("Couldn't load recent documents.")
    ).toBeVisible();
    expect(listCalls).toEqual(['post']);

    offline = false;
    await user.click(within(recent).getByRole('button', { name: 'Retry' }));
    expect(
      await within(recent).findAllByRole('button', { name: /^hello/ })
    ).toHaveLength(2);
    await waitFor(() => expect(recent).toHaveFocus());
    await waitFor(() =>
      expect(
        recent.querySelector('[data-slot=announcement]')
      ).toHaveTextContent(/hello/)
    );
  });

  it('says Not available on this setup, with no Retry, for a provider that lists only paths', async () => {
    renderAdmin();
    const recent = await panel('Recent documents');
    expect(
      await within(recent).findByText('Not available on this setup')
    ).toBeVisible();
    expect(within(recent).queryByRole('button', { name: 'Retry' })).toBeNull();
    const collections = await panel(/^Collections/);
    expect(within(collections).getByText('2 documents')).toBeVisible();
  });

  it('shows only the unsaved documents when the provider has no dates', async () => {
    keepDraft('content/posts/second.mdx');
    renderAdmin();
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    expect(recentRows(recent)).toEqual(['secondUnsaved']);
  });

  it('stays and says Nothing edited yet. when no document is listed', async () => {
    world.summaries = {};
    renderAdmin();
    const recent = await panel('Recent documents');
    expect(
      await within(recent).findByText('Nothing edited yet.')
    ).toBeVisible();
    expect(within(recent).queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('moves a saved document from the unsaved rows to the top of the dated rows, without a reload', async () => {
    world.summaries.main = {
      post: [
        { path: 'content/posts/hello.mdx', updatedAt: ago(2 * DAY) },
        { path: 'content/posts/second.mdx', updatedAt: ago(DAY) },
      ],
    };
    world.update = async (_name, path, value) => ({
      path,
      document: value,
      updatedAt: new Date(NOW + MINUTE).toISOString(),
    });
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Home' }));
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    expect(recentRows(recent)[0]).toBe('helloUnsaved');

    await user.click(within(recent).getByRole('button', { name: /^hello/ }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    );
    listCalls = [];
    await user.click(screen.getByRole('button', { name: 'Home' }));
    const after = await panel('Recent documents');
    await within(after).findByRole('list', { name: 'Recent documents' });
    const rows = recentRows(after);
    expect(rows[0]).toMatch(/^hello(?!Unsaved)/);
    expect(rows[1]).toMatch(/^second/);
    expect(rows).toHaveLength(2);
    expect(listCalls).toEqual([]);
  });

  it('puts a document saved through a server hook at the top of the dated rows, without a reload', async () => {
    const stampPlugin = definePlugin({
      name: 'test:stamp',
      provides: ['hooks'],
      hooks: ['stamp'],
      serverHooks: ['stamp'],
      client: async () => ({ default: { hooks: { stamp: () => ({}) } } }),
    });
    world.plugins = [stampPlugin];
    world.collections = [
      collection('post', { label: 'Posts', hooks: [{ name: 'stamp' }] }),
    ];
    world.summaries.main = {
      post: [
        { path: 'content/posts/hello.mdx', updatedAt: ago(2 * DAY) },
        { path: 'content/posts/second.mdx', updatedAt: ago(DAY) },
      ],
    };
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const { path, value } = JSON.parse(String(init?.body));
      return Response.json({
        entry: {
          path,
          document: value,
          updatedAt: new Date(NOW + MINUTE).toISOString(),
        },
        hookWarnings: [],
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderAdmin();
    const recent = await panel('Recent documents');
    await user.click(
      await within(recent).findByRole('button', { name: /^hello/ })
    );
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    );
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/tina/content/update',
    ]);
    listCalls = [];
    await user.click(screen.getByRole('button', { name: 'Home' }));
    const after = await panel('Recent documents');
    await within(after).findByRole('list', { name: 'Recent documents' });
    const rows = recentRows(after);
    expect(rows[0]).toMatch(/^hello(?!Unsaved)/);
    expect(rows[1]).toMatch(/^second/);
    expect(listCalls).toEqual([]);
  });

  it('scrolls inside the panel on a desktop: 20 rows, then more as the end comes into view, with no new request', async () => {
    observers = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    world.summaries.main = { post: manyPosts(45) };
    renderAdmin();
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    expect(recentRows(recent)).toHaveLength(20);
    expect(
      within(recent).queryByRole('button', { name: 'Show more' })
    ).toBeNull();
    listCalls = [];
    act(() => observers.at(-1)?.intersect());
    expect(recentRows(recent)).toHaveLength(40);
    act(() => observers.at(-1)?.intersect());
    expect(recentRows(recent)).toHaveLength(45);
    expect(observers).toHaveLength(0);
    expect(listCalls).toEqual([]);
  });

  it.each([
    ['tablet', 1024],
    ['phone', 390],
  ])(
    'shows five rows on a %s and adds five per Show more, then moves focus to the first new row',
    async (_tier, width) => {
      setWidth(width);
      world.summaries.main = { post: manyPosts(12) };
      const user = userEvent.setup();
      renderAdmin();
      const recent = await panel('Recent documents');
      await within(recent).findByRole('list', { name: 'Recent documents' });
      expect(recentRows(recent)).toHaveLength(5);

      listCalls = [];
      await user.click(
        within(recent).getByRole('button', { name: 'Show more' })
      );
      expect(recentRows(recent)).toHaveLength(10);
      expect(
        within(recent).getByRole('button', { name: 'Show more' })
      ).toHaveFocus();

      await user.click(
        within(recent).getByRole('button', { name: 'Show more' })
      );
      expect(recentRows(recent)).toHaveLength(12);
      expect(
        within(recent).queryByRole('button', { name: 'Show more' })
      ).toBeNull();
      await waitFor(() =>
        expect(
          within(recent).getByRole('button', { name: /^post-10/ })
        ).toHaveFocus()
      );
      expect(listCalls).toEqual([]);
    }
  );

  it('shows the avatar with the name for a screen reader, and no name text, on a phone', async () => {
    setWidth(390);
    world.summaries.main = {
      post: [
        {
          path: 'content/posts/hello.mdx',
          updatedAt: ago(HOUR),
          lastAuthor: { name: 'Ada Lovelace' },
        },
      ],
    };
    renderAdmin();
    const recent = await panel('Recent documents');
    const row = await within(recent).findByRole('button', { name: /^hello/ });
    expect(
      within(row).getByRole('img', { name: 'Ada Lovelace' })
    ).toBeVisible();
    expect(within(row).queryByText('Ada Lovelace')).toBeNull();
  });

  it('starts again at five rows, and moves no focus, when a branch switch changes the rows', async () => {
    setWidth(1024);
    world.mode = 'branches';
    world.summaries.main = { post: manyPosts(12) };
    world.summaries['feature/news'] = { post: manyPosts(7) };
    const user = userEvent.setup();
    const switchTo = async (name: string) => {
      await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
      await user.click(
        await within(await screen.findByRole('dialog')).findByText(name)
      );
      await within(await panel('Branch')).findByText(name);
    };
    renderAdmin();
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    expect(recentRows(recent)).toHaveLength(5);

    await switchTo('feature/news');
    await waitFor(() =>
      expect(
        within(recent).getByRole('button', { name: 'Show more' })
      ).toBeVisible()
    );
    await user.click(within(recent).getByRole('button', { name: 'Show more' }));
    expect(recentRows(recent)).toHaveLength(7);

    // The lists of `main` are in the cache, so the rows change with no loading state between.
    listCalls = [];
    await switchTo('main');
    expect(listCalls).toEqual([]);
    expect(recentRows(recent)).toHaveLength(5);
    expect(
      within(recent).getByRole('button', { name: 'Show more' })
    ).toBeVisible();
    expect(recent.contains(document.activeElement)).toBe(false);
  });

  it('does not open a row from the second click of a double click on Show more', async () => {
    setWidth(1024);
    world.summaries.main = { post: manyPosts(12) };
    const user = userEvent.setup();
    renderAdmin();
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    await user.click(within(recent).getByRole('button', { name: 'Show more' }));
    await user.click(within(recent).getByRole('button', { name: /^post-05/ }));
    expect(window.location.hash).toBe('');
    expect(recentRows(recent)).toHaveLength(10);

    await new Promise((resolve) => setTimeout(resolve, 550));
    await user.click(within(recent).getByRole('button', { name: /^post-05/ }));
    await waitFor(() =>
      expect(window.location.hash).toBe(
        '#/collections/post/content%2Fposts%2Fpost-05.mdx'
      )
    );
  });

  it('shows no Show more for five rows or fewer', async () => {
    setWidth(390);
    world.summaries.main = { post: manyPosts(5) };
    renderAdmin();
    const recent = await panel('Recent documents');
    await within(recent).findByRole('list', { name: 'Recent documents' });
    expect(recentRows(recent)).toHaveLength(5);
    expect(
      within(recent).queryByRole('button', { name: 'Show more' })
    ).toBeNull();
  });
});

describe('Branch panel', () => {
  beforeEach(() => {
    world.mode = 'branches';
    world.summaries['feature/news'] = {
      post: [{ path: 'content/posts/breaking.mdx', updatedAt: ago(HOUR) }],
    };
  });

  it('shows the default branch and Protected, and leaves the head as just Home', async () => {
    renderAdmin();
    const branch = await panel('Branch');
    expect(await within(branch).findByText('main')).toBeVisible();
    expect(within(branch).getByText('Protected')).toBeVisible();
    expect(
      within(branch).queryByRole('button', { name: /^Review/ })
    ).toBeNull();
    expect(within(branch).queryByText(/not saved yet/)).toBeNull();
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { name: 'Home' })).toBeVisible();
    expect(within(main).queryByText(/^Local files/)).toBeNull();
    expect(
      await within(await panel('Recent documents')).findByText(
        'Not available on this setup'
      )
    ).toBeVisible();
  });

  it('shows a chosen branch with no Protected line when it is not protected', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('feature/news'));
    const branch = await panel('Branch');
    expect(await within(branch).findByText('feature/news')).toBeVisible();
    expect(within(branch).queryByText('Protected')).toBeNull();
  });

  it('holds Review N unsaved, and the head does not', async () => {
    keepDraft('content/posts/hello.mdx');
    keepDraft('content/posts/second.mdx');
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText('2 documents not saved yet')
    ).toBeVisible();
    expect(screen.getAllByRole('button', { name: /^Review/ })).toHaveLength(1);
    await user.click(
      within(branch).getByRole('button', { name: 'Review 2 unsaved' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections?unsaved')
    );
  });

  it('says 1 document not saved yet for one', async () => {
    keepDraft('content/posts/hello.mdx');
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText('1 document not saved yet')
    ).toBeVisible();
    expect(
      within(branch).getByRole('button', { name: 'Review 1 unsaved' })
    ).toBeVisible();
  });

  const chooseBranch = (name: string) =>
    localStorage.setItem(
      'tina-store',
      JSON.stringify({ state: { branch: { current: name } }, version: 0 })
    );

  const keepBranchDraft = (path: string, branch: string) =>
    localStorage.setItem(
      draftKey(toFormId(path), undefined, branch),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: path },
      })
    );

  const holdBranchList = () => {
    let release: (branches: BranchInfo[]) => void = () => {};
    world.listBranches = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    return () => release(world.branches);
  };

  const failBranchList = () => {
    const read = { offline: true, count: 0 };
    world.listBranches = async () => {
      read.count += 1;
      if (read.offline) throw new Error('offline');
      return world.branches;
    };
    return read;
  };

  const busyParts = (branch: HTMLElement) =>
    [...branch.querySelectorAll('[aria-busy=true]')].map((part) =>
      part.getAttribute('data-slot')
    );

  it('shows a chosen branch and a busy pull request row while the branch list is read', async () => {
    world.branches = [
      { name: 'main', protected: true },
      {
        name: 'feature/news',
        protected: true,
        pullRequestUrl: 'https://github.com/acme/site/pull/12',
      },
    ];
    chooseBranch('feature/news');
    const release = holdBranchList();
    renderAdmin();
    const branch = await panel('Branch');
    expect(within(branch).getByText('feature/news')).toBeVisible();
    expect(busyParts(branch)).toEqual(['pull-request-row']);
    expect(
      await within(branch).findAllByText('Loading pull request')
    ).toHaveLength(1);
    expect(within(branch).queryByText('Loading Branch')).toBeNull();
    expect(within(branch).queryByText('Protected')).toBeNull();
    expect(within(branch).queryByRole('link')).toBeNull();
    release();
    expect(
      await within(branch).findByRole('link', { name: /^Pull request #12/ })
    ).toBeVisible();
    expect(within(branch).getByText('Protected')).toBeVisible();
    expect(busyParts(branch)).toEqual([]);
    expect(within(branch).queryByText('Loading pull request')).toBeNull();
  });

  it('holds a hidden placeholder for the name while the default branch is not known yet', async () => {
    const release = holdBranchList();
    renderAdmin();
    const branch = await panel('Branch');
    expect(within(branch).queryByText('main')).toBeNull();
    expect(busyParts(branch)).toEqual(['pull-request-row']);
    const hidden = branch.querySelector(
      '[data-slot=home-panel-sheet] [aria-hidden=true]:not([data-slot])'
    );
    expect(hidden).not.toBeNull();
    expect(hidden).not.toHaveAttribute('aria-busy');
    release();
    expect(await within(branch).findByText('main')).toBeVisible();
    expect(within(branch).getByText('No pull request yet')).toBeVisible();
  });

  it('keeps the branch name and puts the failure, with Retry, in the pull request row', async () => {
    consoleGuard.expect(/could not list branches/);
    world.branches = [
      { name: 'main' },
      {
        name: 'feature/news',
        protected: true,
        pullRequestUrl: 'https://github.com/acme/site/pull/12',
      },
    ];
    chooseBranch('feature/news');
    const read = failBranchList();
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText(
        "Couldn't load this branch's pull request."
      )
    ).toBeVisible();
    expect(within(branch).getByText('feature/news')).toBeVisible();
    expect(busyParts(branch)).toEqual([]);
    expect(
      await within(await panel(/^Collections/)).findByText('1 document')
    ).toBeVisible();

    await user.click(within(branch).getByRole('button', { name: 'Retry' }));
    expect(
      await within(branch).findByText(
        "Couldn't load this branch's pull request."
      )
    ).toBeVisible();
    expect(within(branch).getByRole('button', { name: 'Retry' })).toBeVisible();
    expect(within(branch).getByText('feature/news')).toBeVisible();
    expect(read.count).toBe(2);

    read.offline = false;
    await user.click(within(branch).getByRole('button', { name: 'Retry' }));
    expect(
      await within(branch).findByRole('link', { name: /^Pull request #12/ })
    ).toBeVisible();
    expect(within(branch).getByText('Protected')).toBeVisible();
    expect(
      within(branch).queryByText("Couldn't load this branch's pull request.")
    ).toBeNull();
    await waitFor(() => expect(branch).toHaveFocus());
    await waitFor(() =>
      expect(
        branch.querySelector('[data-slot=announcement]')
      ).toHaveTextContent('Pull request #12')
    );
  });

  it('moves no focus to the Branch panel when a later read from the branch switcher works after a panel Retry that failed', async () => {
    consoleGuard.expect(/could not list branches/);
    const read = failBranchList();
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    await user.click(
      await within(branch).findByRole('button', { name: 'Retry' })
    );
    await waitFor(() => expect(read.count).toBe(2));
    await within(branch).findByRole('button', { name: 'Retry' });

    await user.click(await screen.findByRole('button', { name: 'Branches' }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    read.offline = false;
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
    expect(
      await within(dialog).findByRole('button', { name: /^main/ })
    ).toBeVisible();
    expect(await within(branch).findByText('main')).toBeInTheDocument();
    expect(branch).not.toHaveFocus();
    expect(branch.querySelector('[data-slot=announcement]')).toBeNull();
  });

  it('leaves the name out when the default branch read fails, and shows it after a Retry that works', async () => {
    consoleGuard.expect(/could not list branches/);
    const read = failBranchList();
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText(
        "Couldn't load this branch's pull request."
      )
    ).toBeVisible();
    expect(within(branch).queryByText('main')).toBeNull();
    read.offline = false;
    await user.click(within(branch).getByRole('button', { name: 'Retry' }));
    expect(await within(branch).findByText('main')).toBeVisible();
    expect(within(branch).getByText('No pull request yet')).toBeVisible();
    await waitFor(() => expect(branch).toHaveFocus());
  });

  it('still shows the branch name and Review N unsaved when the branch list fails', async () => {
    consoleGuard.expect(/could not list branches/);
    chooseBranch('feature/news');
    keepBranchDraft('content/posts/breaking.mdx', 'feature/news');
    failBranchList();
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText(
        "Couldn't load this branch's pull request."
      )
    ).toBeVisible();
    expect(within(branch).getByRole('button', { name: 'Retry' })).toBeVisible();
    expect(within(branch).getByText('feature/news')).toBeVisible();
    expect(within(branch).getByText('1 document not saved yet')).toBeVisible();
    const main = screen.getByRole('main');
    expect(
      within(main).getAllByRole('button', { name: /^Review/ })
    ).toHaveLength(1);
    expect(within(main).queryByText(/^Local files/)).toBeNull();
    await user.click(
      within(branch).getByRole('button', { name: 'Review 1 unsaved' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections?unsaved')
    );
  });

  it('still shows the branch name and Review N unsaved while the branch list is read', async () => {
    chooseBranch('feature/news');
    keepBranchDraft('content/posts/breaking.mdx', 'feature/news');
    holdBranchList();
    renderAdmin();
    const branch = await panel('Branch');
    expect(within(branch).getByText('feature/news')).toBeVisible();
    expect(
      await within(branch).findByText('1 document not saved yet')
    ).toBeVisible();
    expect(
      within(branch).getByRole('button', { name: 'Review 1 unsaved' })
    ).toBeVisible();
    expect(busyParts(branch)).toEqual(['pull-request-row']);
    expect(
      within(screen.getByRole('main')).getAllByRole('button', {
        name: /^Review/,
      })
    ).toHaveLength(1);
  });

  it('still shows Review N unsaved when no branch is chosen and the branch list fails', async () => {
    consoleGuard.expect(/could not list branches/);
    keepDraft('content/posts/hello.mdx');
    failBranchList();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText(
        "Couldn't load this branch's pull request."
      )
    ).toBeVisible();
    expect(within(branch).getByText('1 document not saved yet')).toBeVisible();
    expect(
      within(branch).getByRole('button', { name: 'Review 1 unsaved' })
    ).toBeVisible();
    expect(
      within(screen.getByRole('main')).getAllByRole('button', {
        name: /^Review/,
      })
    ).toHaveLength(1);
  });

  it('shows no unsaved footer when the branch list fails and nothing is unsaved', async () => {
    consoleGuard.expect(/could not list branches/);
    chooseBranch('feature/news');
    failBranchList();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText(
        "Couldn't load this branch's pull request."
      )
    ).toBeVisible();
    expect(within(branch).getByText('feature/news')).toBeVisible();
    expect(within(branch).queryByText(/not saved yet/)).toBeNull();
    expect(screen.queryByRole('button', { name: /^Review/ })).toBeNull();
  });

  it('links the pull request of the current branch by its number, in a new tab', async () => {
    world.branches = [
      {
        name: 'main',
        protected: true,
        pullRequestUrl: 'https://github.com/acme/site/pull/12',
      },
    ];
    renderAdmin();
    const link = await within(await panel('Branch')).findByRole('link', {
      name: /^Pull request #12/,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/acme/site/pull/12'
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('says Pull request, and still links, when the address has no number', async () => {
    world.branches = [
      { name: 'main', pullRequestUrl: 'https://git.example.com/review/abc' },
    ];
    renderAdmin();
    const link = await within(await panel('Branch')).findByRole('link', {
      name: /^Pull request(?! #)/,
    });
    expect(link).toHaveAttribute('href', 'https://git.example.com/review/abc');
  });

  it.each([
    ['missing', undefined],
    ['an empty string', ''],
    ['not a web address', 'javascript:alert(1)'],
  ])(
    'says No pull request yet, with no link, when the address is %s',
    async (_case, pullRequestUrl) => {
      world.branches = [{ name: 'main', pullRequestUrl }];
      renderAdmin();
      const branch = await panel('Branch');
      expect(
        await within(branch).findByText('No pull request yet')
      ).toBeVisible();
      expect(within(branch).queryByRole('link')).toBeNull();
    }
  );

  it("shows the new branch's pull request after a switch, never the previous one's", async () => {
    world.branches = [
      { name: 'main', pullRequestUrl: 'https://github.com/acme/site/pull/1' },
      { name: 'feature/news' },
      {
        name: 'feature/docs',
        pullRequestUrl: 'https://github.com/acme/site/pull/7',
      },
    ];
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByRole('link', { name: /^Pull request #1\b/ })
    ).toBeVisible();

    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('feature/news'));
    expect(
      await within(branch).findByText('No pull request yet')
    ).toBeVisible();
    expect(within(branch).queryByRole('link')).toBeNull();

    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('feature/docs'));
    expect(
      await within(branch).findByRole('link', { name: /^Pull request #7\b/ })
    ).toBeVisible();
    expect(within(branch).getAllByRole('link')).toHaveLength(1);
  });

  it('puts Recent documents then Branch in the side column on a desktop', async () => {
    renderAdmin();
    const branch = await panel('Branch');
    expect(panelTitles()).toEqual([
      expect.stringMatching(/^Collections/),
      'Recent documents',
      'Branch',
    ]);
    expect(columnOf(branch)).toBe('side');
    expect(columnOf(await panel('Recent documents'))).toBe('side');
  });

  it.each([
    ['tablet', 1024],
    ['phone', 390],
  ])('starts the one column at Branch on a %s', async (_tier, width) => {
    setWidth(width);
    renderAdmin();
    await panel('Branch');
    expect(panelTitles()).toEqual([
      'Branch',
      'Recent documents',
      expect.stringMatching(/^Collections/),
    ]);
  });

  it("shows the new branch's documents and unsaved count after a switch", async () => {
    world.summaries.main = {
      post: [{ path: 'content/posts/hello.mdx', updatedAt: ago(DAY) }],
    };
    localStorage.setItem(
      draftKey(
        toFormId('content/posts/breaking.mdx'),
        undefined,
        'feature/news'
      ),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'content/posts/breaking.mdx' },
      })
    );
    const user = userEvent.setup();
    renderAdmin();
    const recent = await panel('Recent documents');
    expect(
      await within(recent).findByRole('button', { name: /^hello/ })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Review/ })).toBeNull();

    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('feature/news'));

    expect(
      await within(recent).findByRole('button', { name: /^breaking/ })
    ).toBeVisible();
    expect(recentRows(recent)).toEqual(['breakingUnsaved']);
    expect(
      await within(await panel('Branch')).findByRole('button', {
        name: 'Review 1 unsaved',
      })
    ).toBeVisible();
  });

  it('says Nothing edited on this branch yet. when the branch has no documents', async () => {
    world.summaries = {};
    renderAdmin();
    expect(
      await within(await panel('Recent documents')).findByText(
        'Nothing edited on this branch yet.'
      )
    ).toBeVisible();
  });
});

describe('Home in local files', () => {
  it.each([
    ['desktop', 1440],
    ['tablet', 1024],
    ['phone', 390],
  ])('has no Branch panel on a %s', async (_tier, width) => {
    setWidth(width);
    renderAdmin();
    await panel('Recent documents');
    expect(panelTitles()).toEqual(
      width >= 1280
        ? [expect.stringMatching(/^Collections/), 'Recent documents']
        : ['Recent documents', expect.stringMatching(/^Collections/)]
    );
    expect(screen.queryByText('Branch')).toBeNull();
  });
});
