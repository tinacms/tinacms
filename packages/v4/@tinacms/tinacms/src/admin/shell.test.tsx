import { ImageIcon } from 'lucide-react';
import { use, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { returnToTree } from '../test/collection-tree';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type {
  BranchInfo,
  BranchSlice,
  BranchSource,
} from '../core/branch/contract';
import { AuthError } from '../core/auth/contract';
import { BranchCreateError, currentBranchOf } from '../core/branch/contract';
import { ContentError, type DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import { TinaRuntimeContext } from '../editor/context';
import { draftKey } from '../form/drafts';
import { readAnyFormDirty, toFormId, useFormStore } from '../form/form-store';
import type { TinaDocument } from '../core/schema/types';
import { required } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import homePlugin from '../plugins/home/home.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { TinaAdmin } from './admin';
import { connectionOf } from '../test/connection';

type Mode = 'branches' | 'local' | 'none';

const BRANCHES: BranchInfo[] = [
  { name: 'main', protected: true },
  { name: 'feature/news' },
  { name: 'other' },
];

const DATA: Record<string, DocumentEntry[]> = {
  main: [{ path: 'content/posts/hello.mdx', document: { title: 'Hello' } }],
  'feature/news': [
    { path: 'content/posts/breaking.mdx', document: { title: 'Breaking' } },
    { path: 'content/posts/hello.mdx', document: { title: 'Hello' } },
  ],
  other: [{ path: 'content/posts/hello.mdx', document: { title: 'Hello' } }],
};

let mode: Mode;
let updates: { branch: string; path: string; value: TinaDocument }[];
let releaseUpdate: (() => void) | undefined;
let holdUpdates: boolean;
let searchEnabled: boolean;
let failGet: boolean;
let listError: boolean;
let listCalls: number;
let failAfterSave: boolean;
let holdAfterSave: Promise<void> | undefined;
let updateError: Error | undefined;
let listOmits: string | undefined;
let holdNextList: Promise<void> | undefined;
let heldDefault: Promise<void> | undefined;
let duplicateLabels: boolean;
let saveToNewBranch:
  | ReturnType<typeof vi.fn<NonNullable<BranchSlice['saveToNewBranch']>>>
  | undefined;
let created: Record<string, DocumentEntry[]>;
let switchCalls: string[];
let beforeSaveCalls: number;
let failBeforeSave: boolean;
let stampBeforeSave: boolean;
let dropAction: () => void;
let dropCreate: () => void;
let createDirect: (name: string, from: string) => void;
let pullRequestUrls: Record<string, string>;
let createBranch:
  | ((request: {
      name: string;
      from: string;
    }) => ReturnType<NonNullable<NonNullable<BranchSource>['create']>>)
  | undefined;

const contentPlugin = () =>
  definePlugin({
    name: 'test:content',
    provides: ['content'],
    client: async () => ({
      default: {
        slice: (_set, get) => {
          const branch = () => currentBranchOf(get()) ?? 'main';
          const entries = () => DATA[branch()] ?? created[branch()] ?? [];
          return {
            ...(mode === 'local' ? { local: true } : {}),
            ...(mode === 'branches'
              ? {
                  branches: {
                    list: async () => {
                      listCalls += 1;
                      const held = holdNextList;
                      holdNextList = undefined;
                      await held;
                      if (listError) throw new Error('offline');
                      return BRANCHES.filter(
                        (entry) => entry.name !== listOmits
                      ).map((entry) => ({
                        ...entry,
                        pullRequestUrl: pullRequestUrls[entry.name],
                      }));
                    },
                    ...(createBranch ? { create: createBranch } : {}),
                    defaultBranch: async () => {
                      await heldDefault;
                      return 'main';
                    },
                  },
                }
              : {}),
            list: async () =>
              connectionOf(entries().map(({ path }) => ({ path }))),
            get: async (_collection: string, path: string) => {
              if (failGet) throw new Error('disk unreadable');
              return entries().find((entry) => entry.path === path) ?? null;
            },
            update: async (
              _collection: string,
              path: string,
              value: TinaDocument
            ) => {
              if (updateError) throw updateError;
              if (holdUpdates) {
                await new Promise<void>((resolve) => {
                  releaseUpdate = resolve;
                });
              }
              updates.push({ branch: branch(), path, value });
              return { path, document: value };
            },
          };
        },
      },
    }),
  });

const searchPlugin = definePlugin({
  name: 'test:search',
  provides: ['search'],
  client: async () => ({
    default: {
      slice: () => ({
        search: async () => [
          {
            ref: { collection: 'post', path: 'content/posts/hello.mdx' },
            score: 1,
            snippet: '',
          },
        ],
      }),
    },
  }),
});

const auditPlugin = definePlugin({
  name: 'test:audit',
  provides: ['hooks'],
  hooks: ['audit'],
  client: async () => ({
    default: {
      hooks: {
        audit: () => ({
          beforeSave: (document: TinaDocument) => {
            beforeSaveCalls += 1;
            if (failBeforeSave) throw new Error('audit refused');
            return stampBeforeSave ? { ...document, audited: 'yes' } : document;
          },
          afterSave: async () => {
            await holdAfterSave;
            if (failAfterSave) throw new Error('audit endpoint down');
          },
        }),
      },
    },
  }),
});

const NotesScreen = () => <p>notes screen</p>;

// Puts the fake `saveToNewBranch` on the core branch slice, and records `switchTo`.
function BranchActionScreen() {
  const runtime = use(TinaRuntimeContext);
  useEffect(() => {
    if (!runtime) return;
    createDirect = (name, from) => {
      const create = runtime.store.getState().branch?.create;
      if (typeof create === 'function') create(name, from);
    };
    dropCreate = () =>
      runtime.store.setState((state) => ({
        branch: { ...state.branch, create: undefined },
      }));
    const action = saveToNewBranch;
    if (!action) return;
    dropAction = () =>
      runtime.store.setState((state) => ({
        branch: { ...state.branch, saveToNewBranch: undefined },
      }));
    runtime.store.setState((state) => {
      const original = state.branch?.switchTo;
      return {
        branch: {
          ...state.branch,
          saveToNewBranch: action,
          switchTo: (name: string | undefined) => {
            if (name) switchCalls.push(name);
            if (typeof original === 'function') original(name);
          },
        },
      };
    });
  }, [runtime]);
  return <p>branch action screen</p>;
}

const branchActionPlugin = definePlugin({
  name: 'test:branch-action',
  client: async () => ({
    default: {
      screens: [
        {
          name: 'branch-action',
          label: 'Branch action',
          component: BranchActionScreen,
        },
      ],
    },
  }),
});

const screenPlugin = definePlugin({
  name: 'test:notes',
  client: async () => ({
    default: {
      screens: [{ name: 'notes', label: 'Notes', component: NotesScreen }],
    },
  }),
});

const duplicateScreenPlugin = definePlugin({
  name: 'test:duplicates',
  client: async () => ({
    default: {
      screens: [{ name: 'prefs', label: 'Prefs', component: NotesScreen }],
      slots: {
        globalNav: ['Prefs', 'Prefs', 'Notes', 'Notes'].map((label) => ({
          label,
          icon: ImageIcon,
          target: { kind: 'screen' as const, screen: 'prefs' },
        })),
      },
    },
  }),
});

const renderAdmin = (projectName?: string) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin(),
          auditPlugin,
          screenPlugin,
          branchActionPlugin,
          ...(duplicateLabels ? [duplicateScreenPlugin] : []),
          ...(searchEnabled ? [searchPlugin] : []),
          stringFieldPlugin,
          coreValidatorsPlugin,
          homePlugin,
        ],
        ...(projectName ? { projectName } : {}),
        schema: {
          collections: [
            {
              name: 'post',
              label: 'Posts',
              path: 'content/posts',
              format: 'mdx',
              hooks: [{ name: 'audit' }],
              fields: [
                {
                  name: 'title',
                  label: 'Title',
                  type: 'string',
                  validators: [required()],
                },
              ],
            },
          ],
        },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

// The default `main` is protected. Saves that should write straight through run on this one.
const useUnprotectedBranch = () =>
  localStorage.setItem(
    'tina-store',
    JSON.stringify({
      state: { branch: { current: 'feature/news' } },
      version: 0,
    })
  );

const sidebarState = () =>
  document
    .querySelector('[data-slot=sidebar-wrapper] [data-slot=sidebar]')
    ?.getAttribute('data-state');

const toggles = () =>
  screen.queryAllByRole('button', { name: 'Toggle Sidebar' });

/** Stubs `matchMedia` so `(min-width: 768px)` is false: the phone tier. */
const phoneTier = () =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

const press = async (user: ReturnType<typeof userEvent.setup>, chord: string) =>
  user.keyboard(chord);

// happy-dom is 1024px wide, a tablet; the shell tests default to a desktop window.
const stubWidth = (width: number) =>
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width:\s*(\d+)px/.exec(query);
    return {
      matches: min ? width >= Number(min[1]) : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

beforeEach(() => {
  stubWidth(1440);
  mode = 'branches';
  updates = [];
  holdUpdates = false;
  releaseUpdate = undefined;
  searchEnabled = false;
  failGet = false;
  listError = false;
  listCalls = 0;
  failAfterSave = false;
  holdAfterSave = undefined;
  updateError = undefined;
  listOmits = undefined;
  holdNextList = undefined;
  heldDefault = undefined;
  duplicateLabels = false;
  saveToNewBranch = undefined;
  pullRequestUrls = {};
  createBranch = undefined;
  created = {};
  switchCalls = [];
  beforeSaveCalls = 0;
  failBeforeSave = false;
  stampBeforeSave = false;
  window.location.hash = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Branch list states', () => {
  it('says the list is loading while it is read', async () => {
    let release: () => void = () => {};
    heldDefault = new Promise<void>((resolve) => {
      release = resolve;
    });
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Branches' }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(within(dialog).getByText('Loading branches')).toBeVisible();
    release();
    expect(
      await within(dialog).findByRole('button', { name: /^main/ })
    ).toBeVisible();
  });

  it('shows a failed read in place, keeps the admin working and retries', async () => {
    listError = true;
    const user = userEvent.setup();
    renderAdmin();
    expect(
      await screen.findByRole('button', { name: 'Collections' })
    ).toBeEnabled();
    await user.click(await screen.findByRole('button', { name: 'Branches' }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(dialog).findByText(/Couldn't load branches/)
    ).toBeVisible();
    listError = false;
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
    expect(
      await within(dialog).findByRole('button', { name: /^main/ })
    ).toBeVisible();
    expect(listCalls).toBe(2);
    expect(within(dialog).queryByText(/Couldn't load branches/)).toBeNull();
  });

  it('checks a new branch name against the list', async () => {
    createBranch = async ({ name }) => ({ name });
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'feature/news'
    );
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'A branch called feature/news already exists. Pick another name.'
    );
  });
});

describe('Kept edits notice', () => {
  it('names the branch the edits are still unsaved on', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(await screen.findByText('Still unsaved on main.')).toBeVisible();
  });
});

describe('Top bar', () => {
  it('shows the one toggle, the logo, the project name and the branch', async () => {
    renderAdmin('Acme site');
    const bar = await screen.findByRole('banner', { name: 'Top bar' });
    expect(within(bar).getByRole('img', { name: 'TinaCMS' })).toBeVisible();
    expect(within(bar).getByText('Acme site')).toBeVisible();
    expect(
      await within(bar).findByRole('button', { name: /^Branch: main/ })
    ).toBeVisible();
    expect(
      within(screen.getByRole('navigation', { name: 'Content' })).queryByRole(
        'img',
        { name: 'TinaCMS' }
      )
    ).toBeNull();
  });

  it.each([
    ['content', ''],
    ['document', '#/collections/post/content%2Fposts%2Fhello.mdx'],
    ['missing document', '#/collections/post/content%2Fposts%2Fghost.mdx'],
    ['screen that does not exist', '#/screens/nope'],
  ])('draws exactly one toggle in the %s view', async (_name, hash) => {
    window.location.hash = hash;
    renderAdmin();
    await screen.findByRole('banner', { name: 'Top bar' });
    await waitFor(() => expect(toggles()).toHaveLength(1));
    await act(async () => {});
    expect(toggles()).toHaveLength(1);
  });

  it('shows the mark and Search as an icon on a phone, without the project name or the word logo', async () => {
    stubWidth(390);
    renderAdmin('Acme site');
    const bar = await screen.findByRole('banner', { name: 'Top bar' });
    expect(
      await within(bar).findByRole('button', { name: 'Open side nav' })
    ).toBeVisible();
    expect(within(bar).getAllByRole('img', { name: 'TinaCMS' })).toHaveLength(
      1
    );
    expect(
      within(bar).getByRole('img', { name: 'TinaCMS' }).getAttribute('src')
    ).toContain("width='184'");
    expect(within(bar).getByRole('button', { name: 'Search' })).toBeVisible();
  });

  it('holds only the short status words on a phone', async () => {
    stubWidth(390);
    mode = 'local';
    renderAdmin();
    const bar = await screen.findByRole('contentinfo', { name: 'Status bar' });
    expect(await within(bar).findByText('No saves yet')).toBeVisible();
    expect(within(bar).queryByText('No saves yet this session')).toBeNull();
  });

  it('announces only the short words from the live region on a phone, with no long copy in the page', async () => {
    stubWidth(390);
    mode = 'local';
    renderAdmin();
    const bar = await screen.findByRole('contentinfo', { name: 'Status bar' });
    await within(bar).findByText('No saves yet');
    const live = bar.querySelectorAll('[aria-live]');
    expect(live).toHaveLength(1);
    expect(live[0]).toHaveTextContent(/^No saves yet$/);
    expect(document.body.textContent).not.toContain(
      'No saves yet this session'
    );
  });

  it('announces the long words from the live region at desktop', async () => {
    mode = 'local';
    renderAdmin();
    const bar = await screen.findByRole('contentinfo', { name: 'Status bar' });
    const live = bar.querySelector('[aria-live]');
    await waitFor(() =>
      expect(live).toHaveTextContent('No saves yet this session')
    );
  });

  it('omits the project name when none is configured', async () => {
    renderAdmin();
    await screen.findByRole('banner', { name: 'Top bar' });
    expect(document.querySelector('[data-slot=top-bar-project]')).toBeNull();
  });

  it('toggles the side nav with the button and with ⌘B once per press', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByRole('banner', { name: 'Top bar' });
    expect(sidebarState()).toBe('expanded');

    await user.click(toggles()[0]);
    expect(sidebarState()).toBe('collapsed');

    await press(user, '{Meta>}b{/Meta}');
    expect(sidebarState()).toBe('expanded');
    await press(user, '{Meta>}b{/Meta}');
    expect(sidebarState()).toBe('collapsed');
  });

  it('ignores ⌘B below desktop', async () => {
    stubWidth(600);
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByRole('banner', { name: 'Top bar' });
    await press(user, '{Meta>}b{/Meta}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows Search without a provider and says full-text search needs one', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Search' });
    expect(
      within(dialog).getByText('Full-text search needs a search provider.')
    ).toBeVisible();
    expect(within(dialog).queryByText('Content search')).toBeNull();
  });

  it('narrows the Navigation results by the query and opens the one picked', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Search' });
    await user.type(within(dialog).getByRole('searchbox'), 'coll');
    const list = within(dialog).getByRole('list', {
      name: 'Navigation results',
    });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await user.click(within(list).getByRole('button', { name: 'Collections' }));
    await waitFor(() => expect(window.location.hash).toBe('#/collections'));
  });

  it('shows no Navigation heading when no entry matches the query', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Search' });
    await user.type(within(dialog).getByRole('searchbox'), 'zzz');
    expect(within(dialog).queryByText('Navigation')).toBeNull();
    expect(
      within(dialog).queryByRole('list', { name: 'Navigation results' })
    ).toBeNull();
  });

  it('keeps every Search row when two entries share a label', async () => {
    duplicateLabels = true;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Search' });
    const list = within(dialog).getByRole('list', {
      name: 'Navigation results',
    });
    const all = within(list).getAllByRole('listitem').length;
    const box = within(dialog).getByRole('searchbox');
    await user.type(box, 'Pre');
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((row) => row.textContent)
    ).toEqual(['Prefs', 'Prefs']);
    await user.clear(box);
    await user.type(box, 'Not');
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((row) => row.textContent)
    ).toEqual(['Notes', 'Notes']);
    await user.clear(box);
    expect(within(list).getAllByRole('listitem')).toHaveLength(all);
    expect(
      error.mock.calls.some(([message]) => String(message).includes('same key'))
    ).toBe(false);
    error.mockRestore();
  });

  it('opens Search with ⌘K, even from a focused field, when a search provider exists', async () => {
    searchEnabled = true;
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    const input = await screen.findByLabelText(/^Title\b/);
    await user.click(input);
    await press(user, '{Meta>}k{/Meta}');
    expect(await screen.findByRole('dialog', { name: 'Search' })).toBeVisible();
  });

  it('leaves ⌘K to the rich-text editor', async () => {
    searchEnabled = true;
    renderAdmin();
    await screen.findByRole('button', { name: /Search/ });
    const editor = document.createElement('div');
    editor.setAttribute('data-slate-editor', 'true');
    document.body.append(editor);
    act(() => {
      editor.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
      );
    });
    expect(screen.queryByRole('dialog', { name: 'Search' })).toBeNull();
    editor.remove();
  });
});

