import { ImageIcon } from 'lucide-react';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { BranchInfo } from '../core/branch/contract';
import { currentBranchOf } from '../core/branch/contract';
import { ContentError, type DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import { draftKey } from '../form/drafts';
import { toFormId, useFormStore } from '../form/form-store';
import type { TinaDocument } from '../core/schema/types';
import { required } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { TinaAdmin } from './admin';
import {
  SaveToNewBranchContext,
  type SaveToNewBranchRequest,
} from './save-to-new-branch';

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
let updateError: Error | undefined;
let listOmits: string | undefined;
let holdNextList: Promise<void> | undefined;
let heldDefault: Promise<void> | undefined;
let duplicateLabels: boolean;
let saveHandler:
  | ((request: SaveToNewBranchRequest) => Promise<void>)
  | undefined;

const contentPlugin = () =>
  definePlugin({
    name: 'test:content',
    provides: ['content'],
    client: async () => ({
      default: {
        slice: (_set, get) => {
          const branch = () => currentBranchOf(get()) ?? 'main';
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
                      );
                    },
                    defaultBranch: async () => {
                      await heldDefault;
                      return 'main';
                    },
                  },
                }
              : {}),
            list: async () =>
              (DATA[branch()] ?? []).map(({ path }) => ({ path })),
            get: async (_collection: string, path: string) => {
              if (failGet) throw new Error('disk unreadable');
              return (
                (DATA[branch()] ?? []).find((entry) => entry.path === path) ??
                null
              );
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
        search: async () => [{ ref: 'content/posts/hello.mdx' }],
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
          afterSave: () => {
            if (failAfterSave) throw new Error('audit endpoint down');
          },
        }),
      },
    },
  }),
});

