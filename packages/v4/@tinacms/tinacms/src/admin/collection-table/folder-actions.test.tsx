import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from '@tinacms/ui/components/sonner';
import { TooltipProvider } from '@tinacms/ui/components/tooltip';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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
  /** Thrown by the next document rename only. */
  renameFails: ContentError | null;
  /** How many times the server was asked to rename a document or folder. */
  renameCalls: number;
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
  rename: async (_collection, from, to) => {
    world.renameCalls += 1;
    if (world.renameFails) throw world.renameFails;
    world.summaries = world.summaries.map((entry) =>
      entry.path === from ? { ...entry, path: to } : entry
    );
    return { entry: { path: to }, referrers: [] };
  },
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
    world.renameCalls += 1;
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
    fields: [
      { name: 'title', label: 'Title', type: 'string' },
      {
        name: 'related',
        label: 'Related',
        type: 'reference',
        collections: ['post'],
      },
    ],
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

const EDITOR_PERMISSIONS = [
  'content:save',
  'content:create',
  'content:rename',
  'content:delete',
];

// A test with no stubbed `fetch` sends this request to a real server on localhost:3000.
const answerPermissions = (permissions: string[]) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(permissions))
  );

beforeEach(() => {
  setWidth(1400);
  answerPermissions(EDITOR_PERMISSIONS);
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
    renameFails: null,
    renameCalls: 0,
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

  it('names the PBI in the New > Document tooltip and never activates the item', async () => {
    const user = userEvent.setup();
    renderTable();
    await openNewMenu(user);
    const item = screen.getByRole('menuitem', { name: 'Document' });
    await user.hover(item);
    await waitFor(() =>
      expect(
        screen
          .getAllByText(
            new RegExp(`New document is not available yet.*${NEW_DOCUMENT_PBI}`)
          )
          .some((note) => !note.hidden)
      ).toBe(true)
    );
    await user.click(item);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByLabelText('location')).toHaveTextContent('/');
  });

  it('lets a keyboard user reach the disabled New > Document item, hear why and not activate it', async () => {
    const user = userEvent.setup();
    renderTable();
    await openNewMenu(user);
    const item = screen.getByRole('menuitem', { name: 'Document' });
    for (let presses = 0; presses < 4; presses += 1) {
      if (document.activeElement === item) break;
      await user.keyboard('{ArrowDown}');
    }
    expect(item).toHaveFocus();
    expect(item).toHaveAccessibleDescription(
      new RegExp(`New document is not available yet.*${NEW_DOCUMENT_PBI}`)
    );
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('dialog')).toBeNull();
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

describe('a failed permissions answer', () => {
  it('says so with a Retry, shows no action, and shows the actions once Retry succeeds', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { error: { code: 'boom', message: 'Server error' } },
          { status: 500 }
        )
      )
    );
    renderTable({ auth: signedIn(['editor']) });
    expect(
      await screen.findByText("Couldn't check your permissions.")
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull();
    answerPermissions(EDITOR_PERMISSIONS);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(
        screen.queryByText("Couldn't check your permissions.")
      ).not.toBeInTheDocument()
    );
    await openMenu(user, 'Beta');
    expect(menuItems()).toEqual(['Rename', 'Duplicate', 'Delete']);
  });

  it('shows no notice and no action while the answer is pending', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {}))
    );
    renderTable({ auth: signedIn(['editor']) });
    await screen.findByRole('button', { name: 'Beta' });
    expect(screen.queryByText("Couldn't check your permissions.")).toBeNull();
    expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull();
  });
});

describe('roles in the menus', () => {
  it('shows Rename, Duplicate and Delete for content:save, create, rename and delete', async () => {
    const user = userEvent.setup();
    renderTable({ auth: signedIn(['editor']) });
    await openMenu(user, 'Beta');
    expect(menuItems()).toEqual(['Rename', 'Duplicate', 'Delete']);
  });

  it('shows no row action and no New for an empty permission list', async () => {
    const user = userEvent.setup();
    answerPermissions([]);
    renderTable({ auth: signedIn(['guest']) });
    await screen.findByRole('button', { name: 'Beta' });
    expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'New' })).toBeNull();
  });
});

const renameDialogFor = async (user: User, row: string) => {
  await openMenu(user, row);
  await pick(user, 'Rename');
  return screen.findByRole('dialog', { name: /Rename/ });
};

const submitRename = async (
  user: User,
  dialog: HTMLElement,
  boxName: string,
  name: string
) => {
  const box = within(dialog).getByRole('textbox', { name: boxName });
  await user.clear(box);
  if (name !== '') await user.type(box, name);
  await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
};