describe('side nav entries', () => {
  it('tags only an unsaved document row', async () => {
    window.location.hash = '#/collections/post';
    const user = userEvent.setup();
    renderAdmin();
    const row = await screen.findByRole('button', { name: /hello\.mdx/ });
    expect(row).not.toHaveTextContent(/No changes|Saved|Unsaved/);

    await user.click(row);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await returnToTree(user);
    const back = await screen.findByRole('button', { name: /hello\.mdx/ });
    expect(back).toHaveTextContent('Unsaved');
    expect(
      within(screen.getByRole('navigation', { name: 'Content' })).queryByText(
        'Unsaved'
      )
    ).toBeNull();
  });

  it('puts Help and docs at the foot and opens it in a new tab', async () => {
    renderAdmin();
    const help = await screen.findByRole('link', { name: /Help and docs/ });
    expect(help).toHaveAttribute('target', '_blank');
    expect(help).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('branches', () => {
  it('shows the lock and "protected" on a protected branch', async () => {
    renderAdmin();
    const button = await screen.findByRole('button', {
      name: 'Branch: main, protected',
    });
    expect(button).toHaveTextContent('protected');
    expect(
      within(screen.getByRole('contentinfo', { name: 'Status bar' })).getByText(
        'main (protected)'
      )
    ).toBeVisible();
  });

  it('titles the pop-up Branches, lists the current branch first and searches by name', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    const lines = within(dialog).getAllByRole('listitem');
    expect(lines.map((line) => line.textContent)).toEqual([
      'main',
      'feature/news',
      'other',
    ]);
    expect(within(lines[0]).getByRole('button')).toHaveAttribute(
      'aria-current',
      'true'
    );

    await user.type(
      within(dialog).getByRole('searchbox', { name: 'Search branches' }),
      'news'
    );
    expect(
      within(dialog)
        .getAllByRole('listitem')
        .map((line) => line.textContent)
    ).toEqual(['feature/news']);
    await user.click(within(dialog).getByRole('button', { name: 'Maximise' }));
    expect(screen.queryByRole('dialog', { name: 'Branches' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Restore' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('searchbox', { name: 'Search branches' })
    ).toHaveValue('news');
  });

  it('shows "Local files" and no branch button in local mode', async () => {
    mode = 'local';
    renderAdmin();
    const bar = await screen.findByRole('contentinfo', { name: 'Status bar' });
    await within(bar).findByText('Local files');
    expect(screen.queryByRole('button', { name: /^Branch:/ })).toBeNull();
    const top = screen.getByRole('banner');
    expect(within(top).getByText('Local files')).toBeVisible();
    expect(
      within(top).queryByRole('button', { name: /Local files/ })
    ).toBeNull();
  });

  it('shows no branch spot when the provider offers none', async () => {
    mode = 'none';
    renderAdmin();
    const bar = await screen.findByRole('contentinfo', { name: 'Status bar' });
    expect(within(bar).queryByText('Local files')).toBeNull();
    expect(screen.queryByRole('button', { name: /^Branch:/ })).toBeNull();
  });

  it("shows the other branch's documents after a switch, not cached ones", async () => {
    window.location.hash = '#/collections/post';
    const user = userEvent.setup();
    renderAdmin();
    expect(
      await screen.findByRole('button', { name: /hello\.mdx/ })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /breaking\.mdx/ })).toBeNull();

    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('feature/news'));

    expect(
      await screen.findByRole('button', { name: /breaking\.mdx/ })
    ).toBeVisible();
    expect(
      await screen.findByRole('button', { name: /^Branch: feature\/news/ })
    ).toBeVisible();
  });

  it('blocks a switch while any form has unsaved edits', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');

    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Save or discard your changes first'
    );
    await user.click(within(dialog).getByText('feature/news'));
    expect(
      screen.getByRole('button', { name: /^Branch: main/, hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^Title\b/, { selector: 'input' })
    ).toHaveValue('Hello!');
  });

  it('waits for a running save before falling back from a gone branch', async () => {
    localStorage.setItem(
      'tina-store',
      JSON.stringify({ state: { branch: { current: 'deleted' } }, version: 0 })
    );
    useFormStore.getState().beginSave();
    renderAdmin();
    await waitFor(() => expect(listCalls).toBe(1));
    await act(async () => {});
    expect(screen.queryByText('Branch "deleted" no longer exists')).toBeNull();
    expect(
      screen.getByRole('button', { name: /^Branch: deleted/ })
    ).toBeVisible();

    act(() => useFormStore.getState().endSave());
    expect(
      await screen.findByText('Branch "deleted" no longer exists')
    ).toBeVisible();
    expect(
      await screen.findByRole('button', { name: /^Branch: main/ })
    ).toBeVisible();
  });

  it('falls back to the default branch with a toast when the saved branch is gone', async () => {
    localStorage.setItem(
      'tina-store',
      JSON.stringify({ state: { branch: { current: 'deleted' } }, version: 0 })
    );
    renderAdmin();
    expect(
      await screen.findByText('Branch "deleted" no longer exists')
    ).toBeVisible();
    expect(
      await screen.findByRole('button', { name: /^Branch: main/ })
    ).toBeVisible();
  });

  it('stores no branch when the default is picked by name, so its drafts use the default key', async () => {
    localStorage.setItem(
      'tina-store',
      JSON.stringify({
        state: { branch: { current: 'feature/news' } },
        version: 0,
      })
    );
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('main', { selector: 'span' }));
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem('tina-store') ?? '{}').state.branch
      ).not.toHaveProperty('current')
    );
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await waitFor(() =>
      expect(
        Object.keys(localStorage).filter((key) => key.startsWith('tina-drafts'))
      ).toEqual(['tina-drafts:content/posts/hello.mdx'])
    );
  });

  it('keeps text typed before the default branch is known, and its draft', async () => {
    let release: () => void = () => {};
    heldDefault = new Promise<void>((resolve) => {
      release = resolve;
    });
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    const input = await screen.findByLabelText(/^Title\b/);
    await user.type(input, '!');
    act(() => release());
    await screen.findByRole('button', { name: /^Branch: main/ });
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello!');
    expect(
      Object.keys(localStorage).filter((key) => key.startsWith('tina-drafts'))
    ).toEqual(['tina-drafts:content/posts/hello.mdx']);
  });

  it('keeps a draft typed on one branch off another branch', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    const first = renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await waitFor(() =>
      expect(
        Object.keys(localStorage).filter((key) => key.startsWith('tina-drafts'))
      ).toHaveLength(1)
    );
    first.unmount();

    localStorage.setItem(
      'tina-store',
      JSON.stringify({
        state: { branch: { current: 'feature/news' } },
        version: 0,
      })
    );
    renderAdmin();
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Hello');
  });
});