const NotesScreen = () => <p>notes screen</p>;

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
        globalNav: ['Settings', 'Notes', 'Notes'].map((label) => ({
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
    <SaveToNewBranchContext value={saveHandler}>
      <TinaAdmin
        config={asResolvedConfig({
          plugins: [
            contentPlugin(),
            auditPlugin,
            screenPlugin,
            ...(duplicateLabels ? [duplicateScreenPlugin] : []),
            ...(searchEnabled ? [searchPlugin] : []),
            stringFieldPlugin,
            coreValidatorsPlugin,
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
    </SaveToNewBranchContext>
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

const press = async (user: ReturnType<typeof userEvent.setup>, chord: string) =>
  user.keyboard(chord);

beforeEach(() => {
  mode = 'branches';
  updates = [];
  holdUpdates = false;
  releaseUpdate = undefined;
  searchEnabled = false;
  failGet = false;
  listError = false;
  listCalls = 0;
  failAfterSave = false;
  updateError = undefined;
  listOmits = undefined;
  holdNextList = undefined;
  heldDefault = undefined;
  duplicateLabels = false;
  saveHandler = undefined;
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

describe('Home', () => {
  it('lands on Home with the branch line and a card per collection', async () => {
    renderAdmin();
    expect(await screen.findByText('Branch main')).toBeVisible();
    const list = screen.getByRole('list', { name: 'Collection cards' });
    expect(within(list).getByText('Posts')).toBeVisible();
    expect(await within(list).findByText('1 document')).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'New Posts document' })
    ).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Review/ })).toBeNull();
  });

  it('says Local files in local mode and leaves the branch out', async () => {
    mode = 'local';
    renderAdmin();
    expect(
      await screen.findByText(
        'Local files: Tina writes edits straight to disk.'
      )
    ).toBeVisible();
    expect(screen.queryByText(/^Branch /)).toBeNull();
  });

  it('offers Review N unsaved for edits kept in a stored draft after a reload', async () => {
    localStorage.setItem(
      draftKey(toFormId('content/posts/hello.mdx')),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'Hello' },
      })
    );
    renderAdmin();
    expect(
      await screen.findByRole('button', { name: 'Review 1 unsaved' })
    ).toBeVisible();
  });

  it('lets a long branch name wrap in its column instead of pushing Review off screen', async () => {
    renderAdmin();
    const line = await screen.findByText('Branch main');
    const column = line.parentElement;
    expect(column).toHaveClass('min-w-0', 'break-words');
  });

  it('opens the collection from its card', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Posts/ }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
    );
  });

  it('offers Review N unsaved only while documents are unsaved, and opens them', async () => {
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
    const list = await screen.findByRole('list', { name: 'Unsaved documents' });
    expect(
      await within(list).findByRole('button', { name: /hello\.mdx/ })
    ).toBeVisible();
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
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(toggles()).toHaveLength(1);
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

  it('ignores ⌘B below 768px', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
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
    await user.type(within(dialog).getByRole('searchbox'), 'sett');
    const list = within(dialog).getByRole('list', {
      name: 'Navigation results',
    });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await user.click(within(list).getByRole('button', { name: 'Settings' }));
    await waitFor(() => expect(window.location.hash).toBe('#/settings'));
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
    await user.type(box, 'Set');
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((row) => row.textContent)
    ).toEqual(['Settings', 'Settings']);
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
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    const back = await screen.findByRole('button', { name: /hello\.mdx/ });
    expect(back).toHaveTextContent('Unsaved');
    expect(
      within(screen.getByRole('navigation', { name: 'Content' })).queryByText(
        'Unsaved'
      )
    ).toBeNull();
  });

  it('puts Help & docs at the foot and opens it in a new tab', async () => {
    renderAdmin();
    const help = await screen.findByRole('link', { name: /Help & docs/ });
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
    await user.click(
      within(dialog).getByRole('button', { name: 'Full screen' })
    );
    expect(
      within(dialog).getByRole('button', { name: 'Exit full screen' })
    ).toBeVisible();
  });

  it('shows "Local files" and no branch button in local mode', async () => {
    mode = 'local';
    renderAdmin();
    const bar = await screen.findByRole('contentinfo', { name: 'Status bar' });
    await within(bar).findByText('Local files');
    expect(screen.queryByRole('button', { name: /^Branch:/ })).toBeNull();
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
    await user.click(screen.getByRole('button', { name: /^Save/ }));
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    expect(
      log.mock.calls.some(([first]) => String(first).includes('Save failed'))
    ).toBe(false);
    log.mockRestore();
  });

  it('reads Save failed after a later network failure, once the blocked save is fixed', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save/ }));
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
    await user.click(screen.getByRole('button', { name: /^Save/ }));
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
    await user.click(screen.getByRole('button', { name: /^Save/ }));
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
    await user.click(screen.getByRole('button', { name: /^Save/ }));

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
  it('has Back and a menu in its header, no Close and no second title, then tabs and a form bar', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    const panel = screen.getByRole('complementary', { name: 'Document form' });
    expect(
      within(panel).getByRole('button', { name: 'Return to navigator' })
    ).toBeVisible();
    expect(
      within(panel).getByRole('button', { name: 'Document menu' })
    ).toBeVisible();
    expect(within(panel).queryByRole('button', { name: 'Close' })).toBeNull();
    expect(within(panel).queryByRole('heading')).toBeNull();
    expect(within(panel).getByRole('tab', { name: 'Fields' })).toBeVisible();
    expect(within(panel).queryByRole('tab', { name: 'History' })).toBeNull();
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
  it('gives the form column Back to its collection, and the missing views a title and Close', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    const view = renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(
      within(
        screen.getByRole('complementary', { name: 'Document form' })
      ).getByRole('button', { name: 'Return to navigator' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
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
  const openHello = async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    const input = await screen.findByLabelText(/^Title\b/);
    return { user, input };
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

  it('shows field errors and no dialog when the form is invalid, and Retry checks again', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(
      await screen.findByRole('button', { name: /^Save to new branch/ })
    );
    const toast = await waitFor(() => {
      const found = document.querySelector('[data-slot=toast]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(toast).toHaveTextContent(
      "Couldn't save. Some fields are not valid."
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.type(input, 'Fixed');
    await user.click(within(toast).getByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByRole('dialog', { name: 'Save to a new branch' })
    ).toBeVisible();
    expect(updates).toHaveLength(0);
  });

  it('flags a taken name at the field and, with no handler, keeps the main action off; Cancel changes nothing', async () => {
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
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(input).toHaveValue('Hello!');
    expect(
      screen.getByRole('button', { name: 'Save to new branch' })
    ).toHaveFocus();
  });

  it('hands the confirmed name to the handler once and closes', async () => {
    saveHandler = vi.fn().mockResolvedValue(undefined);
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
    expect(saveHandler).toHaveBeenCalledOnce();
    expect(saveHandler).toHaveBeenCalledWith({
      kind: 'form',
      name: 'docs/hello-edits',
      reason: 'protected',
      formId: toFormId('content/posts/hello.mdx'),
    });
    expect(updates).toHaveLength(0);
  });

  it('logs and toasts a rejected protected handler', async () => {
    saveHandler = () => Promise.reject(new Error('pr failed'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    const toast = await waitFor(() => {
      const found = document.querySelector('[data-slot=toast]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(toast).toHaveTextContent("Couldn't save. Something went wrong.");
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });

  it('names the empty-name reason on Enter and on the main action, with a handler', async () => {
    saveHandler = vi.fn().mockResolvedValue(undefined);
    const { user, input } = await openHello();
    await user.type(input, '!');
    await user.click(
      await screen.findByRole('button', { name: 'Save to new branch' })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Save to a new branch',
    });
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
    expect(saveHandler).not.toHaveBeenCalled();
  });

  it('names the empty-name reason with no handler, where the main action is off', async () => {
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

  it('clears Save failed once the fields are fixed and the dialog opens', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(
      await screen.findByRole('button', { name: /^Save to new branch/ })
    );
    await screen.findByText(/Couldn.t save\. Some fields are not valid/);
    await user.type(input, 'Fixed');
    await user.click(
      await screen.findByRole('button', { name: /^Save to new branch/ })
    );
    await screen.findByRole('dialog', { name: 'Save to a new branch' });
    await waitFor(() =>
      expect(document.querySelector('[data-slot=toast]')).toBeNull()
    );
    const bar = document.querySelector('[data-slot=form-bar]') as HTMLElement;
    expect(bar).not.toHaveTextContent('Save failed');
  });

  it('holds Save while the handler runs, so it runs once', async () => {
    let finish: () => void = () => {};
    saveHandler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
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
    expect(saveHandler).toHaveBeenCalledOnce();
    act(() => finish());
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

    const discardEdits = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(
        screen.getByRole('button', { name: 'Document actions' })
      );
      await user.click(
        await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
      );
      await user.click(await screen.findByRole('button', { name: 'Discard' }));
    };
    const toastShown = () => document.querySelector('[data-slot=toast]');

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
      act(() => release());
      await new Promise((resolve) => setTimeout(resolve, 50));
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

    it('shows Saving and ignores Cancel while the handler runs, then closes the dialog and the toast', async () => {
      let finish: () => void = () => {};
      saveHandler = () =>
        new Promise<void>((resolve) => {
          finish = resolve;
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
      act(() => finish());
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() =>
        expect(document.querySelector('[data-slot=toast]')).toBeNull()
      );
    });

    it('keeps the dialog and toast open with an error when the handler rejects', async () => {
      saveHandler = () => Promise.reject(new Error('nope'));
      const { user, dialog } = await failOnce();
      await user.click(
        within(dialog).getByRole('button', { name: 'Save to new branch' })
      );
      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'Couldn’t make the branch. Try again.'
      );
      expect(document.querySelector('[data-slot=toast]')).not.toBeNull();
    });
  });
});
