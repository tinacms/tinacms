import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { BranchInfo } from '../core/branch/contract';
import { currentBranchOf } from '../core/branch/contract';
import type { DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import { required } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { TinaAdmin } from './admin';

type Mode = 'branches' | 'local' | 'none';

const BRANCHES: BranchInfo[] = [
  { name: 'main', protected: true },
  { name: 'feature/news' },
];

const DATA: Record<string, DocumentEntry[]> = {
  main: [{ path: 'content/posts/hello.mdx', document: { title: 'Hello' } }],
  'feature/news': [
    { path: 'content/posts/breaking.mdx', document: { title: 'Breaking' } },
  ],
};

let mode: Mode;
let updates: { branch: string; path: string; value: TinaDocument }[];
let releaseUpdate: (() => void) | undefined;
let holdUpdates: boolean;
let searchEnabled: boolean;
let failGet: boolean;
let failAfterSave: boolean;
let heldDefault: Promise<void> | undefined;

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
                    list: async () => BRANCHES,
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

const renderAdmin = (projectName?: string) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin(),
          auditPlugin,
          screenPlugin,
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
  failAfterSave = false;
  heldDefault = undefined;
  window.location.hash = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
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

  it('renders no Search control without a search provider', async () => {
    renderAdmin();
    await screen.findByRole('banner', { name: 'Top bar' });
    expect(screen.queryByRole('button', { name: /Search/ })).toBeNull();
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
    await user.click(screen.getByRole('button', { name: 'Posts' }));
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

  it('lists one line per branch with protected branches in one Protected group', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Switch branch' });
    const protectedGroup = within(dialog).getByRole('region', {
      name: 'Protected',
    });
    expect(within(protectedGroup).getAllByRole('listitem')).toHaveLength(1);
    expect(within(protectedGroup).getByText('main')).toBeVisible();
    expect(within(dialog).getByText('feature/news')).toBeVisible();
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

    await user.click(await screen.findByRole('button', { name: /^Branch:/ }));
    await user.click(await screen.findByText('feature/news'));

    expect(
      await screen.findByRole('button', { name: /breaking\.mdx/ })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /hello\.mdx/ })).toBeNull();
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
    const dialog = await screen.findByRole('dialog', { name: 'Switch branch' });
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
    DATA['feature/news'].push({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    renderAdmin();
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Hello');
    DATA['feature/news'].pop();
  });
});

describe('save state', () => {
  const openHello = async () => {
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
      expect(within(statusBar()).getByText('Saved')).toBeVisible()
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

  it('says the save failed when validation fails, with the inline alert kept', async () => {
    const { user, input } = await openHello();
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save/ }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Save failed')).toBeVisible()
    );
    expect(updates).toHaveLength(0);
    expect(
      (await screen.findAllByRole('alert')).some((alert) =>
        /validation errors/.test(alert.textContent ?? '')
      )
    ).toBe(true);
  });
});

describe('toasts', () => {
  it('shows a failed save at bottom right and keeps the inline alert', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    renderAdmin();
    const input = await screen.findByLabelText(/^Title\b/);
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save/ }));

    const toast = await waitFor(() => {
      const found = document.querySelector('[data-slot=toast]');
      expect(found).not.toBeNull();
      return found;
    });
    expect(toast).toHaveTextContent('Save failed');
    const toaster = toast?.closest('[data-sonner-toaster]');
    expect(toaster).toHaveAttribute('data-x-position', 'right');
    expect(toaster).toHaveAttribute('data-y-position', 'bottom');
    const form = screen.getByRole('complementary', { name: 'Document form' });
    expect(within(form).getAllByRole('alert').length).toBeGreaterThan(0);
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

describe('panel headers', () => {
  it('gives the form column Back to its collection, and the missing views a title and Close', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    const user = userEvent.setup();
    const view = renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(
      within(
        screen.getByRole('complementary', { name: 'Document form' })
      ).getByRole('button', { name: /Posts/ })
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