describe('save state', () => {
  const openHello = async () => {
    useUnprotectedBranch();
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    const input = await screen.findByLabelText(/^Title\b/);
    return { user, input };
  };

  const statusBar = () =>
    screen.getByRole('contentinfo', { name: 'Status bar' });

  it('says saving in words, disables the branch button, then says saved', async () => {
    const { user, input } = await openHello();
    holdUpdates = true;
    await user.type(input, '!');
    await waitFor(() =>
      expect(within(statusBar()).getByText('Unsaved changes')).toBeVisible()
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(within(statusBar()).getByText('Saving…')).toBeVisible()
    );
    const branch = await screen.findByRole('button', { name: /^Branch:/ });
    expect(branch).toBeDisabled();
    expect(branch).not.toHaveAttribute('title');

    act(() => releaseUpdate?.());
    await waitFor(() =>
      expect(within(statusBar()).getByText(/^Saved/)).toBeVisible()
    );
    expect(updates).toHaveLength(1);
    expect(screen.getByRole('button', { name: /^Branch:/ })).toBeEnabled();
  });

  it('shows the Save progress card once a save runs long, clear of the Status bar', async () => {
    const { user, input } = await openHello();
    holdUpdates = true;
    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const card = await screen
      .findByText('Saving…', {}, { timeout: 3000 })
      .then(() => document.querySelector('[data-slot=save-progress]'));
    await waitFor(
      () =>
        expect(
          document.querySelector('[data-slot=save-progress]')
        ).not.toBeNull(),
      { timeout: 3000 }
    );
    expect(
      card ?? document.querySelector('[data-slot=save-progress]')
    ).toHaveAttribute('data-placement', 'corner');
    act(() => releaseUpdate?.());
    await waitFor(() =>
      expect(document.querySelector('[data-slot=save-progress]')).toBeNull()
    );
  });

  it('says the save failed when an afterSave hook fails, after the document is saved', async () => {
    failAfterSave = true;
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Save failed')).toBeVisible()
    );
    expect(updates).toHaveLength(1);
  });

  it('says the branch no longer exists, keeps the edits and offers a new branch instead of Retry', async () => {
    updateError = new ContentError('branch-not-found');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: branch no longer exists')
      ).toBeVisible()
    );
    expect(input).toHaveValue('Hello!');
    const dialog = await screen.findByRole('dialog', {
      name: 'feature/news was deleted',
    });
    expect(
      within(dialog).getByRole('textbox', { name: /New branch name/ })
    ).toHaveValue('feature/news-2');
    const toast = document.querySelector('[data-slot=toast]') as HTMLElement;
    expect(toast).toHaveTextContent(
      "Couldn't save. This branch no longer exists."
    );
    expect(toast).toHaveTextContent(
      'Your edits are kept. Save them to a new branch made from main.'
    );
    expect(
      within(toast).getByRole('button', { name: 'Save to new branch' })
    ).toBeVisible();
    expect(within(toast).queryByRole('button', { name: 'Retry' })).toBeNull();
    errors.mockRestore();
  });

  it('names the document the last save wrote', async () => {
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved: “hello.mdx”')).toBeVisible()
    );
  });

  it('logs no "Save failed" line for a blocked save', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    expect(
      log.mock.calls.some(([first]) => String(first).includes('Save failed'))
    ).toBe(false);
    log.mockRestore();
  });

  it('reads Save failed after a later network failure, once the blocked save is fixed', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    await user.type(input, 'Hello!');
    updateError = new ContentError('network');
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Save failed')).toBeVisible()
    );
  });

  it('keeps the earlier save entry of the document when its save blocks, so a newer save of another document stays the newest', async () => {
    const { user, input } = await openHello();
    useFormStore.getState().setSavePhase(toFormId('content/posts/hello.mdx'), {
      phase: 'failed',
      message: 'earlier failure',
    });
    useFormStore
      .getState()
      .setSavePhase(toFormId('content/posts/other.mdx'), { phase: 'saved' });
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    expect(within(statusBar()).queryByText('Save failed')).toBeNull();
    expect(within(statusBar()).getByText('Unsaved changes')).toBeVisible();
    expect(
      useFormStore.getState().saves[toFormId('content/posts/hello.mdx')]
    ).toMatchObject({ phase: 'failed', message: 'earlier failure' });
  });

  it('does not call a blocked save a failed save in the Status bar', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    expect(within(statusBar()).queryByText('Save failed')).toBeNull();
    expect(updates).toHaveLength(0);
    const form = screen.getByRole('complementary', { name: 'Document form' });
    expect(form.querySelector('[data-slot=form-bar] [role=alert]')).toBeNull();
  });
});

describe('toasts', () => {
  it('shows a failed save at bottom right with fixed words and Retry, and nothing in the form bar', async () => {
    useUnprotectedBranch();
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    updateError = new ContentError('forbidden');
    const user = userEvent.setup();
    renderAdmin();
    const input = await screen.findByLabelText(/^Title\b/);
    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));

    const toast = await waitFor(() => {
      const found = document.querySelector('[data-slot=toast]');
      expect(found).not.toBeNull();
      return found;
    });
    expect(toast).toHaveTextContent(
      "Couldn't save. You don't have permission to save."
    );
    expect(
      within(toast as HTMLElement).getByRole('button', { name: 'Retry' })
    ).toBeVisible();
    expect(screen.queryByRole('complementary', { name: 'Errors' })).toBeNull();
    const toaster = toast?.closest('[data-sonner-toaster]');
    expect(toaster).toHaveAttribute('data-x-position', 'right');
    expect(toaster).toHaveAttribute('data-y-position', 'bottom');
    const form = screen.getByRole('complementary', { name: 'Document form' });
    expect(form.querySelector('[data-slot=form-bar] [role=alert]')).toBeNull();
  });
});

describe('read-error and screen views', () => {
  it('draws one toggle and a Close in the read-error view', async () => {
    failGet = true;
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    expect(
      await screen.findByRole('heading', { name: 'Cannot open document' })
    ).toBeVisible();
    expect(
      screen
        .getAllByRole('alert')
        .some((alert) => /disk unreadable/.test(alert.textContent ?? ''))
    ).toBe(true);
    expect(toggles()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });

  it('titles a screen with its label and closes it to the collections route', async () => {
    window.location.hash = '#/screens/notes';
    const user = userEvent.setup();
    renderAdmin();
    expect(await screen.findByRole('heading', { name: 'Notes' })).toBeVisible();
    expect(screen.getByText('notes screen')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(screen.queryByText('notes screen')).toBeNull();
  });
});

describe('document form panel', () => {
  it('has a title-led head with a Location trail and a Form actions menu, no tabs, then a form bar', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    const panel = screen.getByRole('complementary', { name: 'Document form' });
    const trail = within(panel).getByRole('navigation', { name: 'Location' });
    expect(
      within(trail)
        .getAllByRole('button')
        .map((step) => step.textContent)
    ).toEqual(['Collections', 'Posts']);
    expect(
      within(panel).getByRole('heading', { level: 2, name: 'Hello' })
    ).toBeVisible();
    expect(
      within(panel).getByRole('button', { name: 'Form actions' })
    ).toBeVisible();
    expect(within(panel).queryByRole('button', { name: 'Close' })).toBeNull();
    expect(
      within(panel).queryByRole('button', { name: 'Return to navigator' })
    ).toBeNull();
    expect(within(panel).queryByRole('tab')).toBeNull();
    expect(
      within(panel).getByRole('button', { name: 'Document actions' })
    ).toBeVisible();
    expect(within(panel).getByRole('button', { name: /^Save/ })).toBeDisabled();
  });

  it('opens the Document actions above the bar, with a note that more come later', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    const menu = await screen.findByRole('menu', { name: 'Document actions' });
    expect(
      within(menu).getByText('More document actions come later.')
    ).toBeVisible();
    expect(menu.closest('[data-side]')).toHaveAttribute('data-side', 'top');
  });
});

