import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from '@tinacms/ui/components/sonner';
import { TooltipProvider } from '@tinacms/ui/components/tooltip';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import type { AuthSlice, UserId } from '../../core/auth/contract';
import {
  ContentError,
  type ContentProvider,
  type DocumentSummary,
} from '../../core/content/contract';
import { queryDocuments } from '../../core/content/list-query';
import { nameOf } from '../../core/content/names';
import type { TinaStoreState } from '../../core/plugin';
import type { AllowedActions, CollectionSchema } from '../../core/schema/types';
import { type TinaRuntime, TinaRuntimeContext } from '../../editor/context';
import { readDraft, writeDraft } from '../../form/drafts';
import { toFormId, useFormStore } from '../../form/form-store';
import { guardConsole } from '../../test/console-guard';
import { CollectionTable } from './collection-table';
import { NEW_DOCUMENT_PBI } from './table-model';

const ROOT = 'content/posts';

interface World {
  summaries: DocumentSummary[];
  emptyFolders: string[];
  /** Thrown by the next folder rename, folder delete, document delete or new folder. */
  fails: ContentError | null;
}

let world: World;

const doc = (path: string, title?: string): DocumentSummary => ({
  path: `${ROOT}/${path}`,
  ...(title ? { title } : {}),
});

const folderOf = (path: string) => path.slice(ROOT.length + 1);

const provider = (): ContentProvider => ({
  list: async (_collection, query) =>
    queryDocuments({
      summaries: world.summaries,
      root: ROOT,
      emptyFolders: world.emptyFolders,
      query,
    }),
  get: async () => null,
  update: async (_collection, path, document) => ({ path, document }),
  create: async (_collection, path, document) => ({ path, document }),
  rename: async (_collection, from, to) => ({
    entry: { path: to },
    referrers: [],
  }),
  delete: async (_collection, path) => {
    if (world.fails) throw world.fails;
    world.summaries = world.summaries.filter((entry) => entry.path !== path);
  },
  referrers: async () => [],
  createFolder: async (_collection, folder) => {
    if (world.fails) throw world.fails;
    world.emptyFolders.push(folder);
    return { path: folder, name: nameOf(folder), documentCount: 0 };
  },
  renameFolder: async (_collection, from, to) => {
    if (world.fails) throw world.fails;
    const moved = world.summaries
      .filter((entry) => folderOf(entry.path).startsWith(`${from}/`))
      .map((entry) => ({
        from: entry.path,
        to: `${ROOT}/${to}${folderOf(entry.path).slice(from.length)}`,
      }));
    world.summaries = world.summaries.map((entry) => ({
      ...entry,
      path: moved.find((pair) => pair.from === entry.path)?.to ?? entry.path,
    }));
    return {
      folder: { path: to, name: nameOf(to), documentCount: moved.length },
      moved,
      referrers: [],
    };
  },
  deleteFolder: async (_collection, folder) => {
    if (world.fails) throw world.fails;
    const deleted = world.summaries
      .filter((entry) => folderOf(entry.path).startsWith(`${folder}/`))
      .map((entry) => entry.path);
    world.summaries = world.summaries.filter(
      (entry) => !deleted.includes(entry.path)
    );
    return { deleted };
  },
});

const signedIn = (roles: string[]): AuthSlice =>
  ({
    status: 'signed-in',
    user: { id: 'u1' as UserId },
    roles,
    getToken: async () => undefined,
    login: async () => undefined,
    logout: async () => undefined,
    LoginScreen: () => null,
  }) as unknown as AuthSlice;

const setWidth = (width: number) =>
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width: (\d+)px/.exec(query);
    return {
      matches: min ? width >= Number(min[1]) : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

function Where() {
  return <output aria-label='location'>{useLocation().pathname}</output>;
}

interface RenderOptions {
  folder?: string;
  allowedActions?: AllowedActions;
  auth?: AuthSlice;
}

const renderTable = ({
  folder = '',
  allowedActions,
  auth,
}: RenderOptions = {}) => {
  const collection: CollectionSchema = {
    name: 'post',
    label: 'Posts',
    path: ROOT,
    format: 'md',
    fields: [{ name: 'title', label: 'Title', type: 'string' }],
    ...(allowedActions ? { allowedActions } : {}),
  };
  const store = createStore<TinaStoreState>()(() => ({
    content: provider() as unknown as Record<string, unknown>,
    ...(auth ? { auth: auth as unknown as Record<string, unknown> } : {}),
  }));
  const runtime = {
    store,
    schema: { collections: [collection] },
    serverHooks: new Set<string>(),
    rpcUrl: '/api/tina',
  } as unknown as TinaRuntime;
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <TinaRuntimeContext value={runtime}>
        <TooltipProvider>
          <MemoryRouter>
            <CollectionTable collection='post' folder={folder} />
            <Where />
          </MemoryRouter>
          <Toaster />
        </TooltipProvider>
      </TinaRuntimeContext>
    </QueryClientProvider>
  );
};

type User = ReturnType<typeof userEvent.setup>;