describe('rename refusals from unsaved edits', () => {
  it('keeps the Rename dialog open and asks the server nothing when an unsaved copy holds the target', async () => {
    const user = userEvent.setup();
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(`${ROOT}/taken.md`), { title: 'Copy' });
    renderTable();
    const dialog = await renameDialogFor(user, 'Beta');
    await submitRename(user, dialog, 'File name', 'taken');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      new ContentError('name-taken').message
    );
    expect(world.renameCalls).toBe(0);
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('keeps Rename folder open and asks the server nothing when an unsaved copy lies under the target', async () => {
    const user = userEvent.setup();
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(`${ROOT}/target/new.md`), {
        title: 'Copy',
      });
    renderTable();
    const dialog = await renameDialogFor(user, 'guides');
    await submitRename(user, dialog, 'Folder name', 'target');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      new ContentError('name-taken').message
    );
    expect(world.renameCalls).toBe(0);
  });

  it('lists the documents whose unsaved edits link to the renamed one, each as a link, and renames nothing', async () => {
    const user = userEvent.setup();
    writeDraft(toFormId(`${ROOT}/other/one.md`), {
      values: { title: 'Edited one', related: `${ROOT}/alpha.md` },
      baseline: { title: 'One' },
    });
    renderTable();
    const dialog = await renameDialogFor(user, 'Alpha');
    await submitRename(user, dialog, 'File name', 'alpha-2');
    const alert = await within(dialog).findByRole('alert');
    expect(alert).toHaveTextContent(
      'Save or discard your unsaved edits to these documents first:'
    );
    expect(
      within(alert).getByRole('link', { name: 'Edited one' })
    ).toHaveAttribute(
      'href',
      `#/collections/post/${encodeURIComponent(`${ROOT}/other/one.md`)}`
    );
    expect(world.renameCalls).toBe(0);
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('shows the first ten blocking documents and then the count of the rest', async () => {
    const user = userEvent.setup();
    world.summaries = [
      doc('alpha.md', 'Alpha'),
      ...Array.from({ length: 12 }, (_, index) =>
        doc(`refs/r${index}.md`, `R${index}`)
      ),
    ];
    for (let index = 0; index < 12; index += 1) {
      writeDraft(toFormId(`${ROOT}/refs/r${index}.md`), {
        values: { title: `Draft ${index}`, related: `${ROOT}/alpha.md` },
        baseline: { title: `R${index}` },
      });
    }
    renderTable();
    const dialog = await renameDialogFor(user, 'Alpha');
    await submitRename(user, dialog, 'File name', 'alpha-2');
    const alert = await within(dialog).findByRole('alert');
    expect(within(alert).getAllByRole('link')).toHaveLength(10);
    expect(alert).toHaveTextContent('and 2 more');
  });

  it('shows a forbidden refusal in the Rename dialog', async () => {
    const user = userEvent.setup();
    world.renameFails = new ContentError('forbidden');
    renderTable();
    const dialog = await renameDialogFor(user, 'Beta');
    await submitRename(user, dialog, 'File name', 'beta-2');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      new ContentError('forbidden').message
    );
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('tells an empty name what to do', async () => {
    const user = userEvent.setup();
    renderTable();
    const dialog = await renameDialogFor(user, 'Beta');
    await submitRename(user, dialog, 'File name', '');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Enter a name.'
    );
  });
});

describe('focus after a successful rename', () => {
  it('moves to the renamed document row, which keeps its place', async () => {
    const user = userEvent.setup();
    renderTable();
    const dialog = await renameDialogFor(user, 'Beta');
    await submitRename(user, dialog, 'File name', 'beta-2');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Actions for Beta' })
      ).toHaveFocus()
    );
  });

  it('moves to the renamed row where the sort puts it', async () => {
    const user = userEvent.setup();
    world.summaries = [doc('alpha.md'), doc('mid.md'), doc('zulu.md')];
    renderTable();
    const dialog = await renameDialogFor(user, 'zulu.md');
    await submitRename(user, dialog, 'File name', 'aaa');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Actions for aaa.md' })
      ).toHaveFocus()
    );
  });

  it('moves to the renamed folder row', async () => {
    const user = userEvent.setup();
    renderTable();
    const dialog = await renameDialogFor(user, 'guides');
    await submitRename(user, dialog, 'Folder name', 'handbook');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Actions for handbook' })
      ).toHaveFocus()
    );
  });

  it('falls back to the heading when the filter hides the renamed row', async () => {
    const user = userEvent.setup();
    world.summaries = [doc('gam.md'), doc('other.md')];
    renderTable();
    await user.type(
      await screen.findByRole('searchbox', {
        name: 'Filter by title or filename',
      }),
      'gam'
    );
    await waitFor(() => expect(screen.queryByText('other.md')).toBeNull());
    const dialog = await renameDialogFor(user, 'gam.md');
    await submitRename(user, dialog, 'File name', 'xyz');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Posts' })).toHaveFocus()
    );
  });
});

// A toast still on screen at the end of a file leaves a removal timer that fires after the test environment is gone.
afterAll(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 300));
});