describe('panel headers', () => {
  it('gives the form column a Location step back to its collection, and the missing views a title and Close', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    const view = renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(
      within(
        within(
          screen.getByRole('complementary', { name: 'Document form' })
        ).getByRole('navigation', { name: 'Location' })
      ).getByRole('button', { name: 'Posts' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post?max')
    );
    view.unmount();

    window.location.hash = '#/collections/post/content%2Fposts%2Fghost.mdx';
    renderAdmin();
    expect(
      await screen.findByRole('heading', { name: 'Document not found' })
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });
});

describe('Save to new branch', () => {
  const helloHash = '#/collections/post/content%2Fposts%2Fhello.mdx';
  const openHello = async () => {
    const user = userEvent.setup();
    if (saveToNewBranch) {
      window.location.hash = '#/screens/branch-action';
      renderAdmin();
      await screen.findByText('branch action screen');
      act(() => {
        window.location.hash = helloHash;
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    } else {
      window.location.hash = helloHash;
      renderAdmin();
    }
    const input = await screen.findByLabelText(/^Title\b/);
    return { user, input };
  };
  // Resolves like a provider that makes the branch and writes the document in one request.
  const withAction = () => {
    saveToNewBranch = vi.fn(async ({ name, path, value }) => {
      created[name] = [{ path, document: value }];
      return { path, document: value };
    });
    return saveToNewBranch;
  };
  const statusBar = () =>
    screen.getByRole('contentinfo', { name: 'Status bar' });
  const toastShown = () => document.querySelector('[data-slot=toast]');
  const openProtectedDialog = async () => {
    const { user, input } = await openHello();
    await user.type(input, '!');
    await pressSave(user);
    const dialog = await screen.findByRole('dialog', {
      name: 'Save to a new branch',
    });
    return { user, input, dialog };
  };
  const discardEdits = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    );
    await user.click(await screen.findByRole('button', { name: 'Discard' }));
  };
  const pressSave = (user: ReturnType<typeof userEvent.setup>) =>
    user.click(
      within(
        document.querySelector('[data-slot=form-bar]') as HTMLElement
      ).getByRole('button', { name: /^Save/ })
    );
  const nameField = (dialog: HTMLElement) =>
    within(dialog).getByRole('textbox', { name: /New branch name/ });

  it('reads Save to new branch on a protected branch, even when clean, and Save elsewhere', async () => {
    await openHello();
    expect(
      await screen.findByRole('button', { name: 'Save to new branch' })
    ).toBeDisabled();
  });

  it('reads Save in Local files', async () => {
    mode = 'local';
    await openHello();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('opens the dialog with a name from the document and writes nothing', async () => {
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Save to a new branch',
    });
    expect(nameField(dialog)).toHaveValue('docs/hello-edits');
    await waitFor(() => expect(nameField(dialog)).toHaveFocus());
    expect(dialog).toHaveTextContent('main is protected');
    expect(dialog).toHaveTextContent('“Hello!”');
    expect(updates).toHaveLength(0);
  });

  it('turns an invalid Save to new branch into Resolve, with no toast or dialog, then opens the dialog once fixed', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(
      await screen.findByRole('button', { name: /^Save to new branch/ })
    );
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    expect(document.querySelector('[data-slot=toast]')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    const status = screen.getByRole('contentinfo', { name: 'Status bar' });
    expect(within(status).queryByText('Save failed')).toBeNull();
    expect(within(status).getByText('Unsaved changes')).toBeVisible();
    await user.type(input, 'Fixed');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Save to a new branch' })
    ).toBeVisible();
    expect(updates).toHaveLength(0);
  });

  it('flags a taken name at the field and, with no action, keeps the main action off; Cancel changes nothing', async () => {
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Save to a new branch',
    });
    await user.clear(nameField(dialog));
    await user.type(nameField(dialog), 'feature/news');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'A branch called feature/news already exists. Pick another name.'
    );
    expect(nameField(dialog)).toHaveAttribute('aria-invalid', 'true');
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.clear(nameField(dialog));
    await user.type(nameField(dialog), 'docs/free{Enter}');
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(input).toHaveValue('Hello!');
    expect(beforeSaveCalls).toBe(0);
    expect(updates).toHaveLength(0);
    expect(switchCalls).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: 'Save to new branch' })
    ).toHaveFocus();
  });

  it('keeps the branch button off on the new branch until its afterSave ends', async () => {
    withAction();
    let endAfterSave: () => void = () => {};
    holdAfterSave = new Promise<void>((resolve) => {
      endAfterSave = resolve;
    });
    const { user, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(switchCalls).toEqual(['docs/hello-edits']));
    const branch = await screen.findByRole('button', {
      name: /^Branch: docs\/hello-edits/,
    });
    expect(branch).toBeDisabled();

    await act(async () => endAfterSave());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /^Branch: docs\/hello-edits/ })
      ).toBeEnabled()
    );
  });

  it('keeps the branch button off while a second save on the new branch outlives the first', async () => {
    withAction();
    let endFirst: () => void = () => {};
    holdAfterSave = new Promise<void>((resolve) => {
      endFirst = resolve;
    });
    const { user, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(switchCalls).toEqual(['docs/hello-edits']));
    let endSecond: () => void = () => {};
    holdAfterSave = new Promise<void>((resolve) => {
      endSecond = resolve;
    });
    await user.type(await screen.findByLabelText(/^Title\b/), '?');
    await pressSave(user);
    const branch = () =>
      screen.getByRole('button', { name: /^Branch: docs\/hello-edits/ });

    await act(async () => endFirst());
    expect(branch()).toBeDisabled();
    await act(async () => endSecond());
    await waitFor(() => expect(branch()).toBeEnabled());
  });

  it('frees the branch button when a save on the new branch is refused as invalid during the first afterSave', async () => {
    withAction();
    let endFirst: () => void = () => {};
    holdAfterSave = new Promise<void>((resolve) => {
      endFirst = resolve;
    });
    const { user, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(switchCalls).toEqual(['docs/hello-edits']));
    await user.clear(await screen.findByLabelText(/^Title\b/));
    await act(async () => {
      fireEvent.click(
        within(
          document.querySelector('[data-slot=form-bar]') as HTMLElement
        ).getByRole('button', { name: /^Save/ })
      );
      endFirst();
    });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /^Branch: docs\/hello-edits/ })
      ).toBeEnabled()
    );
    expect(within(statusBar()).queryByText('Saving…')).toBeNull();
  });

  it('saves to the new branch in one call with the beforeSave change, then switches to it', async () => {
    stampBeforeSave = true;
    let finish: () => void = () => {};
    const action = withAction();
    const resolved = action.getMockImplementation();
    action.mockImplementationOnce(async (request) => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return (
        resolved?.(request) ?? { path: request.path, document: request.value }
      );
    });
    const { user, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Save to new branch' })
      ).toHaveFocus()
    );
    expect(action).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith({
      name: 'docs/hello-edits',
      from: 'main',
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: expect.objectContaining({ title: 'Hello!', audited: 'yes' }),
    });
    await act(async () => finish());
    await waitFor(() => expect(switchCalls).toEqual(['docs/hello-edits']));
    expect(
      await screen.findByRole('button', { name: /^Branch: docs\/hello-edits/ })
    ).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
    expect(updates).toHaveLength(0);
  });

  it('keeps the editor on the protected branch with the edits when the action rejects, and Retry sends the same call', async () => {
    const action = withAction();
    action.mockRejectedValueOnce(new Error('pr failed'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, input, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(toastShown()).not.toBeNull());
    const toast = toastShown() as HTMLElement;
    expect(toast).toHaveTextContent("Couldn't save. Something went wrong.");
    expect(errors).toHaveBeenCalled();
    expect(switchCalls).toHaveLength(0);
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
    expect(input).toHaveValue('Hello!');
    expect(within(statusBar()).getByText('Save failed')).toBeVisible();
    await user.click(within(toast).getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(action.mock.calls[1]?.[0]).toMatchObject({
      name: 'docs/hello-edits',
      from: 'main',
    });
    await waitFor(() => expect(switchCalls).toEqual(['docs/hello-edits']));
    await waitFor(() => expect(toastShown()).toBeNull());
    expect(updates).toHaveLength(0);
    errors.mockRestore();
  });

  it.each([
    ['docs/hello-edits', 'A branch called docs/hello-edits already exists.'],
    [
      'docs',
      'A branch called docs already exists, so docs/hello-edits can’t be used.',
    ],
  ])(
    'reopens the dialog from Retry when %s was made since, instead of resending the name',
    async (made, reason) => {
      const action = withAction();
      action.mockRejectedValueOnce(new Error('name taken'));
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { user, input, dialog } = await openProtectedDialog();
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(toastShown()).not.toBeNull());
      BRANCHES.push({ name: made });
      try {
        await user.click(
          within(toastShown() as HTMLElement).getByRole('button', {
            name: 'Retry',
          })
        );
        const reopened = await screen.findByRole('dialog', {
          name: 'Save to a new branch',
        });
        expect(nameField(reopened)).toHaveValue('docs/hello-edits');
        expect(within(reopened).getByRole('alert')).toHaveTextContent(reason);
        expect(action).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(toastShown()).toBeNull());
        await user.clear(nameField(reopened));
        await user.type(nameField(reopened), 'hello-fix');
        await user.click(
          within(reopened).getByRole('button', { name: 'Save' })
        );
        await waitFor(() => expect(switchCalls).toEqual(['hello-fix']));
        expect(action.mock.calls[1]?.[0]).toMatchObject({
          name: 'hello-fix',
          from: 'main',
        });
        expect(input).toHaveValue('Hello!');
      } finally {
        BRANCHES.pop();
        errors.mockRestore();
      }
    }
  );

  it('opens the dialog from Retry once the action is gone, instead of a silent success', async () => {
    const action = withAction();
    action.mockRejectedValueOnce(new Error('pr failed'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(toastShown()).not.toBeNull());
    act(() => dropAction());
    await user.click(
      within(toastShown() as HTMLElement).getByRole('button', { name: 'Retry' })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Save to a new branch' })
    ).toBeVisible();
    expect(action).toHaveBeenCalledOnce();
    expect(updates).toHaveLength(0);
    errors.mockRestore();
  });

  it('never calls the action when a beforeSave hook rejects, and keeps the form dirty', async () => {
    const action = withAction();
    failBeforeSave = true;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, input, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(toastShown()).not.toBeNull());
    expect(action).not.toHaveBeenCalled();
    expect(switchCalls).toHaveLength(0);
    expect(input).toHaveValue('Hello!');
    expect(
      screen.getByRole('button', { name: 'Save to new branch' })
    ).toBeEnabled();
    errors.mockRestore();
  });

  it('opens the dialog again after Discard, instead of resending a failed call', async () => {
    const action = withAction();
    action.mockRejectedValueOnce(new Error('pr failed'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, input, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(toastShown()).not.toBeNull());
    await discardEdits(user);
    await user.type(input, '?');
    await pressSave(user);
    expect(
      await screen.findByRole('dialog', { name: 'Save to a new branch' })
    ).toBeVisible();
    expect(action).toHaveBeenCalledOnce();
    errors.mockRestore();
  });

  it('shows the after-save failure on the new branch, and its Retry saves there without the action', async () => {
    const action = withAction();
    failAfterSave = true;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, dialog } = await openProtectedDialog();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(switchCalls).toEqual(['docs/hello-edits']));
    await waitFor(() =>
      expect(toastShown()).toHaveTextContent(
        'The document was saved. An afterSave hook failed.'
      )
    );
    failAfterSave = false;
    await user.type(await screen.findByLabelText(/^Title\b/), '?');
    await user.click(
      within(toastShown() as HTMLElement).getByRole('button', { name: 'Retry' })
    );
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]?.branch).toBe('docs/hello-edits');
    expect(action).toHaveBeenCalledOnce();
    errors.mockRestore();
  });

  it('names the empty-name reason on Enter and on the main action, with an action', async () => {
    const action = withAction();
    const { user, dialog } = await openProtectedDialog();
    await user.clear(nameField(dialog));
    await user.keyboard('{Enter}');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Enter a branch name.'
    );
    expect(nameField(dialog)).toHaveAttribute('aria-invalid', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Enter a branch name.'
    );
    expect(action).not.toHaveBeenCalled();
  });

  it('names the empty-name reason with no action, where the main action is off', async () => {
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Save to a new branch',
    });
    await user.clear(nameField(dialog));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Enter a branch name.'
    );
    expect(nameField(dialog)).toHaveAttribute('aria-invalid', 'true');
  });

  it('leaves no Save failed once the fields are fixed and the dialog opens', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(
      await screen.findByRole('button', { name: /^Save to new branch/ })
    );
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    await user.type(input, 'Fixed');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    await screen.findByRole('dialog', { name: 'Save to a new branch' });
    expect(document.querySelector('[data-slot=toast]')).toBeNull();
    const bar = document.querySelector('[data-slot=form-bar]') as HTMLElement;
    expect(bar).not.toHaveTextContent('Save failed');
  });

  it('holds Save while the action runs, so it runs once', async () => {
    let finish: () => void = () => {};
    const action = withAction();
    action.mockImplementationOnce(async ({ path, value }) => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return { path, document: value };
    });
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Save to a new branch',
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await pressSave(user);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(action).toHaveBeenCalledOnce();
    await act(async () => finish());
  });

  describe('when the branch was deleted', () => {
    const failOnce = async () => {
      useUnprotectedBranch();
      updateError = new ContentError('branch-not-found');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const { user, input } = await openHello();
      await user.type(input, '!');
      await pressSave(user);
      const dialog = await screen.findByRole('dialog', {
        name: 'feature/news was deleted',
      });
      listOmits = 'feature/news';
      return { user, dialog };
    };

    afterEach(() => vi.restoreAllMocks());

    it('removes the branch-gone toast after Discard, and its action never writes', async () => {
      const { user, dialog } = await failOnce();
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await discardEdits(user);
      await waitFor(() => expect(toastShown()).toBeNull());
      expect(updates).toHaveLength(0);
    });

    it.each(['other', 'main'])(
      'removes the branch-gone toast after switching to %s',
      async (target) => {
        const { user, dialog } = await failOnce();
        await user.click(
          within(dialog).getByRole('button', { name: 'Cancel' })
        );
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        await discardEdits(user);
        await user.click(
          await screen.findByRole('button', { name: /^Branch:/ })
        );
        const branches = await screen.findByRole('dialog', {
          name: 'Branches',
        });
        await user.click(within(branches).getByText(target));
        await waitFor(() => expect(toastShown()).toBeNull());
        expect(updates).toHaveLength(0);
      }
    );

    it('reopens the dialog from Save without writing again', async () => {
      const { user, dialog } = await failOnce();
      updateError = undefined;
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await pressSave(user);
      expect(
        await screen.findByRole('dialog', { name: 'feature/news was deleted' })
      ).toBeVisible();
      expect(updates).toHaveLength(0);
    });

    it('saves on the current branch with no dialog once the branch is back', async () => {
      const { user, dialog } = await failOnce();
      listOmits = undefined;
      updateError = undefined;
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await pressSave(user);
      await waitFor(() => expect(updates).toHaveLength(1));
      expect(updates[0]?.branch).toBe('feature/news');
      expect(screen.queryByRole('dialog')).toBeNull();
      await waitFor(() => expect(toastShown()).toBeNull());
    });

    it('saves on the current branch from the toast action once the branch is back', async () => {
      const { user, dialog } = await failOnce();
      listOmits = undefined;
      updateError = undefined;
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await user.click(
        within(toastShown() as HTMLElement).getByRole('button', {
          name: 'Save to new branch',
        })
      );
      await waitFor(() => expect(updates).toHaveLength(1));
      expect(updates[0]?.branch).toBe('feature/news');
      expect(screen.queryByRole('dialog')).toBeNull();
      await waitFor(() => expect(toastShown()).toBeNull());
    });

    it('does not resume a held restore check after Discard and a switch to a protected branch', async () => {
      const { user, dialog } = await failOnce();
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      listOmits = undefined;
      updateError = undefined;
      let release: () => void = () => {};
      holdNextList = new Promise<void>((resolve) => {
        release = resolve;
      });
      await pressSave(user);
      await discardEdits(user);
      await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
      const branches = await screen.findByRole('dialog', { name: 'Branches' });
      await user.click(within(branches).getByText('main'));
      await waitFor(() => expect(toastShown()).toBeNull());
      await act(async () => release());
      expect(updates).toHaveLength(0);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('forgets the failure after a switch: Save takes its normal route on the new branch', async () => {
      const { user, dialog } = await failOnce();
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await user.click(
        screen.getByRole('button', { name: 'Document actions' })
      );
      await user.click(
        await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
      );
      await user.click(await screen.findByRole('button', { name: 'Discard' }));
      await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
      const branches = await screen.findByRole('dialog', { name: 'Branches' });
      await user.click(within(branches).getByText('main'));
      await user.type(await screen.findByLabelText(/^Title\b/), '!');
      const bar = document.querySelector('[data-slot=form-bar]') as HTMLElement;
      await user.click(
        await within(bar).findByRole('button', { name: 'Save to new branch' })
      );
      expect(
        await screen.findByRole('dialog', { name: 'Save to a new branch' })
      ).toBeVisible();
      expect(screen.queryByRole('dialog', { name: /was deleted/ })).toBeNull();
      expect(updates).toHaveLength(0);
    });

    it('shows Saving and ignores Cancel while the action runs, then closes the dialog and the toast on the new branch', async () => {
      let finish: () => void = () => {};
      const action = withAction();
      action.mockImplementationOnce(async ({ name, path, value }) => {
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
        created[name] = [{ path, document: value }];
        return { path, document: value };
      });
      const { user, dialog } = await failOnce();
      await user.click(
        within(dialog).getByRole('button', { name: 'Save to new branch' })
      );
      expect(
        await within(dialog).findByRole('button', { name: 'Saving' })
      ).toBeVisible();
      expect(
        within(dialog).getByRole('button', { name: 'Cancel' })
      ).toBeDisabled();
      await user.keyboard('{Escape}');
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(toastShown()).not.toBeNull();
      expect(action).toHaveBeenCalledOnce();
      expect(action.mock.calls[0]?.[0]).toMatchObject({
        name: 'feature/news-2',
        from: undefined,
        path: 'content/posts/hello.mdx',
      });
      await act(async () => finish());
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(toastShown()).toBeNull());
      expect(switchCalls).toEqual(['feature/news-2']);
      expect(
        await screen.findByRole('button', { name: /^Branch: feature\/news-2/ })
      ).toBeVisible();
      expect(
        await screen.findByRole('button', { name: 'Save' })
      ).toBeDisabled();
      expect(updates).toHaveLength(0);
    });

    it('keeps the dialog, the toast and branch-gone when the action rejects, and resends the same call', async () => {
      const action = withAction();
      action.mockRejectedValueOnce(new Error('nope'));
      action.mockRejectedValueOnce(new Error('nope again'));
      const { user, dialog } = await failOnce();
      await user.click(
        within(dialog).getByRole('button', { name: 'Save to new branch' })
      );
      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'Couldn’t make the branch. Try again.'
      );
      // Outlasts the toast's exit animation, so a dismissed toast is gone.
      await act(() => new Promise((resolve) => setTimeout(resolve, 500)));
      expect(toastShown()).toHaveTextContent(
        "Couldn't save. This branch no longer exists."
      );
      expect(
        within(statusBar()).getByText('Save failed: branch no longer exists')
      ).toBeVisible();
      expect(switchCalls).toHaveLength(0);
      await user.click(
        within(dialog).getByRole('button', { name: 'Save to new branch' })
      );
      await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
      expect(action.mock.calls[1]?.[0]).toMatchObject({
        name: 'feature/news-2',
        from: undefined,
      });
      await within(dialog).findByRole('alert');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await pressSave(user);
      expect(
        await screen.findByRole('dialog', { name: 'feature/news was deleted' })
      ).toBeVisible();
      expect(updates).toHaveLength(0);
      expect(switchCalls).toHaveLength(0);
    });
  });
});