const openMenu = async (user: User, name: string) => {
  await user.click(
    await screen.findByRole('button', { name: `Actions for ${name}` })
  );
};

const pick = async (user: User, item: string) =>
  user.click(await screen.findByRole('menuitem', { name: item }));

const menuItems = () =>
  screen.getAllByRole('menuitem').map((item) => item.textContent);

const openNewMenu = async (user: User) => {
  await screen.findByRole('button', { name: 'Beta' });
  await user.click(screen.getByRole('button', { name: 'New' }));
  await screen.findAllByRole('menuitem');
};

const consoleGuard = guardConsole();

const PATHS = {
  intro: `${ROOT}/guides/intro.md`,
  more: `${ROOT}/guides/more.md`,
  copy: `${ROOT}/guides/copy.md`,
};

beforeEach(() => {
  setWidth(1400);
  world = {
    summaries: [
      doc('alpha.md', 'Alpha'),
      doc('beta.md', 'Beta'),
      doc('gamma.md', 'Gamma'),
      doc('guides/intro.md', 'Intro'),
      doc('guides/more.md', 'More'),
      doc('other/one.md', 'One'),
    ],
    emptyFolders: [],
    fails: null,
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  useFormStore.setState({ forms: {} });
});

describe('folder rename and new folder', () => {
  it('keeps the dialog open under each refusal, then renames the row', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'guides');
    await pick(user, 'Rename');
    const dialog = await screen.findByRole('dialog', { name: /Rename/ });
    const box = within(dialog).getByRole('textbox', { name: 'Folder name' });
    expect(box).toHaveValue('guides');

    for (const [fails, message] of [
      [
        new ContentError('name-taken'),
        'A document or folder with that name already exists.',
      ],
      [new ContentError('folder-not-owned'), 'This folder holds files'],
    ] as const) {
      world.fails = fails;
      await user.clear(box);
      await user.type(box, 'renamed');
      await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        message
      );
      expect(screen.getByRole('dialog')).toBeVisible();
    }

    await user.clear(box);
    await user.type(box, '.hidden');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'That name is not allowed.'
    );
    expect(
      screen.getByRole('button', { name: 'guides/', hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'renamed/', hidden: true })
    ).toBeNull();

    world.fails = null;
    await user.clear(box);
    await user.type(box, 'renamed');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(
      await screen.findByRole('button', { name: 'renamed/' })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'guides/' })).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the New folder dialog open when the name is taken or invalid', async () => {
    const user = userEvent.setup();
    renderTable();
    await openNewMenu(user);
    await pick(user, 'Folder');
    const dialog = await screen.findByRole('dialog', { name: 'New folder' });
    const box = within(dialog).getByRole('textbox', { name: 'Folder name' });

    world.fails = new ContentError('name-taken');
    await user.type(box, 'guides');
    await user.click(
      within(dialog).getByRole('button', { name: 'Create folder' })
    );
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'A document or folder with that name already exists.'
    );

    await user.clear(box);
    await user.type(box, 'a/b');
    await user.click(
      within(dialog).getByRole('button', { name: 'Create folder' })
    );
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'That name is not allowed.'
    );
    expect(world.emptyFolders).toEqual([]);
    expect(screen.getByRole('dialog')).toBeVisible();
  });
});

describe('folder delete', () => {
  it('counts the documents and unsaved edits, then removes the row and discards every draft', async () => {
    const user = userEvent.setup();
    writeDraft(toFormId(PATHS.intro), {
      values: { title: 'Edited' },
      baseline: { title: 'Intro' },
    });
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(PATHS.copy), { title: 'Copy' });
    renderTable();
    await openMenu(user, 'guides');
    await pick(user, 'Delete');
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete “guides/”?',
    });
    expect(dialog).toHaveTextContent('the folder and 2 documents in it');
    expect(dialog).toHaveTextContent(
      'Your unsaved edits to 2 documents in it go too.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'guides/' })).toBeNull()
    );
    expect(await screen.findByText('Deleted guides')).toBeVisible();
    expect(readDraft(toFormId(PATHS.intro))).toBeUndefined();
    expect(readDraft(toFormId(PATHS.copy))).toBeUndefined();
  });

  it('says nothing about edits when no document inside has a draft', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'guides');
    await pick(user, 'Delete');
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('the folder and 2 documents in it');
    expect(dialog).not.toHaveTextContent('unsaved edits');
  });

  it('keeps every row and draft and shows the message when the delete fails', async () => {
    const user = userEvent.setup();
    writeDraft(toFormId(PATHS.intro), {
      values: { title: 'Edited' },
      baseline: { title: 'Intro' },
    });
    renderTable();
    world.fails = new ContentError('network');
    await openMenu(user, 'guides');
    await pick(user, 'Delete');
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      new ContentError('network').message
    );
    expect(
      screen.getByRole('button', { name: 'guides/', hidden: true })
    ).toBeInTheDocument();
    expect(world.summaries).toHaveLength(6);
    expect(readDraft(toFormId(PATHS.intro))).toBeDefined();
  });
});

