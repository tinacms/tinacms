import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from '@tinacms/ui/components/sonner';
import { TooltipProvider } from '@tinacms/ui/components/tooltip';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import {
  ContentError,
  type ContentProvider,
  type DocumentReferrer,
  type DocumentSummary,
} from '../../core/content/contract';
import { queryDocuments } from '../../core/content/list-query';
import { nameOf } from '../../core/content/names';
import type { TinaStoreState } from '../../core/plugin';
import type { CollectionSchema } from '../../core/schema/types';
import { type TinaRuntime, TinaRuntimeContext } from '../../editor/context';
import { useFormStore } from '../../form/form-store';
import { guardConsole } from '../../test/console-guard';
import { CollectionTable } from './collection-table';

const ROOT = 'content/posts';
const POST: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  path: ROOT,
  format: 'md',
  fields: [{ name: 'title', label: 'Title', type: 'string' }],
};

interface World {
  summaries: DocumentSummary[];
  emptyFolders: string[];
  referrers: DocumentReferrer[] | 'fail';
  failList: boolean;
  slowRefetch: boolean;
  listCalls: number;
  renameFails: ContentError | null;
  operations: boolean;
}

let world: World;

const doc = (
  path: string,
  extra: Partial<DocumentSummary> = {}
): DocumentSummary => ({ path: `${ROOT}/${path}`, ...extra });

const provider = (): ContentProvider => {
  const base: ContentProvider = {
    list: async (_collection, query) => {
      if (world.failList) throw new ContentError('network');
      world.listCalls += 1;
      if (world.slowRefetch && world.listCalls > 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const folder = query?.folder ?? '';
      const known = [
        ...world.emptyFolders,
        ...world.summaries.map((summary) =>
          summary.path
            .slice(ROOT.length + 1)
            .split('/')
            .slice(0, -1)
            .join('/')
        ),
      ];
      if (
        folder !== '' &&
        !known.some((path) => `${path}/`.startsWith(`${folder}/`))
      ) {
        throw new ContentError('not-found');
      }
      return queryDocuments({
        summaries: world.summaries,
        root: ROOT,
        emptyFolders: world.emptyFolders,
        query,
      });
    },
    get: async (_collection, path) =>
      world.summaries.some((summary) => summary.path === path)
        ? { path, document: { title: nameOf(path) } }
        : null,
    update: async (_collection, path, document) => ({ path, document }),
  };
  if (!world.operations) return base;
  return {
    ...base,
    create: async (_collection, path, document) => ({ path, document }),
    rename: async (_collection, from, to) => {
      if (world.renameFails) throw world.renameFails;
      world.summaries = world.summaries.map((summary) =>
        summary.path === from ? { ...summary, path: to } : summary
      );
      return { entry: { path: to }, referrers: [] };
    },
    delete: async (_collection, path) => {
      world.summaries = world.summaries.filter(
        (summary) => summary.path !== path
      );
    },
    referrers: async () => {
      if (world.referrers === 'fail') throw new ContentError('network');
      return world.referrers;
    },
    createFolder: async (_collection, folder) => {
      world.emptyFolders.push(folder);
      return { path: folder, name: nameOf(folder), documentCount: 0 };
    },
  };
};

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

function Where() {
  const location = useLocation();
  return <output aria-label='location'>{location.pathname}</output>;
}

const renderTable = (folder = '', children?: ReactNode) => {
  const store = createStore<TinaStoreState>()(() => ({
    content: provider() as unknown as Record<string, unknown>,
  }));
  const runtime = {
    store,
    schema: { collections: [POST] },
    serverHooks: new Set<string>(),
    rpcUrl: '/api/tina',
  } as unknown as TinaRuntime;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TinaRuntimeContext value={runtime}>
        <TooltipProvider>
          <MemoryRouter>
            <CollectionTable collection='post' folder={folder} />
            <Where />
            {children}
          </MemoryRouter>
          <Toaster />
        </TooltipProvider>
      </TinaRuntimeContext>
    </QueryClientProvider>
  );
};

const consoleGuard = guardConsole();

const rowNamed = (name: string | RegExp) =>
  screen.findByRole('button', { name });

const titles = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('button')[0]?.textContent);

const openMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string
) => {
  await user.click(
    await screen.findByRole('button', { name: `Actions for ${name}` })
  );
};

beforeEach(() => {
  setWidth(1400);
  world = {
    summaries: [
      doc('alpha.md', {
        title: 'Alpha',
        updatedAt: '2026-01-01T00:00:00Z',
        lastAuthor: { name: 'Ada' },
      }),
      doc('beta.md', { title: 'Beta', updatedAt: '2026-03-01T00:00:00Z' }),
      doc('gamma.md', { updatedAt: '2026-02-01T00:00:00Z' }),
      doc('guides/intro.md', { title: 'Intro' }),
      doc('guides/more.md', { title: 'More' }),
    ],
    emptyFolders: [],
    slowRefetch: false,
    listCalls: 0,
    referrers: [],
    failList: false,
    renameFails: null,
    operations: true,
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  useFormStore.setState({ forms: {} });
});

describe('CollectionTable', () => {
  it('lists folders first with counts, then documents newest first', async () => {
    renderTable();
    expect(await rowNamed('guides/')).toBeInTheDocument();
    expect(screen.getByText('2 documents')).toBeInTheDocument();
    expect(titles()).toEqual(['guides/', 'Beta', 'gamma.md', 'Alpha']);
    expect(screen.getByText(/by Ada/)).toBeInTheDocument();
    expect(screen.queryByText(/by undefined/)).not.toBeInTheDocument();
  });

  it('opens a document and a folder from their rows', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(await rowNamed('Beta'));
    expect(screen.getByLabelText('location')).toHaveTextContent(
      '/collections/post/content%2Fposts%2Fbeta.md'
    );
    await user.click(await rowNamed('guides/'));
    expect(screen.getByLabelText('location')).toHaveTextContent(
      '/collections/post/folder/guides'
    );
  });

  it('sorts by a head, reverses on a second press and sets aria-sort', async () => {
    const user = userEvent.setup();
    renderTable();
    await rowNamed('Beta');
    const head = screen.getByRole('columnheader', { name: /Title/ });
    expect(head).toHaveAttribute('aria-sort', 'none');
    await user.click(within(head).getByRole('button'));
    await waitFor(() => expect(head).toHaveAttribute('aria-sort', 'ascending'));
    await waitFor(() =>
      expect(titles()).toEqual(['guides/', 'Alpha', 'Beta', 'gamma.md'])
    );
    await user.click(within(head).getByRole('button'));
    await waitFor(() =>
      expect(titles()).toEqual(['guides/', 'gamma.md', 'Beta', 'Alpha'])
    );
    expect(head).toHaveAttribute('aria-sort', 'descending');
  });

  it('shows only the result of the last filter text and the no-match sentence', async () => {
    const user = userEvent.setup();
    renderTable();
    await rowNamed('Beta');
    const box = screen.getByRole('searchbox', {
      name: 'Filter by title or filename',
    });
    await user.type(box, 'ab');
    await user.type(box, 'c');
    await waitFor(() => expect(screen.queryByText('Beta')).toBeNull());
    await user.clear(box);
    await user.type(box, 'zzz');
    expect(
      await screen.findByText('No documents match “zzz”.')
    ).toBeInTheDocument();
  });

  it('switches the status view and lists unsaved copies at the top of page one', async () => {
    const user = userEvent.setup();
    useFormStore
      .getState()
      .storeNewDocumentDraft(`${ROOT}/draft.md` as never, { title: 'Draft' });
    renderTable();
    await rowNamed('Beta');
    expect(titles()[0]).toBe('draft.md');
    expect(screen.getByText('Unsaved', { selector: 'span' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Saved' }));
    expect(screen.queryByText('draft.md')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Unsaved' }));
    expect(titles()).toEqual(['draft.md']);
  });

  it('pages with Previous and Next and reads Page N of M', async () => {
    const user = userEvent.setup();
    world.summaries = Array.from({ length: 120 }, (_, index) =>
      doc(`p${String(index).padStart(3, '0')}.md`)
    );
    renderTable();
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('stays on page 1 after the filter is typed and cleared from page 2', async () => {
    const user = userEvent.setup();
    world.summaries = Array.from({ length: 120 }, (_, index) =>
      doc(`p${String(index).padStart(3, '0')}.md`)
    );
    renderTable();
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    const box = screen.getByRole('searchbox', {
      name: 'Filter by title or filename',
    });
    await user.type(box, 'p01');
    await waitFor(() => expect(screen.queryByText('Page 2 of 3')).toBeNull());
    await screen.findByRole('button', { name: 'p010.md' });
    await user.clear(box);
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('returns to page 1 when Sort by Status is chosen and says it sorts the loaded page', async () => {
    const user = userEvent.setup();
    setWidth(600);
    world.summaries = Array.from({ length: 120 }, (_, index) =>
      doc(`p${String(index).padStart(3, '0')}.md`)
    );
    renderTable();
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await user.click(
      await screen.findByRole('option', {
        name: /Status, unsaved first.*this page/,
      })
    );
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('shows no count while the page loads, then the count', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const content = provider();
    const list = content.list;
    world.summaries = [doc('beta.md', { title: 'Beta' })];
    const store = createStore<TinaStoreState>()(() => ({
      content: {
        ...content,
        list: async (...args: Parameters<typeof list>) => {
          await gate;
          return list(...args);
        },
      } as unknown as Record<string, unknown>,
    }));
    const runtime = {
      store,
      schema: { collections: [POST] },
      serverHooks: new Set<string>(),
      rpcUrl: '/api/tina',
    } as unknown as TinaRuntime;
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TinaRuntimeContext value={runtime}>
          <TooltipProvider>
            <MemoryRouter>
              <CollectionTable collection='post' folder='' />
            </MemoryRouter>
          </TooltipProvider>
        </TinaRuntimeContext>
      </QueryClientProvider>
    );
    await screen.findByRole('searchbox', {
      name: 'Filter by title or filename',
    });
    expect(screen.queryByText('0 documents')).toBeNull();
    release();
    expect(await screen.findByText('1 document')).toBeInTheDocument();
  });

  it('hides Last edited and sorts by title when no row has an edit time', async () => {
    world.summaries = [
      doc('b.md', { title: 'Bee' }),
      doc('a.md', { title: 'Ant' }),
    ];
    renderTable();
    await rowNamed('Ant');
    expect(titles()).toEqual(['Ant', 'Bee']);
    expect(
      screen.queryByRole('columnheader', { name: /Last edited/ })
    ).toBeNull();
    expect(screen.getByRole('columnheader', { name: /Title/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
  });

  it('keeps the same rows on screen while the default sort switches to title', async () => {
    world.summaries = [
      doc('b.md', { title: 'Bee' }),
      doc('a.md', { title: 'Ant' }),
    ];
    world.slowRefetch = true;
    renderTable();
    const first = await rowNamed('Ant');
    await waitFor(() =>
      expect(
        screen.queryByRole('columnheader', { name: /Last edited/ })
      ).toBeNull()
    );
    expect(screen.getByRole('button', { name: 'Ant' })).toBe(first);
  });

  it('keeps the title column from widening the table', async () => {
    renderTable();
    await rowNamed('Beta');
    expect(screen.getByRole('columnheader', { name: /Title/ })).toHaveClass(
      'max-w-0'
    );
  });

  it('shows the empty sentence and an error with Retry', async () => {
    world.summaries = [];
    const { unmount } = renderTable();
    expect(
      await screen.findByText('No documents in Posts yet.')
    ).toBeInTheDocument();
    unmount();

    world.summaries = [doc('beta.md', { title: 'Beta' })];
    world.failList = true;
    const user = userEvent.setup();
    renderTable();
    expect(
      await screen.findByText(new ContentError('network').message)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: 'Filter by title or filename' })
    ).toBeInTheDocument();
    world.failList = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await rowNamed('Beta')).toBeInTheDocument();
  });

  it('says Folder not found for a missing folder', async () => {
    renderTable('nope');
    expect(await screen.findByText('Folder not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Posts' })).toHaveAttribute(
      'href',
      '#/collections/post'
    );
  });
});

describe('row actions', () => {
  it('renames with the extension fixed and keeps the dialog open on a refusal', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'Beta');
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    const dialog = await screen.findByRole('dialog', { name: /Rename/ });
    expect(within(dialog).getByText('.md')).toBeInTheDocument();
    const box = within(dialog).getByRole('textbox', { name: 'File name' });
    expect(box).toHaveValue('beta');

    world.renameFails = new ContentError('name-taken');
    await user.clear(box);
    await user.type(box, 'alpha');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'A document or folder with that name already exists.'
    );

    world.renameFails = null;
    await user.clear(box);
    await user.type(box, 'omega');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(world.summaries.some((s) => s.path === `${ROOT}/omega.md`)).toBe(
      true
    );
  });

  it('refuses an invalid name under the box', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'Beta');
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    const dialog = await screen.findByRole('dialog');
    const box = within(dialog).getByRole('textbox', { name: 'File name' });
    await user.clear(box);
    await user.type(box, '.hidden');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'That name is not allowed.'
    );
  });

  it('refuses a name whose file name with its extension is over 255 bytes, as the server does', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'Beta');
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    const dialog = await screen.findByRole('dialog');
    const box = within(dialog).getByRole('textbox', { name: 'File name' });
    await user.clear(box);
    await user.click(box);
    await user.paste('a'.repeat(253));
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'That name is not allowed.'
    );
    expect(world.summaries.some((s) => s.path.includes('aaaaaaaa'))).toBe(
      false
    );
  });

  it('returns focus to the row menu after Cancel', async () => {
    const user = userEvent.setup();
    renderTable();
    await openMenu(user, 'Beta');
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Cancel',
      })
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Actions for Beta' })
      ).toHaveFocus()
    );
  });

  it('lists referrers (first 10, then the rest) in the delete confirm, deletes and toasts', async () => {
    const user = userEvent.setup();
    world.referrers = Array.from({ length: 12 }, (_, index) => ({
      collection: 'post',
      path: `${ROOT}/ref${index}.md`,
      title: `Ref ${index}`,
    }));
    renderTable();
    await openMenu(user, 'Beta');
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete “beta.md”?',
    });
    expect(await within(dialog).findByText('Ref 9')).toBeInTheDocument();
    expect(within(dialog).queryByText('Ref 10')).toBeNull();
    expect(within(dialog).getByText('and 2 more')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Deleted beta.md')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Beta')).toBeNull());
  });

  it('keeps the Deleted toast when deleting the last row of the last page drops the table back a page', async () => {
    const user = userEvent.setup();
    world.summaries = Array.from({ length: 51 }, (_, index) =>
      doc(`p${String(index).padStart(3, '0')}.md`)
    );
    renderTable();
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await openMenu(user, 'p050.md');
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      })
    );
    await waitFor(() => expect(screen.queryByText('Page 2 of 2')).toBeNull());
    expect(await screen.findByText('Deleted p050.md')).toBeVisible();
  });

  it('says links could not be checked and still allows Delete', async () => {
    const user = userEvent.setup();
    world.referrers = 'fail';
    renderTable();
    await openMenu(user, 'Beta');
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(
      await within(dialog).findByText('Links to it could not be checked.')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Delete' })
    ).toBeEnabled();
  });

  it('creates a folder that shows at once with 0 documents', async () => {
    const user = userEvent.setup();
    renderTable();
    await rowNamed('Beta');
    await user.click(screen.getByRole('button', { name: 'New' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Document' })
    ).toHaveAccessibleDescription(/not available yet/);
    await user.click(screen.getByRole('menuitem', { name: 'Folder' }));
    const dialog = await screen.findByRole('dialog', { name: 'New folder' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Folder name' }),
      'drafts'
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Create folder' })
    );
    expect(await rowNamed('drafts/')).toBeInTheDocument();
    expect(screen.getByText('0 documents')).toBeInTheDocument();
  });

  it('hides actions the provider cannot do', async () => {
    world.operations = false;
    renderTable();
    await rowNamed('Beta');
    expect(
      screen.queryByRole('button', { name: 'Actions for Beta' })
    ).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Document' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Folder' })).toBeNull();
  });
});

describe('narrow screens', () => {
  it('swaps the heads for Sort by and the status switch for a select on a phone', async () => {
    setWidth(390);
    renderTable();
    await rowNamed('Beta');
    expect(
      screen.queryByRole('columnheader', { name: /Last edited/ })
    ).toBeNull();
    expect(
      screen.getByRole('combobox', { name: 'Sort by' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Filter by status' })
    ).toBeInTheDocument();
  });
});