describe('branch switcher rows and creating a branch', () => {
  const openSwitcher = async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    return {
      user,
      dialog: await screen.findByRole('dialog', { name: 'Branches' }),
    };
  };

  const startCreate = async (name = 'cms/x') => {
    const opened = await openSwitcher();
    await opened.user.click(
      await within(opened.dialog).findByRole('button', { name: 'New branch' })
    );
    await opened.user.type(
      within(opened.dialog).getByRole('searchbox', { name: 'New branch name' }),
      name
    );
    return opened;
  };

  const press = (
    dialog: HTMLElement,
    user: ReturnType<typeof userEvent.setup>
  ) =>
    user.click(
      within(dialog).getByRole('button', { name: /^(Create branch|Retry)$/ })
    );

  it('shows a pull request number on its row and finds the branch by it', async () => {
    pullRequestUrls = {
      'feature/news': 'https://github.com/acme/site/pull/482',
      other: 'https://github.com/acme/site/compare/other',
    };
    const { user, dialog } = await openSwitcher();
    await within(dialog).findByText('#482');
    expect(
      within(dialog).queryByText(/^#/, { selector: 'span' })
    ).toHaveTextContent('#482');
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'Search branches' }),
      '#482'
    );
    expect(
      within(dialog)
        .getAllByRole('listitem')
        .map((row) => row.textContent)
    ).toEqual(['feature/news#482']);
  });

  it('makes a branch from the current one and lands on it when it is ready', async () => {
    let ready: () => void = () => {};
    const create = vi.fn(async ({ name }: { name: string; from: string }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    }));
    createBranch = create;
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(within(dialog).getByRole('button', { name: 'Creating' }));
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({ name: 'cms/x', from: 'main' });
    expect(
      await within(dialog).findByRole('button', { name: 'Creating' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(within(dialog).queryByRole('alert')).toBeNull();
    act(() => ready());
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Branches' })).toBeNull()
    );
    expect(screen.getByRole('button', { name: 'Branch: cms/x' })).toBeVisible();
  });

  it('keeps the form with Retry when the branch could not be made, and retries with the same name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const create = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ name: 'cms/x' });
    createBranch = create;
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    expect(
      await within(dialog).findByText("Couldn't create cms/x. Try again.")
    ).toBeVisible();
    expect(warn).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
    await press(dialog, user);
    expect(create).toHaveBeenLastCalledWith({ name: 'cms/x', from: 'main' });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeVisible()
    );
  });

  it('warns and does not switch when the branch was made but is not ready', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const create = vi.fn(async ({ name }: { name: string; from: string }) => ({
      name,
      ready: Promise.reject(new Error('timed out')),
    }));
    createBranch = create;
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    expect(
      await screen.findByText(
        "cms/x isn't ready yet. It was made. You can switch to it after reloading the page."
      )
    ).toBeVisible();
    expect(create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
    expect(await screen.findByRole('button', { name: /cms\/x/ })).toBeVisible();
  });

  it('keeps an unready branch unswitchable after creating clears and after a later create', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi.fn(async ({ name }: { name: string; from: string }) =>
      name === 'cms/x'
        ? { name, ready: Promise.reject(new Error('timed out')) }
        : { name }
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await within(dialog).findByText(/isn't ready yet/);
    const unswitchable = () => {
      const row = within(dialog).getByRole('button', { name: /cms\/x/ });
      expect(row).toHaveAttribute('aria-disabled', 'true');
      expect(row).toHaveTextContent('Reload to switch');
      expect(row).not.toHaveTextContent('Getting ready');
    };
    unswitchable();
    await user.click(within(dialog).getByRole('button', { name: /cms\/x/ }));
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
    await user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/y'
    );
    await press(dialog, user);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Branch: cms/y' })
      ).toBeVisible()
    );
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    const row = within(reopened).getByRole('button', { name: /cms\/x/ });
    expect(row).toHaveAttribute('aria-disabled', 'true');
    await user.click(row);
    expect(screen.getByRole('button', { name: 'Branch: cms/y' })).toBeVisible();
  });

  it('refuses Switch to while an afterSave hook still runs, and switches once it ends', async () => {
    useUnprotectedBranch();
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    let endAfterSave: () => void = () => {};
    holdAfterSave = new Promise<void>((resolve) => {
      endAfterSave = resolve;
    });
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(readAnyFormDirty()).toBe(false);
    const formId = toFormId('content/posts/hello.mdx');

    act(() => ready());
    await user.click(
      await screen.findByRole('button', { name: 'Switch to cms/x' })
    );
    expect(
      screen.getByRole('button', { name: /^Branch: feature\/news/ })
    ).toBeVisible();
    expect(
      await screen.findByText('Wait for the save to finish.')
    ).toBeVisible();
    expect(useFormStore.getState().forms[formId]).toBeDefined();
    expect(useFormStore.getState().saves[formId]?.phase).toBe('saving');

    act(() => endAfterSave());
    await waitFor(() =>
      expect(useFormStore.getState().saves[formId]?.phase).toBe('saved')
    );
    await waitFor(() =>
      expect(screen.queryByText('Wait for the save to finish.')).toBeNull()
    );
    await user.click(screen.getByRole('button', { name: 'Switch to cms/x' }));
    expect(screen.getByRole('button', { name: 'Branch: cms/x' })).toBeVisible();
  });

  it('holds the auto-switch to a ready branch until the running save ends', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    const formId = toFormId('content/posts/hello.mdx');
    act(() =>
      useFormStore.getState().setSavePhase(formId, { phase: 'saving' })
    );
    act(() => ready());
    expect(await within(dialog).findByText(/cms\/x is ready/)).toBeVisible();
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();

    act(() => useFormStore.getState().setSavePhase(formId, { phase: 'saved' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeVisible()
    );
    expect(screen.queryByRole('dialog', { name: 'Branches' })).toBeNull();
  });

  it('drops the held auto-switch when the pop-up closes, leaving Switch to in the toast', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    const formId = toFormId('content/posts/hello.mdx');
    act(() =>
      useFormStore.getState().setSavePhase(formId, { phase: 'saving' })
    );
    act(() => ready());
    await within(dialog).findByText(/cms\/x is ready/);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => useFormStore.getState().setSavePhase(formId, { phase: 'saved' }));

    const switchTo = await screen.findByRole('button', {
      name: 'Switch to cms/x',
    });
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
    await user.click(switchTo);
    expect(screen.getByRole('button', { name: 'Branch: cms/x' })).toBeVisible();
  });

  it('offers Switch in a toast when the pop-up was closed while the branch was made', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => ready());
    expect(await screen.findByText('cms/x is ready')).toBeVisible();
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Switch to cms/x' }));
    expect(screen.getByRole('button', { name: 'Branch: cms/x' })).toBeVisible();
  });

  it('shows an error toast with Retry when the branch could not be made while the pop-up is closed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let fail: (cause: Error) => void = () => {};
    const create = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            fail = reject;
          })
      )
      .mockResolvedValueOnce({ name: 'cms/x' });
    createBranch = create;
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => fail(new Error('offline')));
    expect(await screen.findByText("Couldn't create cms/x")).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(create).toHaveBeenLastCalledWith({ name: 'cms/x', from: 'main' });
  });

  it('shows each branch its own unsaved count, and none once the edits are discarded', async () => {
    localStorage.setItem(
      draftKey(toFormId('content/posts/hello.mdx'), undefined, 'other'),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'Hello' },
      })
    );
    localStorage.setItem(
      draftKey(toFormId('content/posts/breaking.mdx'), undefined, 'other'),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'Breaking' },
      })
    );
    const { dialog } = await openSwitcher();
    const other = await within(dialog).findByRole('button', { name: /^other/ });
    expect(other).toHaveTextContent('2 unsaved');
    expect(
      within(dialog).getByRole('button', { name: /^main/ })
    ).not.toHaveTextContent('unsaved');
  });

  it('stays on the branch it started on, and toasts, when the branch changed while it was made', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      await within(dialog).findByRole('button', { name: /^other/ })
    );
    await user.click(screen.getByRole('button', { name: /^Branch: other/ }));
    act(() => ready());
    expect(await screen.findByText('cms/x is ready')).toBeVisible();
    expect(
      screen.getByRole('button', { name: /^Branch: other/ })
    ).toBeVisible();
  });

  it('lands on the new branch when it started from the default branch while on another one', async () => {
    const create = vi.fn(async ({ name }: { name: string; from: string }) => ({
      name,
    }));
    createBranch = create;
    const first = await openSwitcher();
    await first.user.click(
      await within(first.dialog).findByRole('button', { name: /^other/ })
    );
    await first.user.click(
      screen.getByRole('button', { name: /^Branch: other/ })
    );
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await first.user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    await first.user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    await first.user.click(
      within(
        within(dialog).getByRole('radiogroup', { name: 'Start from' })
      ).getByRole('radio', { name: /^main/ })
    );
    await press(dialog, first.user);
    expect(create).toHaveBeenCalledWith({ name: 'cms/x', from: 'main' });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeVisible()
    );
  });

  const openDocument = async (user: ReturnType<typeof userEvent.setup>) => {
    window.location.hash = '#/collections/post';
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    return screen.findByLabelText(/^Title\b/);
  };

  it("counts the current branch's dirty form, and drops the badge once the edit is undone", async () => {
    const user = userEvent.setup();
    const title = await openDocument(user);
    await user.type(title, '!');
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(dialog).findByRole('button', { name: /^main/ })
    ).toHaveTextContent('1 unsaved');
    await user.keyboard('{Escape}');
    await user.click(title);
    await user.keyboard('{Backspace}');
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const again = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(again).findByRole('button', { name: /^main/ })
    ).not.toHaveTextContent('unsaved');
  });

  it('keeps New branch off while the list loads, and Create branch off with unsaved changes', async () => {
    const user = userEvent.setup();
    let release: () => void = () => {};
    heldDefault = new Promise<void>((resolve) => {
      release = resolve;
    });
    createBranch = async ({ name }) => ({ name });
    const title = await openDocument(user);
    await user.click(screen.getByRole('button', { name: 'Branches' }));
    const loading = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      within(loading).getByRole('button', { name: 'New branch' })
    ).toBeDisabled();
    release();
    await within(loading).findByRole('button', { name: /^main/ });
    await user.keyboard('{Escape}');
    await user.type(title, '!');
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      within(dialog).getByText('Save or discard your changes first')
    ).toBeVisible();
    await user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    expect(
      within(dialog).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
  });

  it('stays put and toasts when a form became dirty while the branch was made', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const user = userEvent.setup();
    const title = await openDocument(user);
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(dialog).findByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    await press(dialog, user);
    fireEvent.change(title, { target: { value: 'Hello!' } });
    act(() => ready());
    expect(await within(dialog).findByText('cms/x is ready')).toBeVisible();
    expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0);
    const switchButton = within(dialog).getByRole('button', {
      name: 'Switch to cms/x',
    });
    await user.click(switchButton);
    const note = dialog.querySelector(
      '[data-slot="branch-outcome-note"]'
    ) as HTMLElement;
    expect(
      await within(note).findByText('Save or discard your changes first')
    ).toBeVisible();
    expect(within(note).getByText('cms/x is ready')).toBeVisible();
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
  });

  it('refuses Switch in the ready toast, and a Retry, while a form is dirty', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const user = userEvent.setup();
    const title = await openDocument(user);
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(dialog).findByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => ready());
    await screen.findByText('cms/x is ready');
    await user.type(title, '!');
    await user.click(screen.getByRole('button', { name: 'Switch to cms/x' }));
    expect(
      await screen.findByText('Save or discard your changes first')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /^Branch: main/ })).toBeVisible();
  });

  it("reads no other branch's drafts while the switcher is closed", async () => {
    localStorage.setItem(
      draftKey(toFormId('content/posts/hello.mdx'), undefined, 'other'),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'Hello' },
      })
    );
    const read = vi.spyOn(window.localStorage, 'getItem');
    const user = userEvent.setup();
    const title = await openDocument(user);
    await user.type(title, '!');
    const touched = () =>
      read.mock.calls.some(([key]) => String(key).includes('@@other'));
    expect(touched()).toBe(false);
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await within(dialog).findByRole('button', { name: /^other/ });
    await waitFor(() => expect(touched()).toBe(true));
    read.mockRestore();
  });

  const failWhileClosed = async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rejects: ((cause: Error) => void)[] = [];
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(
      () =>
        new Promise((_resolve, reject) => {
          rejects.push(reject);
        })
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => rejects[0](new Error('offline')));
    await screen.findByText("Couldn't create cms/x");
    return { user, rejects };
  };

  const toasts = () => document.querySelectorAll('[data-sonner-toast]');

  it('takes the failure toast back when the switcher reopens and shows the note instead', async () => {
    const { user } = await failWhileClosed();
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(dialog).findByText("Couldn't create cms/x. Try again.")
    ).toBeVisible();
    await waitFor(() => expect(toasts()).toHaveLength(0));
  });

  it('keeps the typed name and the form when the form create fails while the switcher is closed', async () => {
    const { user } = await failWhileClosed();
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(dialog).findByRole('searchbox', { name: 'New branch name' })
    ).toHaveValue('cms/x');
  });

  it('takes the failure toast back after the failed form create is emptied and the switcher closed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
      Promise.reject(new Error('offline'))
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await within(dialog).findByText(/Couldn't create cms\/x\. Try/);
    await user.click(
      within(dialog).getByRole('button', { name: 'Clear name' })
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await screen.findByText("Couldn't create cms/x");
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(reopened).findByText(/Couldn't create cms\/x\. Try/)
    ).toBeVisible();
    await waitFor(() => expect(toasts()).toHaveLength(0));
  });

  it('retries from the note, and focuses the search box only when the retry started', async () => {
    const { user, rejects } = await failWhileClosed();
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(dialog).findByRole('button', { name: 'Retry' })
    );
    await waitFor(() => expect(rejects).toHaveLength(2));
    expect(createBranch).toHaveBeenLastCalledWith({
      name: 'cms/x',
      from: 'main',
    });
    expect(await within(dialog).findByText('Creating cms/x…')).toBeVisible();
    act(() => rejects[1](new Error('offline')));
    expect(
      await within(dialog).findByText("Couldn't create cms/x. Try again.")
    ).toBeVisible();
    await waitFor(() => expect(toasts()).toHaveLength(0));
  });

  it('sends no toast for a ready note once you switched to its branch from the list', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => ready());
    await screen.findByText('cms/x is ready');
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const open = await screen.findByRole('dialog', { name: 'Branches' });
    await waitFor(() => expect(toasts()).toHaveLength(0));
    const row = (
      await within(open).findAllByRole('button', { name: /cms\/x/ })
    ).find((button) => !/Switch to/.test(button.textContent ?? ''));
    if (!row) throw new Error('no cms/x row');
    await user.click(row);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeVisible()
    );
    if (screen.queryByRole('dialog', { name: 'Branches' })) {
      await user.keyboard('{Escape}');
    }
    await act(async () => {});
    await waitFor(() => expect(toasts()).toHaveLength(0), { timeout: 3000 });
  });

  it('keeps a failure toast gone after its own Dismiss when the failure first showed in the form', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let fail: () => void = () => {};
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(
      () =>
        new Promise((_resolve, reject) => {
          fail = () => reject(new Error('offline'));
        })
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    act(() => fail());
    expect(
      await within(dialog).findByText("Couldn't create cms/x. Try again.")
    ).toBeVisible();
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    const sent = (await screen.findByText("Couldn't create cms/x")).closest(
      '[data-slot=toast]'
    ) as HTMLElement;
    await user.click(within(sent).getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(toasts()).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const again = await screen.findByRole('dialog', { name: 'Branches' });
    expect(within(again).queryByText(/Couldn't create cms\/x/)).toBeNull();
    await user.click(
      within(again).getByRole('button', { name: 'Close branches' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Branches' })).toBeNull()
    );
    expect(toasts()).toHaveLength(0);
  });

  it('keeps a ready outcome as the note after its toast closes by itself', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let finish: () => void = () => {};
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(
      ({ name }) =>
        new Promise((resolve) => {
          finish = () => resolve({ name });
        })
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => finish());
    expect(await screen.findByText('cms/x is ready')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    await waitFor(() => expect(toasts()).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const again = await screen.findByRole('dialog', { name: 'Branches' });
    expect(within(again).getByText('cms/x is ready')).toBeVisible();
  });

  it('keeps a failure toast gone after its own Dismiss, also once the switcher opens and closes', async () => {
    const { user } = await failWhileClosed();
    const toast = screen
      .getByText("Couldn't create cms/x")
      .closest('[data-slot=toast]') as HTMLElement;
    await user.click(within(toast).getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(toasts()).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    expect(within(dialog).queryByText(/Couldn't create cms\/x/)).toBeNull();
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Branches' })).toBeNull()
    );
    expect(toasts()).toHaveLength(0);
    expect(screen.queryByText("Couldn't create cms/x")).toBeNull();
  });

  it('sends one toast when the switcher closes with the note, and none after Dismiss', async () => {
    const { user } = await failWhileClosed();
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(dialog).findByRole('button', { name: 'Dismiss' })
    );
    expect(
      within(dialog).getByRole('searchbox', { name: 'Search branches' })
    ).toHaveFocus();
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await waitFor(() => expect(toasts()).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const again = await screen.findByRole('dialog', { name: 'Branches' });
    expect(within(again).queryByText(/Couldn't create cms\/x/)).toBeNull();
  });

  it.each([
    ['desktop', false],
    ['phone sheet', true],
  ] as const)(
    'ArrowDown in the New branch name field stays in the field (%s)',
    async (_tier, phone) => {
      createBranch = async ({ name }) => ({ name });
      if (phone) phoneTier();
      const { user, dialog } = await startCreate('cms/a');
      const name = within(dialog).getByRole('searchbox', {
        name: 'New branch name',
      });
      await user.keyboard('{ArrowDown}');
      expect(name).toHaveFocus();
    }
  );

  describe.each([
    ['desktop', false],
    ['phone sheet', true],
  ] as const)('a form create that failed while closed (%s)', (_tier, phone) => {
    const failThenRetry = async (end: 'ready' | 'unready') => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      if (phone) phoneTier();
      window.location.hash = '#/screens/branch-action';
      let failFirst: () => void = () => {};
      let finish: () => void = () => {};
      createBranch = vi
        .fn<NonNullable<BranchSource['create']>>()
        .mockImplementationOnce(
          () =>
            new Promise((_resolve, reject) => {
              failFirst = () => reject(new Error('offline'));
            })
        )
        .mockImplementation(
          ({ name }) =>
            new Promise((resolve) => {
              finish = () =>
                resolve({
                  name,
                  ready:
                    end === 'ready'
                      ? Promise.resolve()
                      : Promise.reject(new Error('late')),
                });
            })
        );
      const { user, dialog } = await startCreate('cms/a');
      await press(dialog, user);
      await user.keyboard('{Escape}');
      act(() => failFirst());
      await screen.findByText("Couldn't create cms/a");
      return { user, finish: () => act(() => finish()) };
    };

    it.each(['ready', 'unready'] as const)(
      'resets the form when the note Retry ends %s, and never shows "already exists"',
      async (end) => {
        const { user, finish } = await failThenRetry(end);
        await user.click(screen.getByRole('button', { name: /^Branch:/ }));
        const dialog = await screen.findByRole('dialog', { name: 'Branches' });
        const name = await within(dialog).findByRole('searchbox', {
          name: 'New branch name',
        });
        expect(name).toHaveValue('cms/a');
        await user.click(
          await within(dialog).findByRole('button', { name: 'Retry' })
        );
        finish();
        if (end === 'ready') {
          expect(
            await screen.findByRole('button', { name: 'Branch: cms/a' })
          ).toBeVisible();
        } else {
          expect(
            await within(dialog).findByText(/cms\/a isn't ready yet/)
          ).toBeVisible();
          expect(
            within(dialog).queryByRole('form', { name: 'New branch form' })
          ).toBeNull();
        }
        expect(screen.queryByText(/already exists/)).toBeNull();
      }
    );

    it('resets the hidden form when the toast Retry ends ready, so reopening shows the list', async () => {
      const { user, finish } = await failThenRetry('ready');
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      finish();
      expect(await screen.findByText('cms/a is ready')).toBeVisible();
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Branches' });
      expect(
        await within(dialog).findByRole('button', { name: 'New branch' })
      ).toBeVisible();
      expect(
        within(dialog).queryByRole('form', { name: 'New branch form' })
      ).toBeNull();
    });

    it('keeps a different typed name and shows the ready outcome beside it when the toast Retry ends', async () => {
      const { user, finish } = await failThenRetry('ready');
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Branches' });
      const name = await within(dialog).findByRole('searchbox', {
        name: 'New branch name',
      });
      await user.clear(name);
      await user.type(name, 'cms/b');
      await user.keyboard('{Escape}');
      await user.click(await screen.findByRole('button', { name: 'Retry' }));
      finish();
      expect(await screen.findByText('cms/a is ready')).toBeVisible();
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const reopened = await screen.findByRole('dialog', { name: 'Branches' });
      expect(
        await within(reopened).findByRole('searchbox', {
          name: 'New branch name',
        })
      ).toHaveValue('cms/b');
      expect(await within(reopened).findByText('cms/a is ready')).toBeVisible();
    });
  });

  it.each([
    [
      'hit its deadline',
      new BranchCreateError('no answer', 'timeout'),
      "Couldn't create cms/x. Check your connection, then retry. It may still have been made, so reload to check.",
      true,
    ],
    [
      'was refused because the name is taken',
      new BranchCreateError('conflict', 'exists'),
      'A branch called cms/x already exists. Reload to see it.',
      false,
    ],
    [
      'failed with the server saying something long',
      new Error('<html>502 Bad Gateway</html>'),
      "Couldn't create cms/x. Try again.",
      true,
    ],
    [
      'needed a new sign-in',
      new AuthError('expired'),
      "Couldn't create cms/x. Sign in again to create a branch.",
      false,
    ],
    [
      'was refused for lack of access',
      new BranchCreateError('403', 'forbidden'),
      "Couldn't create cms/x. You don't have permission to create branches.",
      false,
    ],
    [
      'could not reach the sign-in service',
      new AuthError('network'),
      "Couldn't create cms/x. Can't reach the sign-in service. Try again.",
      true,
    ],
    [
      'was refused because of the branch name',
      new BranchCreateError('422', 'refused'),
      "Couldn't create cms/x. This branch name was refused.",
      false,
    ],
    [
      'failed for an unknown reason',
      new Error('offline'),
      "Couldn't create cms/x. Try again.",
      true,
    ],
  ])(
    'says the right thing and offers Retry only when it can help when the create %s',
    async (_label, cause, words, retry) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
        Promise.reject(cause)
      );
      const { user, dialog } = await startCreate();
      await press(dialog, user);
      expect(await within(dialog).findByRole('alert')).toHaveTextContent(words);
      expect(
        within(dialog).queryByRole('button', { name: 'Retry' }) !== null
      ).toBe(retry);
      await user.click(
        within(dialog).getByRole('button', { name: 'Close branches' })
      );
      await screen.findByText("Couldn't create cms/x");
      expect(screen.queryByRole('button', { name: 'Retry' }) !== null).toBe(
        retry
      );
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const reopened = await screen.findByRole('dialog', { name: 'Branches' });
      expect(await within(reopened).findByRole('alert')).toHaveTextContent(
        words
      );
      expect(
        within(reopened).queryByRole('button', { name: 'Retry' }) !== null
      ).toBe(retry);
    }
  );

  it('disables Create branch for a name the server said is taken until the name changes', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
      Promise.reject(new BranchCreateError('conflict', 'exists'))
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await within(dialog).findByText(/already exists/);
    const create = within(dialog).getByRole('button', {
      name: 'Create branch',
    });
    expect(create).toBeDisabled();
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      '2'
    );
    expect(
      within(dialog).getByRole('button', { name: 'Create branch' })
    ).toBeEnabled();
    expect(createBranch).toHaveBeenCalledTimes(1);
  });

  it('moves focus to the name field when a failure disables the focused Create branch', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
      Promise.reject(new BranchCreateError('conflict', 'exists'))
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await within(dialog).findByText(/already exists/);
    expect(
      within(dialog).getByRole('searchbox', { name: 'New branch name' })
    ).toHaveFocus();
  });

  it.each([
    ['exists', new BranchCreateError('conflict', 'exists')],
    ['refused', new BranchCreateError('422', 'refused')],
  ])(
    'keeps Create branch off for the same name after a %s failure, even after closing and reopening',
    async (_label, cause) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
        Promise.reject(cause)
      );
      const { user, dialog } = await startCreate();
      await press(dialog, user);
      await within(dialog).findByRole('alert');
      expect(
        within(dialog).getByRole('button', { name: 'Create branch' })
      ).toBeDisabled();
      await user.keyboard('{Escape}');
      await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
      const reopened = await screen.findByRole('dialog', { name: 'Branches' });
      const name = await within(reopened).findByRole('searchbox', {
        name: 'New branch name',
      });
      expect(name).toHaveValue('cms/x');
      expect(
        within(reopened).getByRole('button', { name: 'Create branch' })
      ).toBeDisabled();
      await user.type(name, '2');
      expect(
        within(reopened).getByRole('button', { name: 'Create branch' })
      ).toBeEnabled();
    }
  );

  it('keeps Create branch off for a name refused while the switcher was closed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rejects: ((cause: Error) => void)[] = [];
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(
      () =>
        new Promise((_resolve, reject) => {
          rejects.push(reject);
        })
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => rejects[0](new BranchCreateError('conflict', 'exists')));
    await screen.findByText("Couldn't create cms/x");
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    const name = await within(reopened).findByRole('searchbox', {
      name: 'New branch name',
    });
    expect(name).toHaveValue('cms/x');
    expect(
      within(reopened).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
    expect(within(reopened).getAllByRole('alert').pop()).toHaveTextContent(
      'A branch called cms/x already exists. Reload to see it.'
    );
    await user.type(name, '{Enter}');
    expect(createBranch).toHaveBeenCalledTimes(1);
  });

  it('lets the same name be tried again after reopening once a sign-in failure is over', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
      Promise.reject(new AuthError('expired'))
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await within(dialog).findByRole('alert');
    await user.keyboard('{Escape}');
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    await within(reopened).findByRole('searchbox', { name: 'New branch name' });
    expect(
      within(reopened).getByRole('button', { name: 'Create branch' })
    ).toBeEnabled();
  });

  it.each([
    ['sign-in', new AuthError('expired')],
    ['permission', new BranchCreateError('403', 'forbidden')],
    ['sign-in service', new AuthError('network')],
    ['timeout', new BranchCreateError('late', 'timeout')],
  ])(
    'leaves Create branch on for the same name after a %s failure',
    async (_label, cause) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
        Promise.reject(cause)
      );
      const { user, dialog } = await startCreate();
      await press(dialog, user);
      await within(dialog).findByRole('alert');
      expect(
        within(dialog).getByRole('button', { name: /^(Create branch|Retry)$/ })
      ).toBeEnabled();
    }
  );

  it('keeps a taken name blocked after another create ended ready', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockRejectedValueOnce(new BranchCreateError('conflict', 'exists'))
      .mockImplementation(async ({ name }) => ({ name }));
    window.location.hash = '#/screens/branch-action';
    const { user, dialog } = await startCreate('cms/taken');
    await press(dialog, user);
    await within(dialog).findByText(/already exists/);
    const name = within(dialog).getByRole('searchbox', {
      name: 'New branch name',
    });
    await user.clear(name);
    await user.type(name, 'cms/new');
    await press(dialog, user);
    await screen.findByRole('button', { name: 'Branch: cms/new' });
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(reopened).findByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(reopened).getByRole('searchbox', { name: 'New branch name' }),
      'cms/taken'
    );
    expect(
      within(reopened).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
  });

  it('keeps validating the name after a create ended ready', async () => {
    createBranch = async ({ name }) => ({ name, ready: Promise.resolve() });
    const { user, dialog } = await startCreate('cms/z');
    await press(dialog, user);
    await user.click(
      await screen.findByRole('button', { name: 'Branch: cms/z' })
    );
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(reopened).findByRole('button', { name: 'New branch' })
    );
    const name = within(reopened).getByRole('searchbox', {
      name: 'New branch name',
    });
    await user.type(name, 'cms/z');
    expect(await within(reopened).findByRole('alert')).toHaveTextContent(
      /already exists/
    );
    expect(
      within(reopened).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
  });

  it('does not pull focus from the top bar Search when a create ends in the maximised view', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let finish: () => void = () => {};
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(
      ({ name }) =>
        new Promise((resolve) => {
          finish = () =>
            resolve({ name, ready: Promise.reject(new Error('late')) });
        })
    );
    const { user, dialog } = await startCreate();
    await user.click(within(dialog).getByRole('button', { name: 'Maximise' }));
    await screen.findByRole('button', { name: 'Restore' });
    const frame = globalThis.document.querySelector<HTMLElement>(
      '[data-slot="branch-maximised"]'
    );
    if (!frame) throw new Error('no maximised view');
    await press(frame, user);
    const search = await screen.findByRole('button', { name: /Search/ });
    search.focus();
    expect(search).toHaveFocus();
    act(() => finish());
    expect(
      await within(frame).findByText(/cms\/x isn't ready yet/)
    ).toBeVisible();
    await act(async () => {});
    expect(search).toHaveFocus();
  });

  it('never shows "already exists" while a form create ends ready', async () => {
    createBranch = async ({ name }) => ({ name, ready: Promise.resolve() });
    const { user, dialog } = await startCreate();
    const seen: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          seen.push(node.textContent ?? '');
        }
      }
    });
    observer.observe(globalThis.document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    await press(dialog, user);
    await screen.findByRole('button', { name: 'Branch: cms/x' });
    await act(async () => {});
    observer.disconnect();
    expect(seen.filter((text) => /already exists/.test(text))).toEqual([]);
  });

  it('keeps the toast when Retry is pressed after the provider lost its create', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.location.hash = '#/screens/branch-action';
    createBranch = vi.fn<NonNullable<BranchSource['create']>>(() =>
      Promise.reject(new Error('offline'))
    );
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await within(dialog).findByText(/Couldn't create cms\/x\. Try/);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await screen.findByText("Couldn't create cms/x");
    act(() => dropCreate());
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText("Couldn't create cms/x")).toBeVisible();
  });

  it('leaves focus on the field you clicked when you dismiss the pop-up by clicking outside', async () => {
    const { user } = await openSwitcher();
    const outside = screen.getAllByRole('button', {
      name: 'Toggle Sidebar',
    })[0];
    await user.click(outside);
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Branches' })).toBeNull()
    );
    expect(outside).toHaveFocus();
  });

  it('sends the toast again when the switcher closes with the note still held', async () => {
    const { user } = await failWhileClosed();
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    await screen.findByRole('dialog', { name: 'Branches' });
    await waitFor(() => expect(toasts()).toHaveLength(0));
    await user.keyboard('{Escape}');
    expect(await screen.findByText("Couldn't create cms/x")).toBeVisible();
    expect(toasts()).toHaveLength(1);
  });

  it('keeps the failure toast when Retry is refused for unsaved edits, and retries once they are saved', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const create = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(() => new Promise(() => {}));
    createBranch = create;
    const user = userEvent.setup();
    const title = await openDocument(user);
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(dialog).findByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await screen.findByText("Couldn't create cms/x");
    await user.type(title, '!');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText("Couldn't create cms/x")).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
    expect(create).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    expect(
      await within(reopened).findByText(/Couldn't create cms\/x/)
    ).toBeVisible();
    await user.click(
      within(reopened).getByRole('button', { name: 'Close branches' })
    );
    await user.clear(title);
    await user.type(title, 'Hello');
    await waitFor(() => expect(readAnyFormDirty()).toBe(false));
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText("Couldn't create cms/x")).toBeNull()
    );
  });

  it('shows one unsaved-changes warning however often a refused Retry or Switch to is pressed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let ready: () => void = () => {};
    createBranch = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(async ({ name }) => ({
        name,
        ready: new Promise<void>((resolve) => {
          ready = resolve;
        }),
      }));
    const user = userEvent.setup();
    const title = await openDocument(user);
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(
      await within(dialog).findByRole('button', { name: 'New branch' })
    );
    await user.type(
      within(dialog).getByRole('searchbox', { name: 'New branch name' }),
      'cms/x'
    );
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await screen.findByText("Couldn't create cms/x");
    await user.type(title, '!');
    const retry = screen.getByRole('button', { name: 'Retry' });
    await user.click(retry);
    await user.click(retry);
    await user.click(retry);
    const warnings = () =>
      screen.queryAllByText('Save or discard your changes first');
    await waitFor(() => expect(warnings()).toHaveLength(1));
    await user.clear(title);
    await user.type(title, 'Hello');
    await waitFor(() => expect(readAnyFormDirty()).toBe(false));
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    act(() => ready());
    await screen.findByText('cms/x is ready');
    await user.type(title, '!');
    const switchTo = screen.getByRole('button', { name: 'Switch to cms/x' });
    await user.click(switchTo);
    await user.click(switchTo);
    await user.click(switchTo);
    await waitFor(() => expect(warnings()).toHaveLength(1));
  });

  it('shows one wait warning however often Retry is pressed while another create runs', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(() => new Promise(() => {}));
    window.location.hash = '#/screens/branch-action';
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await screen.findByText("Couldn't create cms/x");
    act(() => createDirect('cms/y', 'main'));
    const retry = screen.getByRole('button', { name: 'Retry' });
    await user.click(retry);
    await user.click(retry);
    await user.click(retry);
    await waitFor(() =>
      expect(
        screen.getAllByText('Wait for cms/y to finish first')
      ).toHaveLength(1)
    );
    expect(screen.getByText("Couldn't create cms/x")).toBeVisible();
  });

  describe('a create started from the note while the New branch form is open', () => {
    type Outcome = 'ready' | 'unready' | 'failed';
    const settle = (end: Outcome, name: string) =>
      end === 'failed'
        ? Promise.reject(new Error('again'))
        : Promise.resolve({
            name,
            ready:
              end === 'ready'
                ? Promise.resolve()
                : Promise.reject(new Error('late')),
          });

    const noteRetry = async (
      end: Outcome,
      options: { typed?: string; phone?: boolean; third?: Outcome } = {}
    ) => {
      const { typed = 'cms/b', phone = false, third = 'ready' } = options;
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      if (phone) phoneTier();
      window.location.hash = '#/screens/branch-action';
      let finish: () => void = () => {};
      let failFirst: () => void = () => {};
      createBranch = vi
        .fn<NonNullable<BranchSource['create']>>()
        .mockImplementationOnce(
          () =>
            new Promise((_resolve, reject) => {
              failFirst = () => reject(new Error('offline'));
            })
        )
        .mockImplementationOnce(
          ({ name }) =>
            new Promise((resolve, reject) => {
              finish = () => {
                void settle(end, name).then(resolve, reject);
              };
            })
        )
        .mockImplementation(({ name }) => settle(third, name));
      const first = await startCreate('cms/a');
      await press(first.dialog, first.user);
      if (phone) await first.user.keyboard('{Escape}');
      else {
        await first.user.click(
          within(first.dialog).getByRole('button', { name: 'Close branches' })
        );
      }
      act(() => failFirst());
      await screen.findByText("Couldn't create cms/a");
      const { user } = first;
      await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Branches' });
      await within(dialog).findByText(/Couldn't create cms\/a\. Try/);
      const open = within(dialog).queryByRole('button', {
        name: 'New branch',
      });
      if (open) await user.click(open);
      const name = within(dialog).getByRole('searchbox', {
        name: 'New branch name',
      });
      await user.clear(name);
      if (typed !== '') await user.type(name, typed);
      await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
      // Ends the create, then waits for the wait line to go: a state change that follows the end.
      const ended = async () => {
        act(() => finish());
        await waitFor(() =>
          expect(
            within(dialog).queryByText('Wait for cms/a to finish first')
          ).toBeNull()
        );
        await act(async () => {});
      };
      return { user, dialog, name, ended };
    };
    const tiers = [
      ['desktop', false],
      ['phone sheet', true],
    ] as const;

    it.each(tiers)(
      'does not make the form busy or touch what was typed, and shows the running create (%s)',
      async (_tier, phone) => {
        const { dialog, name } = await noteRetry('ready', { phone });
        expect(name).not.toHaveAttribute('readonly');
        expect(name).toHaveValue('cms/b');
        expect(within(dialog).getByText('Creating cms/a…')).toBeVisible();
        expect(
          within(dialog).getByRole('button', { name: 'Create branch' })
        ).toBeDisabled();
        expect(
          within(dialog).getByText('Wait for cms/a to finish first')
        ).toBeVisible();
      }
    );

    describe.each(tiers)('when the create ends (%s)', (_tier, phone) => {
      it('puts focus in the search box when the outcome note closes the focused empty form', async () => {
        const { dialog, name, ended } = await noteRetry('unready', {
          typed: '',
          phone,
        });
        name.focus();
        await ended();
        expect(
          await within(dialog).findByText(/cms\/a isn't ready yet/)
        ).toBeVisible();
        await waitFor(() =>
          expect(
            within(dialog).getByRole('searchbox', { name: 'Search branches' })
          ).toHaveFocus()
        );
      });

      it.each([
        ['ready', 'cms/a is ready'],
        ['unready', /cms\/a isn't ready yet/],
        ['failed', /Couldn't create cms\/a\. Try/],
      ] as const)(
        'keeps the typed name, the form and the branch when it ends %s, and shows the note once the form closes',
        async (end, note) => {
          const { user, dialog, name, ended } = await noteRetry(end, {
            phone,
          });
          await ended();
          expect(name).toHaveValue('cms/b');
          expect(screen.getByRole('dialog', { name: 'Branches' })).toBe(dialog);
          expect(
            within(dialog).getByRole('form', { name: 'New branch form' })
          ).toBeVisible();
          expect(switchCalls).toEqual([]);
          await user.click(
            within(dialog).getByRole('button', { name: 'Back to branches' })
          );
          expect(await within(dialog).findByText(note)).toBeVisible();
          expect(
            screen.getByRole('button', { name: /^Branch: main/, hidden: true })
          ).toBeInTheDocument();
        }
      );
    });

    it.each([
      ['ready', 'cms/a is ready'],
      ['unready', /cms\/a isn't ready yet/],
    ] as const)(
      'resets the form and shows the outcome when a typed name equals the create that ends %s',
      async (end, note) => {
        const { dialog, ended } = await noteRetry(end, { typed: 'cms/a' });
        await ended();
        expect(
          within(dialog).queryByRole('form', { name: 'New branch form' })
        ).toBeNull();
        if (end === 'unready') {
          expect(await within(dialog).findByText(note)).toBeVisible();
        }
      }
    );

    it('keeps a typed name equal to the create that ends failed', async () => {
      const { dialog, name, ended } = await noteRetry('failed', {
        typed: 'cms/a',
      });
      await ended();
      expect(name).toHaveValue('cms/a');
      expect(
        within(dialog).getByRole('form', { name: 'New branch form' })
      ).toBeVisible();
      expect(
        await within(dialog).findByText(/Couldn't create cms\/a\. Try/)
      ).toBeVisible();
    });

    it('drops a held ready outcome when the form create switches the editor', async () => {
      const { user, dialog, ended } = await noteRetry('ready', {
        third: 'ready',
      });
      await ended();
      await user.click(
        within(dialog).getByRole('button', { name: 'Create branch' })
      );
      await screen.findByRole('button', { name: 'Branch: cms/b' });
      await act(async () => {});
      expect(screen.queryByText('cms/a is ready')).toBeNull();
    });

    it.each([
      ['unready', /cms\/b isn't ready yet/],
      ['failed', /Couldn't create cms\/b/],
    ] as const)(
      'shows the new create when it ends %s, not the older held outcome',
      async (third, note) => {
        const { user, dialog, ended } = await noteRetry('ready', { third });
        await ended();
        await user.click(
          within(dialog).getByRole('button', { name: 'Create branch' })
        );
        expect(await within(dialog).findByText(note)).toBeVisible();
        if (third === 'failed') {
          await user.click(
            within(dialog).getByRole('button', { name: 'Back to branches' })
          );
        }
        await act(async () => {});
        expect(screen.queryByText('cms/a is ready')).toBeNull();
      }
    );

    it('shows the held outcome when the name is emptied, keeps the form open and focused, and lets a new name be typed', async () => {
      const { user, dialog, name, ended } = await noteRetry('ready');
      await ended();
      await user.clear(name);
      expect(await within(dialog).findByText('cms/a is ready')).toBeVisible();
      expect(
        within(dialog).getByRole('form', { name: 'New branch form' })
      ).toBeVisible();
      expect(name).toHaveFocus();
      await user.type(name, 'cms/c');
      expect(name).toHaveValue('cms/c');
    });

    it('shows the newest failure, not an older held outcome, when a later create fails', async () => {
      const { user, dialog, ended } = await noteRetry('ready', {
        third: 'failed',
      });
      await ended();
      act(() => createDirect('cms/z', 'main'));
      expect(
        await within(dialog).findByText(/Couldn't create cms\/z/)
      ).toBeVisible();
      await user.click(
        within(dialog).getByRole('button', { name: 'Back to branches' })
      );
      expect(within(dialog).getByText(/Couldn't create cms\/z/)).toBeVisible();
      expect(screen.queryByText('cms/a is ready')).toBeNull();
    });

    it('opens the next time as the list after a note-started create switched with an empty form', async () => {
      const { user, ended } = await noteRetry('ready', { typed: '' });
      await ended();
      await screen.findByRole('button', { name: 'Branch: cms/a' });
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const reopened = await screen.findByRole('dialog', { name: 'Branches' });
      expect(
        within(reopened).queryByRole('form', { name: 'New branch form' })
      ).toBeNull();
      expect(
        within(reopened).getByRole('button', { name: 'New branch' })
      ).toBeVisible();
    });
  });

  it('resets a form that started the create even when the provider renamed the branch', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    createBranch = async ({ name }) => ({
      name: `${name}-1`,
      ready: Promise.reject(new Error('late')),
    });
    const { user, dialog } = await startCreate('foo');
    await press(dialog, user);
    await within(dialog).findByText(/foo-1 isn't ready yet/);
    await user.click(
      within(dialog).getByRole('button', { name: 'New branch' })
    );
    expect(
      within(dialog).getByRole('searchbox', { name: 'New branch name' })
    ).toHaveValue('');
  });

  describe('refusals and outcomes clear once their cause is gone', () => {
    const failedToast = async (withDocument = true) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const calls: ((value: {
        name: string;
        ready?: Promise<void>;
      }) => void)[] = [];
      createBranch = vi
        .fn<NonNullable<BranchSource['create']>>()
        .mockRejectedValueOnce(new Error('offline'))
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              calls.push(resolve);
            })
        );
      const user = userEvent.setup();
      let title: HTMLElement | undefined;
      if (withDocument) title = await openDocument(user);
      else {
        window.location.hash = '#/screens/branch-action';
        renderAdmin();
        await screen.findByText('branch action screen');
      }
      await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Branches' });
      await user.click(
        await within(dialog).findByRole('button', { name: 'New branch' })
      );
      await user.type(
        within(dialog).getByRole('searchbox', { name: 'New branch name' }),
        'cms/x'
      );
      await press(dialog, user);
      await user.click(
        within(dialog).getByRole('button', { name: 'Close branches' })
      );
      await screen.findByText("Couldn't create cms/x");
      return { user, title: title as HTMLElement, calls };
    };
    const dirtyWarning = () =>
      screen.queryAllByText('Save or discard your changes first');

    it('drops the unsaved-changes warning when the edits are undone, and when the switcher opens', async () => {
      const { user, title } = await failedToast();
      await user.type(title, '!');
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      expect(dirtyWarning()).toHaveLength(1);
      await user.click(title);
      await user.keyboard('{Backspace}');
      await waitFor(() => expect(dirtyWarning()).toHaveLength(0));
      await user.type(title, '!');
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      expect(dirtyWarning()).toHaveLength(1);
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Branches' });
      await waitFor(() =>
        expect(
          dirtyWarning().filter((el) => !dialog.contains(el))
        ).toHaveLength(0)
      );
    });

    it('drops the in-switcher refusal when the switcher closes and reopens after the edits are saved', async () => {
      const { user, title } = await failedToast();
      await user.type(title, '!');
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Branches' });
      await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
      expect(
        await within(dialog).findAllByText(/Save or discard/)
      ).not.toHaveLength(0);
      await user.click(
        within(dialog).getByRole('button', { name: 'Close branches' })
      );
      await user.click(title);
      await user.keyboard('{Backspace}');
      await user.click(screen.getByRole('button', { name: /^Branch:/ }));
      const reopened = await screen.findByRole('dialog', { name: 'Branches' });
      expect(
        within(reopened).queryByText('Save or discard your changes first')
      ).toBeNull();
    });

    it('keeps one wait warning when the running create is renamed between two presses', async () => {
      const { user, calls } = await failedToast(false);
      act(() => createDirect('cms/y', 'main'));
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      expect(
        await screen.findByText('Wait for cms/y to finish first')
      ).toBeVisible();
      act(() =>
        calls[0]({ name: 'cms/y-1', ready: new Promise<void>(() => {}) })
      );
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      expect(
        await screen.findByText('Wait for cms/y-1 to finish first')
      ).toBeVisible();
      await waitFor(() =>
        expect(screen.queryAllByText(/^Wait for /)).toHaveLength(1)
      );
    });

    it('drops the wait warning when the other create ends, and replaces a stale failure toast with the new outcome', async () => {
      const { user, calls } = await failedToast(false);
      act(() => createDirect('cms/y', 'main'));
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      expect(
        await screen.findByText('Wait for cms/y to finish first')
      ).toBeVisible();
      act(() => calls[0]({ name: 'cms/y' }));
      await screen.findByText('cms/y is ready');
      await waitFor(() => {
        expect(screen.queryByText('Wait for cms/y to finish first')).toBeNull();
        expect(screen.queryByText("Couldn't create cms/x")).toBeNull();
      });
    });
  });

  it('runs a toast action once however often it is pressed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.location.hash = '#/screens/branch-action';
    saveToNewBranch = vi.fn();
    let finish: () => void = () => {};
    const create = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(
        ({ name }) =>
          new Promise((resolve) => {
            finish = () => resolve({ name });
          })
      );
    createBranch = create;
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    await screen.findByText("Couldn't create cms/x");
    await user.dblClick(screen.getByRole('button', { name: 'Retry' }));
    expect(create).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/^Wait for/)).toBeNull();
    act(() => finish());
    await screen.findByText('cms/x is ready');
    expect(create).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/^Wait for/)).toBeNull();
    await user.dblClick(
      screen.getByRole('button', { name: 'Switch to cms/x' })
    );
    await screen.findByRole('button', { name: 'Branch: cms/x' });
    expect(switchCalls).toEqual(['cms/x']);
    expect(screen.queryByText('Save or discard your changes first')).toBeNull();
  });

  it('shows no ready toast or note for a branch once it was switched to from the list', async () => {
    let ready: () => void = () => {};
    createBranch = async ({ name }) => ({
      name,
      ready: new Promise<void>((resolve) => {
        ready = resolve;
      }),
    });
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => ready());
    await screen.findByText('cms/x is ready');
    await user.click(screen.getByRole('button', { name: /^Branch:/ }));
    const reopened = await screen.findByRole('dialog', { name: 'Branches' });
    await user.click(within(reopened).getByRole('button', { name: /^cms\/x/ }));
    await screen.findByRole('button', { name: 'Branch: cms/x' });
    await waitFor(() =>
      expect(screen.queryByText('cms/x is ready')).toBeNull()
    );
    expect(
      screen.queryByRole('button', { name: 'Switch to cms/x' })
    ).toBeNull();
  });

  it('dismisses the failure toast when its Retry is pressed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let fail: (cause: Error) => void = () => {};
    createBranch = vi
      .fn<NonNullable<BranchSource['create']>>()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            fail = reject;
          })
      )
      .mockImplementationOnce(() => new Promise(() => {}));
    const { user, dialog } = await startCreate();
    await press(dialog, user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Close branches' })
    );
    act(() => fail(new Error('offline')));
    await screen.findByText("Couldn't create cms/x");
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(screen.queryByText("Couldn't create cms/x")).toBeNull()
    );
  });

  it('offers no New branch when the provider cannot create', async () => {
    const { dialog } = await openSwitcher();
    await within(dialog).findByRole('searchbox', { name: 'Search branches' });
    expect(
      within(dialog).queryByRole('button', { name: 'New branch' })
    ).toBeNull();
  });

  it('refuses a name that is already listed and sends no request', async () => {
    const create = vi.fn(async ({ name }: { name: string; from: string }) => ({
      name,
    }));
    createBranch = create;
    const { user, dialog } = await startCreate('other');
    expect(
      within(dialog).getByRole('button', { name: 'Create branch' })
    ).toBeDisabled();
    expect(create).not.toHaveBeenCalled();
  });
});