describe('focus after a dialog closes', () => {
  it('moves to the next row after a Delete', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'Alpha');
    await pick(user, 'Delete');
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      })
    );
    await waitFor(() => expect(screen.queryByText('Alpha')).toBeNull());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Beta' })).toHaveFocus()
    );
  });

  it('moves to the table heading after deleting the last row', async () => {
    const user = userEvent.setup();
    world.summaries = [doc('only.md', 'Only')];
    renderTable();
    await openMenu(user, 'Only');
    await pick(user, 'Delete');
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      })
    );
    await waitFor(() => expect(screen.queryByText('Only')).toBeNull());
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Posts' })).toHaveFocus()
    );
  });

  it('returns to the row menu after a failed Rename is cancelled', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'Beta');
    await pick(user, 'Rename');
    const dialog = await screen.findByRole('dialog');
    const box = within(dialog).getByRole('textbox', { name: 'File name' });
    await user.clear(box);
    await user.type(box, '.hidden');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    await within(dialog).findByRole('alert');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Actions for Beta' })
      ).toHaveFocus()
    );
  });

  it('returns to the row menu after a failed Delete is cancelled', async () => {
    const user = userEvent.setup();
    renderTable();
    world.fails = new ContentError('network');
    await openMenu(user, 'Beta');
    await pick(user, 'Delete');
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await within(dialog).findByRole('alert');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Actions for Beta' })
      ).toHaveFocus()
    );
  });
});

describe('the keyboard', () => {
  it('reaches a row menu with Tab and runs an item with Enter', async () => {
    const user = userEvent.setup();
    renderTable();
    const trigger = await screen.findByRole('button', {
      name: 'Actions for Beta',
    });
    for (let presses = 0; presses < 40; presses += 1) {
      if (document.activeElement === trigger) break;
      await user.tab();
    }
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(
      await screen.findByRole('menuitem', { name: 'Rename' })
    ).toBeVisible();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{Enter}');
    expect(await screen.findByRole('dialog', { name: /Rename/ })).toBeVisible();
  });

  it('shows New > Document disabled, never activates it and names the PBI in its tooltip', async () => {
    const user = userEvent.setup();
    renderTable();
    await openNewMenu(user);
    const item = screen.getByRole('menuitem', { name: 'Document' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    await user.click(item);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByLabelText('location')).toHaveTextContent('/');
    await user.hover(item);
    expect(
      await screen.findByText(
        new RegExp(`New document is not available yet.*${NEW_DOCUMENT_PBI}`)
      )
    ).toBeVisible();
  });
});

describe('allowedActions in the menus', () => {
  it('drops Delete from document and folder menus and keeps Rename', async () => {
    const user = userEvent.setup();
    renderTable({ allowedActions: { canDelete: false } });
    await openMenu(user, 'Beta');
    expect(menuItems()).toEqual(['Rename', 'Duplicate']);
    await user.keyboard('{Escape}');
    await openMenu(user, 'guides');
    expect(menuItems()).toEqual(['Rename']);
  });

  it('drops Duplicate only', async () => {
    const user = userEvent.setup();
    renderTable({ allowedActions: { canDuplicate: false } });
    await openMenu(user, 'Beta');
    expect(menuItems()).toEqual(['Rename', 'Delete']);
  });

  it('drops New > Folder when canCreateFolder is off', async () => {
    const user = userEvent.setup();
    renderTable({ allowedActions: { canCreateFolder: false } });
    await openNewMenu(user);
    expect(menuItems()).toEqual(['Document']);
  });

  it('drops New > Document when canCreate is off', async () => {
    const user = userEvent.setup();
    renderTable({ allowedActions: { canCreate: false } });
    await openNewMenu(user);
    expect(menuItems()).toEqual(['Folder']);
  });

  it('hides New > Folder inside a folder but not at the top level when canCreateNestedFolder is off', async () => {
    const user = userEvent.setup();
    const { unmount } = renderTable({
      allowedActions: { canCreateNestedFolder: false },
    });
    await openNewMenu(user);
    expect(menuItems()).toEqual(['Document', 'Folder']);
    unmount();

    renderTable({
      folder: 'guides',
      allowedActions: { canCreateNestedFolder: false },
    });
    await screen.findByRole('button', { name: 'Intro' });
    await user.click(screen.getByRole('button', { name: 'New' }));
    await screen.findByRole('menuitem', { name: 'Document' });
    expect(menuItems()).toEqual(['Document']);
  });
});

describe('roles in the menus', () => {
  it('gives an editor every action', async () => {
    const user = userEvent.setup();
    renderTable({ auth: signedIn(['editor']) });
    await openMenu(user, 'Beta');
    expect(menuItems()).toEqual(['Rename', 'Duplicate', 'Delete']);
  });

  it('gives a role the default map does not know no row actions and no New > Folder', async () => {
    const user = userEvent.setup();
    renderTable({ auth: signedIn(['guest']) });
    await screen.findByRole('button', { name: 'Beta' });
    expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'New' })).toBeNull();
  });
});
