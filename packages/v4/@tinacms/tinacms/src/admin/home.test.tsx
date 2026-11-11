import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { BranchInfo } from '../core/branch/contract';
import { currentBranchOf } from '../core/branch/contract';
import type { DocumentEntry, DocumentSummary } from '../core/content/contract';
import { type PluginManifest, definePlugin } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import type {
  HomePanelContext,
  HomePanelContribution,
} from '../core/slot/contract';
import { draftKey } from '../form/drafts';
import { toFormId } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import homePanelsPlugin from '../plugins/home/home-panels.plugin';
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

const panelPlugin = (name: string, panels: HomePanelContribution[]) =>
  definePlugin({
    name,
    client: async () => ({ default: { slots: { 'home.panel': panels } } }),
  });

const searchPlugin = definePlugin({
  name: 'test:search',
  provides: ['search'],
  client: async () => ({
    default: { slice: () => ({ search: async () => [] }) },
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

const renderAdmin = () =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin(),
          stringFieldPlugin,
          homePanelsPlugin,
          ...world.plugins,
        ],
        schema: { collections: world.collections },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

const home = () => within(screen.getByRole('main'));

const panelTitles = () =>
  home()
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

const Stats = ({ tier }: HomePanelContext) => (
  <HomePanelTray title='Stats'>
    <p>stats on a {tier}</p>
  </HomePanelTray>
);

const Notes = () => (
  <HomePanelTray title='Notes'>
    <p>notes</p>
  </HomePanelTray>
);

describe('Home panel slot', () => {
  it('renders a panel that a plugin contributes, and passes it the width tier', async () => {
    world.plugins = [
      panelPlugin('acme:stats', [
        { id: 'stats', component: Stats, column: 'side' },
      ]),
    ];
    renderAdmin();
    const stats = await panel('Stats');
    expect(within(stats).getByText('stats on a desktop')).toBeVisible();
  });

  it('refuses to start when two plugins contribute the same panel id, and names both', async () => {
    consoleGuard.expect(/home-panel-duplicate-id/);
    world.plugins = [
      panelPlugin('acme:stats', [
        { id: 'stats', component: Stats, column: 'side' },
      ]),
      panelPlugin('acme:other', [
        { id: 'stats', component: Notes, column: 'main' },
      ]),
    ];
    renderAdmin();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'Plugin "acme:other" contributes the Home panel "stats", but plugin "acme:stats" already contributes a panel with that id.'
    );
  });

  it('refuses a project panel that reuses a built-in id', async () => {
    consoleGuard.expect(/home-panel-duplicate-id/);
    world.plugins = [
      panelPlugin('acme:mine', [
        { id: 'collections', component: Notes, column: 'main' },
      ]),
    ];
    renderAdmin();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /"acme:mine" .* "collections", but plugin "tina:home:core"/
    );
  });

  it('puts main and side panels in their desktop columns by order', async () => {
    world.plugins = [
      panelPlugin('acme:panels', [
        { id: 'notes', component: Notes, column: 'main', order: 5 },
        { id: 'stats', component: Stats, column: 'side', order: 5 },
      ]),
    ];
    renderAdmin();
    await panel('Stats');
    expect(panelTitles()).toEqual([
      'Notes',
      expect.stringMatching(/^Collections/),
      'Stats',
      'Recent documents',
    ]);
    expect(columnOf(await panel('Notes'))).toBe('main');
    expect(columnOf(await panel(/^Collections/))).toBe('main');
    expect(columnOf(await panel('Stats'))).toBe('side');
  });

  it.each([
    ['tablet', 1024],
    ['phone', 390],
  ])(
    'stacks every panel in one column by narrowOrder on a %s',
    async (tier, width) => {
      setWidth(width);
      world.plugins = [
        panelPlugin('acme:panels', [
          { id: 'notes', component: Notes, column: 'main', order: 35 },
          {
            id: 'stats',
            component: Stats,
            column: 'side',
            order: 99,
            narrowOrder: 1,
          },
        ]),
      ];
      renderAdmin();
      const stats = await panel('Stats');
      expect(within(stats).getByText(`stats on a ${tier}`)).toBeVisible();
      expect(panelTitles()).toEqual([
        'Stats',
        'Recent documents',
        expect.stringMatching(/^Collections/),
        'Notes',
      ]);
      expect(columnOf(stats)).toBe('narrow');
    }
  );

  it('leaves out a panel whose capability no plugin provides, with no tray', async () => {
    world.plugins = [
      panelPlugin('acme:panels', [
        {
          id: 'stats',
          component: Stats,
          column: 'side',
          dependsOn: ['search'],
        },
      ]),
    ];
    renderAdmin();
    await panel(/^Collections/);
    expect(panelTitles()).toEqual([
      expect.stringMatching(/^Collections/),
      'Recent documents',
    ]);
  });

  it('mounts a panel once a plugin provides its capability', async () => {
    world.plugins = [
      searchPlugin,
      panelPlugin('acme:panels', [
        {
          id: 'stats',
          component: Stats,
          column: 'side',
          dependsOn: ['search'],
        },
      ]),
    ];
    renderAdmin();
    expect(await panel('Stats')).toBeVisible();
  });

  it('replaces a panel that throws with a sentence and Retry, and keeps the others working', async () => {
    consoleGuard.expect(/stats exploded/);
    let broken = true;
    const Flaky = () => {
      if (broken) throw new Error('stats exploded');
      return (
        <HomePanelTray title='Stats'>
          <p>stats are back</p>
        </HomePanelTray>
      );
    };
    world.plugins = [
      panelPlugin('acme:panels', [
        { id: 'stats', component: Flaky, column: 'side' },
      ]),
    ];
    const user = userEvent.setup();
    renderAdmin();
    const fallback = await panel('Panel');
    expect(
      within(fallback).getByText("Couldn't show this panel.")
    ).toBeVisible();
    const collections = await panel(/^Collections/);
    expect(await within(collections).findByText('2 documents')).toBeVisible();

    await user.click(within(fallback).getByRole('button', { name: 'Retry' }));
    expect(
      within(await panel('Panel')).getByText("Couldn't show this panel.")
    ).toBeVisible();

    broken = false;
    await user.click(
      within(await panel('Panel')).getByRole('button', { name: 'Retry' })
    );
    expect(
      within(await panel('Stats')).getByText('stats are back')
    ).toBeVisible();
    expect(home().queryByText("Couldn't show this panel.")).toBeNull();

    await user.click(
      within(collections).getByRole('button', { name: 'Posts' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
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
    expect(home().getByRole('heading', { name: 'Home' })).toBeVisible();
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
    expect(home().queryByText(/^Local files/)).toBeNull();
    expect(home().queryByRole('region', { name: 'Branch' })).toBeNull();
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

  it('shows the name and no count when a list fails, and still opens the collection', async () => {
    world.list = async (name) => {
      if (name === 'post') throw new Error('offline');
      return [];
    };
    const user = userEvent.setup();
    renderAdmin();
    const collections = await panel(/^Collections/);
    const [posts, pages] = within(collections).getAllByRole('listitem');
    expect(await within(pages).findByText('0 documents')).toBeVisible();
    await waitFor(() =>
      expect(posts.querySelector('[data-slot=skeleton]')).toBeNull()
    );
    expect(within(posts).queryByText(/documents?$/)).toBeNull();
    await user.click(within(posts).getByRole('button', { name: 'Posts' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
    );
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

  it('holds placeholder rows while the branch list is read', async () => {
    let release: (branches: BranchInfo[]) => void = () => {};
    world.listBranches = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    renderAdmin();
    const branch = await panel('Branch');
    const sheet = branch.querySelector('[data-slot=home-panel-sheet]');
    expect(sheet).toHaveAttribute('aria-busy', 'true');
    expect(within(branch).queryByText('main')).toBeNull();
    release(world.branches);
    expect(await within(branch).findByText('main')).toBeVisible();
    expect(sheet).not.toHaveAttribute('aria-busy');
  });

  it('says it could not load when the branch list fails, leaves the other panels alone, and Retry reads it again', async () => {
    consoleGuard.expect(/could not list branches/);
    let offline = true;
    let reads = 0;
    world.listBranches = async () => {
      reads += 1;
      if (offline) throw new Error('offline');
      return world.branches;
    };
    const user = userEvent.setup();
    renderAdmin();
    const branch = await panel('Branch');
    expect(
      await within(branch).findByText("Couldn't load this branch.")
    ).toBeVisible();
    expect(
      await within(await panel(/^Collections/)).findByText('2 documents')
    ).toBeVisible();

    await user.click(within(branch).getByRole('button', { name: 'Retry' }));
    expect(
      await within(branch).findByText("Couldn't load this branch.")
    ).toBeVisible();
    expect(reads).toBe(2);

    offline = false;
    await user.click(within(branch).getByRole('button', { name: 'Retry' }));
    expect(await within(branch).findByText('main')).toBeVisible();
    expect(within(branch).queryByText("Couldn't load this branch.")).toBeNull();
    await waitFor(() => expect(branch).toHaveFocus());
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
