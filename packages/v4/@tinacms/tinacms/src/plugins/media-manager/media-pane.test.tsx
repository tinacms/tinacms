import { QueryClient } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HashRouter } from 'react-router-dom';
import { TinaAdmin } from '../../admin/admin';
import {
  SaveToNewBranchContext,
  type SaveToNewBranchRequest,
} from '../../admin/save-to-new-branch';
import { asResolvedConfig } from '../../config';
import type { AuthSlice } from '../../core/auth/contract';
import { toUserId } from '../../core/auth/contract';
import { branchSliceOf, currentBranchOf } from '../../core/branch/contract';
import type { BranchInfo } from '../../core/branch/contract';
import {
  MediaError,
  type MediaFeatures,
  type MediaItem,
  type MediaPage,
  type MediaProvider,
  type MediaStatus,
} from '../../core/media/contract';
import { definePlugin } from '../../core/plugin';
import { validateCapabilityGraph } from '../../core/resolve';
import stringFieldPlugin from '../fields/string/string-field.plugin';
import { TinaProvider } from '../../editor';
import { MediaPane } from './media-pane';
import { mediaManagerPlugin } from './media-manager.plugin';

const BRANCHES: BranchInfo[] = [
  { name: 'main', protected: true },
  { name: 'feature/news' },
];

const POST = { path: 'content/posts/hello.mdx', title: 'Hello' };

interface World {
  files: MediaItem[];
  deleted: { branch: string; path: string }[];
  moved: { from: string; to: string }[];
  features: MediaFeatures;
  status: MediaStatus;
  hasRename: boolean;
  searchHits: boolean;
  failList: Error | null;
  failDelete: (path: string) => Error | null;
  failRename: (to: string) => Error | null;
  pageSize: number | undefined;
  failNextPage: boolean;
  listGate: Promise<void>;
  saveHandler: ((request: SaveToNewBranchRequest) => Promise<void>) | undefined;
  switchBranch: ((name: string) => void) | undefined;
  currentBranch: () => string;
}

let world: World;

const childrenOf = (folder: string) => {
  const prefix = folder ? `${folder}/` : '';
  return world.files.filter(
    ({ path }) =>
      path.startsWith(prefix) && !path.slice(prefix.length).includes('/')
  );
};

const mediaPlugin = () =>
  definePlugin({
    name: 'test:media',
    provides: ['media'],
    client: async () => ({
      default: {
        slice: (_set, get) =>
          ({
            upload: vi.fn(async (file: File, folder = '') => {
              const path = folder ? `${folder}/${file.name}` : file.name;
              world.files.push({ path, kind: 'file' });
              return path;
            }),
            list: vi.fn(
              async (folder: string, page = {}): Promise<MediaPage> => {
                await world.listGate;
                if (world.failList) throw world.failList;
                const all = childrenOf(folder).filter(
                  ({ path }) => !page.search || path.includes(page.search)
                );
                const start = Number(page.cursor ?? 0);
                if (start > 0 && world.failNextPage) {
                  world.failNextPage = false;
                  throw new Error('offline');
                }
                const size = world.pageSize ?? all.length;
                const end = start + size;
                return {
                  items: all.slice(start, end),
                  ...(end < all.length ? { cursor: String(end) } : {}),
                };
              }
            ),
            delete: vi.fn(async (path: string) => {
              const failure = world.failDelete(path);
              if (failure) throw failure;
              world.deleted.push({
                branch: currentBranchOf(get()) ?? 'main',
                path,
              });
              world.files = world.files.filter((item) => item.path !== path);
            }),
            resolveUrl: (path: string) => `/uploads/${path}`,
            features: world.features,
            status: async () => world.status,
            ...(world.hasRename
              ? {
                  rename: vi.fn(async (from: string, to: string) => {
                    const failure = world.failRename(to);
                    if (failure) throw failure;
                    world.moved.push({ from, to });
                    world.files = world.files.map((item) =>
                      item.path === from ? { ...item, path: to } : item
                    );
                    return to;
                  }),
                }
              : {}),
          }) satisfies MediaProvider,
      },
    }),
  });

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: (_set, get) => {
        world.switchBranch = (name) => branchSliceOf(get())?.switchTo(name);
        world.currentBranch = () => currentBranchOf(get()) ?? 'main';
        return {
          branches: {
            list: async () => BRANCHES,
            defaultBranch: async () => 'main',
          },
          list: async () => [{ path: POST.path }],
          get: async (_collection: string, path: string) =>
            path === POST.path
              ? {
                  path,
                  document: {
                    title: POST.title,
                    cover: 'posts/hero.jpg',
                    extra: 'logo.png',
                  },
                }
              : null,
          update: async () => {
            throw new Error('not used');
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
    default: { slice: () => ({ search: async () => [{ ref: POST.path }] }) },
  }),
});

const startOnFeatureBranch = () =>
  localStorage.setItem(
    'tina-store',
    JSON.stringify({
      state: { branch: { current: 'feature/news' } },
      version: 0,
    })
  );

const renderPane = (hash = '#/screens/media') => {
  window.location.hash = hash;
  return render(
    <SaveToNewBranchContext value={world.saveHandler}>
      <TinaAdmin
        config={asResolvedConfig({
          plugins: [
            contentPlugin,
            mediaPlugin(),
            mediaManagerPlugin(),
            stringFieldPlugin,
            ...(world.searchHits ? [searchPlugin] : []),
          ],
          schema: {
            collections: [
              {
                name: 'post',
                label: 'Posts',
                path: 'content/posts',
                format: 'mdx',
                fields: [{ name: 'title', label: 'Title', type: 'string' }],
              },
            ],
          },
          build: { publicFolder: 'public', outputFolder: 'admin' },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    </SaveToNewBranchContext>
  );
};

const pane = () => screen.findByRole('complementary', { name: 'Media' });
const file = (name: string) => screen.findByRole('button', { name });
const library = (name = 'Media') =>
  screen.findByRole('region', { name: `Files in ${name}` });

beforeEach(() => {
  startOnFeatureBranch();
  world = {
    files: [
      { path: 'posts', kind: 'directory' },
      { path: 'logo.png', kind: 'file' },
      { path: 'banner.png', kind: 'file' },
      { path: 'posts/hero.jpg', kind: 'file' },
    ],
    deleted: [],
    moved: [],
    features: { search: true },
    status: { kind: 'ready' },
    hasRename: false,
    searchHits: false,
    failList: null,
    failDelete: () => null,
    failRename: () => null,
    pageSize: undefined,
    failNextPage: false,
    listGate: Promise.resolve(),
    saveHandler: undefined,
    switchBranch: undefined,
    currentBranch: () => 'main',
  };
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('media manager plugin', () => {
  it('refuses to start without a media plugin', () => {
    expect(() =>
      validateCapabilityGraph([contentPlugin, mediaManagerPlugin()])
    ).toThrow(/depends on the "media" capability/);
  });
});

describe('Media pane in the shell', () => {
  it('opens beside the rail, keeps the open document in the main area, and Close returns to it', async () => {
    const user = userEvent.setup();
    renderPane('#/collections/post/content%2Fposts%2Fhello.mdx');
    await screen.findByRole('complementary', { name: 'Document form' });
    await user.click(await screen.findByRole('button', { name: 'Media' }));
    expect(await pane()).toBeVisible();
    expect(
      screen.getByRole('complementary', { name: 'Document form' })
    ).toBeInTheDocument();
    await user.click(
      within(await pane()).getByRole('button', { name: 'Close' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe(
        '#/collections/post/content%2Fposts%2Fhello.mdx'
      )
    );
    expect(screen.queryByRole('complementary', { name: 'Media' })).toBeNull();
  });

  it('opens a deep link at its folder with Home behind it', async () => {
    renderPane('#/screens/media/posts');
    expect(await file('hero.jpg')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('maximises from the header, then restores, and resets on close', async () => {
    const user = userEvent.setup();
    renderPane();
    const header = within(await pane());
    await user.click(await header.findByRole('button', { name: 'Maximise' }));
    expect(
      await header.findByRole('button', { name: 'Restore' })
    ).toBeVisible();
    await user.click(header.getByRole('button', { name: 'Restore' }));
    expect(header.getByRole('button', { name: 'Maximise' })).toBeVisible();
    await user.click(header.getByRole('button', { name: 'Maximise' }));
    await user.click(header.getByRole('button', { name: 'Close' }));
    await user.click(await screen.findByRole('button', { name: 'Media' }));
    expect(
      await within(await pane()).findByRole('button', { name: 'Maximise' })
    ).toBeVisible();
  });
});

describe('browsing', () => {
  it('lists folders before files, counts them, and keeps List pressed', async () => {
    const user = userEvent.setup();
    renderPane();
    const area = within(await library());
    await area.findByRole('button', { name: 'logo.png' });
    const names = area
      .getAllByRole('button')
      .map((button) => button.textContent || button.getAttribute('aria-label'));
    expect(names.slice(0, 3)).toEqual(['posts', 'logo.png', 'banner.png']);
    expect(await screen.findByText('1 folder, 2 files')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('shows the folder trail, goes back through it, and Back in the header', async () => {
    const user = userEvent.setup();
    renderPane('#/screens/media/posts');
    await file('hero.jpg');
    expect(
      screen.getByRole('navigation', { name: 'Media folders' })
    ).toBeVisible();
    await user.click(
      within(await pane()).getByRole('button', { name: 'Back' })
    );
    await waitFor(() => expect(window.location.hash).toBe('#/screens/media'));
    expect(
      within(await pane()).getByRole('heading', { name: 'Media' })
    ).toBeVisible();
  });

  it('loads the next page near the end of the scroll, and offers Try again when it fails', async () => {
    world.pageSize = 2;
    const user = userEvent.setup();
    renderPane();
    const area = await library();
    await file('logo.png');
    expect(screen.queryByRole('button', { name: 'hero.jpg' })).toBeNull();
    expect(screen.getByText('1 folder, 1+ files')).toBeVisible();
    world.failNextPage = true;
    fireEvent.scroll(area);
    expect(await screen.findByText("Couldn't load more files.")).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await file('banner.png');
    expect(screen.queryByText("Couldn't load more files.")).toBeNull();
  });

  it('searches the folder by file name with a hit count, and Clear search restores it', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    const box = screen.getByRole('searchbox', {
      name: 'Search Media by file name',
    });
    await user.type(box, 'nothing');
    expect(await screen.findByText('No files match “nothing”')).toBeVisible();
    await user.click(
      within(await library()).getByRole('button', { name: 'Clear search' })
    );
    expect(await file('logo.png')).toBeVisible();
    await user.type(box, 'logo');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'banner.png' })).toBeNull()
    );
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('1');
  });

  it('has no search box without features.search, and no Rename or filters', async () => {
    world.features = {};
    renderPane();
    await file('logo.png');
    expect(screen.queryByRole('searchbox')).toBeNull();
    for (const name of ['Rename', 'Folders', 'Files']) {
      expect(screen.queryByRole('button', { name })).toBeNull();
      expect(screen.queryByRole('radio', { name })).toBeNull();
    }
  });

  it('refuses bad folder names with the reason, then opens a valid one', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await user.click(screen.getByRole('button', { name: 'New folder' }));
    const dialog = await screen.findByRole('alertdialog');
    const field = within(dialog).getByRole('textbox', { name: 'Folder name' });
    const create = within(dialog).getByRole('button', { name: 'Create' });
    const cases: [string, string][] = [
      ['', 'Enter a folder name.'],
      [
        'team photos',
        "Folder names can't have spaces. Use dashes instead, such as team-photos.",
      ],
      ['team/photos', 'Use letters, numbers, dashes and dots only.'],
      ['posts', 'A folder called posts is already here. Pick another name.'],
    ];
    for (const [value, message] of cases) {
      await user.clear(field);
      if (value) await user.type(field, value);
      await user.click(create);
      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        message
      );
    }
    await user.clear(field);
    await user.type(field, 'team-photos');
    await user.click(create);
    await waitFor(() =>
      expect(window.location.hash).toBe('#/screens/media/team-photos')
    );
  });

  it('uploads into the folder in the URL', async () => {
    const user = userEvent.setup();
    renderPane('#/screens/media/posts');
    await file('hero.jpg');
    await user.upload(
      screen.getByLabelText(/^Upload\b/),
      new File(['x'], 'new.png', { type: 'image/png' })
    );
    expect(await file('new.png')).toBeVisible();
  });
});

describe('states', () => {
  it('shows a loading status, an empty library and an empty folder', async () => {
    let release = () => {};
    world.listGate = new Promise((resolve) => {
      release = resolve;
    });
    world.files = [{ path: 'posts', kind: 'directory' }];
    renderPane();
    expect(
      await screen.findByRole('status', { name: 'Loading Media' })
    ).toBeVisible();
    release();
    expect(await screen.findByRole('button', { name: 'posts' })).toBeVisible();
  });

  it('says so for an empty library and an empty folder, with no count', async () => {
    world.files = [];
    renderPane();
    expect(
      await screen.findByText('The media library is empty.')
    ).toBeVisible();
    expect(screen.queryByText(/^\d+\+? (folders?|files?)/)).toBeNull();
  });

  it('shows can’t-load with the reason, and Try again recovers', async () => {
    world.failList = new Error('disk unavailable');
    const user = userEvent.setup();
    renderPane();
    expect(
      await screen.findByText("Couldn't load files: disk unavailable")
    ).toBeVisible();
    expect(screen.queryByRole('searchbox')).toBeNull();
    world.failList = null;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await file('logo.png')).toBeVisible();
  });

  it('shows the setup look with the provider’s link and no library', async () => {
    world.status = {
      kind: 'needs-setup',
      message: 'Media needs to be turned on for this project.',
      actionLabel: 'Sync Your Media In TinaCloud.',
      actionUrl: 'https://app.tina.io/media',
    };
    renderPane();
    expect(
      await screen.findByText('Media needs to be turned on for this project.')
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Sync Your Media In TinaCloud.' })
    ).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('region', { name: /Files in/ })).toBeNull();
  });

  it('read-only: shows the reason, disables New folder, Delete and Move, keeps Select', async () => {
    world.features = { readOnly: true };
    world.hasRename = true;
    const user = userEvent.setup();
    renderPane();
    expect(
      await screen.findByText(
        "This storage is read-only. Files can't be uploaded or deleted here."
      )
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'New folder' })).toBeDisabled();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    const bar = screen.getByRole('toolbar', { name: 'Selected files' });
    expect(within(bar).getByRole('button', { name: 'Move' })).toBeDisabled();
    expect(
      within(bar).getByRole('button', { name: 'Delete 1' })
    ).toBeDisabled();
    expect(within(bar).getByRole('button', { name: 'Download' })).toBeEnabled();
  });
});

describe('details', () => {
  it('opens the details with facts and the heading focused, copies the URL, and Escape returns focus', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    renderPane('#/screens/media/posts');
    await user.click(await file('hero.jpg'));
    const details = await screen.findByRole('region', {
      name: 'Details of hero.jpg',
    });
    await waitFor(() =>
      expect(
        within(details).getByRole('heading', { name: 'hero.jpg' })
      ).toHaveFocus()
    );
    expect(within(details).getByText('Media / posts')).toBeVisible();
    expect(within(details).getByText('JPG image')).toBeVisible();
    await user.click(within(details).getByRole('button', { name: 'Copy URL' }));
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/uploads/posts/hero.jpg`
    );
    expect(
      await within(details).findByRole('button', { name: 'Copied' })
    ).toBeVisible();
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('region', { name: 'Details of hero.jpg' })
    ).toBeNull();
  });
});

describe('Select mode', () => {
  it('selects all, shows the count, copies URLs line by line, and Escape leaves', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    const bar = screen.getByRole('toolbar', { name: 'Selected files' });
    expect(
      within(bar).getByRole('button', { name: 'Download' })
    ).toBeDisabled();
    await user.click(within(bar).getByRole('button', { name: 'Select all' }));
    expect(within(bar).getByText('2 selected')).toBeVisible();
    await user.click(within(bar).getByRole('button', { name: 'Copy URLs' }));
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/uploads/logo.png\n${window.location.origin}/uploads/banner.png`
    );
    expect(
      await within(bar).findByRole('button', { name: 'Copied' })
    ).toBeVisible();
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('toolbar', { name: 'Selected files' })
    ).toBeNull();
  });

  it('toggles a focused file with Space', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    (await screen.findByRole('checkbox', { name: 'logo.png' })).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: 'logo.png' })).toBeChecked();
  });

  it('downloads each file under its own name and reports the ones that failed', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.endsWith('banner.png')
        ? new Response('no', { status: 403 })
        : new Response('ok')
    );
    vi.stubGlobal('fetch', fetchMock);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloads.push(this.download);
    });
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(
      await screen.findByText("Couldn't download 1 of 2 files.")
    ).toBeVisible();
    expect(downloads).toEqual(['logo.png']);
  });
});

describe('Delete', () => {
  const openDelete = async (
    user: ReturnType<typeof userEvent.setup>,
    name = 'logo.png'
  ) => {
    await user.click(await file(name));
    await user.click(
      within(
        await screen.findByRole('region', { name: `Details of ${name}` })
      ).getByRole('button', { name: 'Delete' })
    );
    return screen.findByRole('alertdialog');
  };

  it('asks first, says it could not check without a search, never blocks, and Cancel returns focus', async () => {
    const user = userEvent.setup();
    renderPane();
    const dialog = await openDelete(user);
    expect(
      within(dialog).getByRole('heading', { name: 'Delete “logo.png”?' })
    ).toBeVisible();
    expect(
      await within(dialog).findByText(
        "Couldn't check where this file is used. Any document that uses it will show a missing image."
      )
    ).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Delete' })
    ).toBeEnabled();
    expect(within(dialog).queryByText(/Not used anywhere/)).toBeNull();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(world.deleted).toEqual([]);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()
    );
  });

  it('lists the documents that use the file, and Open cancels the delete and goes there', async () => {
    world.searchHits = true;
    const user = userEvent.setup();
    renderPane('#/screens/media/posts');
    const dialog = await openDelete(user, 'hero.jpg');
    expect(
      await within(dialog).findByText(
        'Used in 1 document, which will show a missing image:'
      )
    ).toBeVisible();
    expect(within(dialog).getByText('content/posts/hello.mdx')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: /Open/ }));
    await waitFor(() =>
      expect(window.location.hash).toBe(
        '#/collections/post/content%2Fposts%2Fhello.mdx'
      )
    );
    expect(world.deleted).toEqual([]);
  });

  it('says search found nothing, without claiming the file is unused', async () => {
    world.searchHits = true;
    const user = userEvent.setup();
    renderPane();
    const dialog = await openDelete(user, 'banner.png');
    expect(
      await within(dialog).findByText(
        "Search found no saved document using this file. A document search can't see may still use it, and would show a missing image."
      )
    ).toBeVisible();
  });

  it('deletes several files, names the count, and leaves Select mode', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 2' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Delete 2 files?' })
    ).toBeVisible();
    await user.click(
      await within(dialog).findByRole('button', { name: 'Delete 2 files' })
    );
    expect(await screen.findByText('Deleted 2 files.')).toBeVisible();
    expect(world.deleted.map(({ path }) => path)).toEqual([
      'logo.png',
      'banner.png',
    ]);
    expect(
      screen.queryByRole('toolbar', { name: 'Selected files' })
    ).toBeNull();
  });

  it('keeps a file that failed, says how many, and Retry deletes only that one', async () => {
    world.failDelete = (path) =>
      path === 'banner.png' ? new MediaError('backend-failure') : null;
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 2' }));
    await user.click(
      await screen.findByRole('button', { name: 'Delete 2 files' })
    );
    expect(
      await screen.findByText("Couldn't delete 1 of 2 files.")
    ).toBeVisible();
    expect(
      await screen.findByRole('checkbox', { name: 'banner.png' })
    ).toBeVisible();
    world.failDelete = () => null;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(world.deleted.map(({ path }) => path)).toEqual([
        'logo.png',
        'banner.png',
      ])
    );
  });

  it('a refused delete stops the run and disables Delete with the reason', async () => {
    world.failDelete = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderPane();
    await user.click(
      await openDelete(user).then((dialog) =>
        within(dialog).findByRole('button', { name: 'Delete' })
      )
    );
    expect(
      await screen.findByText(
        /You don't have permission to delete\. 0 done, 1 left\./
      )
    ).toBeVisible();
    expect(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    ).toBeDisabled();
  });
});

describe('Delete on a protected branch', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const reachDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    renderPane();
    await user.click(await file('logo.png'));
    await user.click(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    await user.click(
      await within(await screen.findByRole('alertdialog')).findByRole(
        'button',
        { name: 'Delete' }
      )
    );
    return screen.findByRole('dialog', { name: 'Save to a new branch' });
  };

  it('with no handler, Continue is off and nothing is deleted', async () => {
    const user = userEvent.setup();
    const dialog = await reachDialog(user);
    expect(
      within(dialog).getByText(
        'main is protected, so deleting logo.png happens on a new branch with a pull request. You carry on there.'
      )
    ).toBeVisible();
    expect(
      within(dialog).getByRole('textbox', { name: /New branch name/ })
    ).toHaveValue('media/remove-logo');
    expect(
      within(dialog).getByRole('button', { name: 'Continue' })
    ).toBeDisabled();
    expect(world.deleted).toEqual([]);
  });

  it('makes the branch through the handler, then deletes on the new branch only', async () => {
    world.saveHandler = vi.fn(async (request) => {
      world.switchBranch?.(request.name);
    });
    const user = userEvent.setup();
    const dialog = await reachDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Deleted logo.png.')).toBeVisible();
    expect(world.saveHandler).toHaveBeenCalledWith({
      kind: 'media',
      name: 'media/remove-logo',
      reason: 'protected',
    });
    expect(world.deleted).toEqual([
      { branch: 'media/remove-logo', path: 'logo.png' },
    ]);
  });

  it('deletes nothing when the handler resolves without switching branch', async () => {
    world.saveHandler = vi.fn(async () => {});
    const user = userEvent.setup();
    const dialog = await reachDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(
      await screen.findByText(
        "Couldn't switch to the new branch. Nothing was deleted."
      )
    ).toBeVisible();
    expect(world.deleted).toEqual([]);
  });

  it('says the branch could not be made when the handler rejects, and Retry asks again', async () => {
    const handler = vi
      .fn<(request: SaveToNewBranchRequest) => Promise<void>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockImplementation(async (request) => {
        world.switchBranch?.(request.name);
      });
    world.saveHandler = handler;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const dialog = await reachDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(
      await screen.findByText("Couldn't make the branch. Try again.")
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Deleted logo.png.')).toBeVisible();
    expect(handler).toHaveBeenCalledTimes(2);
  });
});

describe('Move', () => {
  const pickMove = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));
    return screen.findByRole('alertdialog');
  };

  it('is hidden when the provider cannot rename', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    expect(screen.queryByRole('button', { name: 'Move' })).toBeNull();
  });

  it('moves into the chosen folder through rename, and the file leaves the folder', async () => {
    world.hasRename = true;
    const user = userEvent.setup();
    renderPane();
    const dialog = await pickMove(user);
    expect(
      within(dialog).getByRole('button', { name: 'Move here' })
    ).toBeDisabled();
    await user.click(
      await within(dialog).findByRole('button', { name: 'posts' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Move here' }));
    expect(await screen.findByText('Moved logo.png to posts.')).toBeVisible();
    expect(world.moved).toEqual([{ from: 'logo.png', to: 'posts/logo.png' }]);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'logo.png' })).toBeNull()
    );
  });

  it('keeps a file whose name is taken and names it', async () => {
    world.hasRename = true;
    world.failRename = () => new MediaError('name-taken');
    const user = userEvent.setup();
    renderPane();
    const dialog = await pickMove(user);
    await user.click(
      await within(dialog).findByRole('button', { name: 'posts' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Move here' }));
    expect(
      await screen.findByText("logo.png is already in posts. It wasn't moved.")
    ).toBeVisible();
    expect(
      await screen.findByRole('checkbox', { name: 'logo.png' })
    ).toBeVisible();
  });
});

describe('keyboard and accessibility', () => {
  it('Escape closes only the top layer: the details first, then Select mode', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await file('logo.png'));
    await screen.findByRole('region', { name: 'Details of logo.png' });
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('region', { name: 'Details of logo.png' })
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('toolbar', { name: 'Selected files' })
    ).toBeNull();
  });

  it('names the pane, the library and the busy state', async () => {
    renderPane();
    expect(await pane()).toBeVisible();
    expect(await library()).toHaveAttribute('aria-busy', 'false');
  });
});

describe('act hygiene', () => {
  it('renders without console errors', async () => {
    const error = vi.spyOn(console, 'error');
    renderPane();
    await file('logo.png');
    await act(async () => {});
    expect(error).not.toHaveBeenCalled();
  });
});

describe('usage lines and cards', () => {
  it('says how many documents use the open file', async () => {
    world.searchHits = true;
    const user = userEvent.setup();
    renderPane('#/screens/media/posts');
    await user.click(await file('hero.jpg'));
    expect(await screen.findByText('Used in 1 document')).toBeVisible();
  });

  it('groups documents by file for several files and counts the unused', async () => {
    world.searchHits = true;
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 2' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(
      await within(dialog).findByText(
        '1 of 2 files are used in documents, which will show a missing image:'
      )
    ).toBeVisible();
    const group = within(dialog).getByRole('region', { name: 'logo.png' });
    expect(within(group).getByText('content/posts/hello.mdx')).toBeVisible();
    expect(
      within(dialog).getByText('No use was found for the other 1.')
    ).toBeVisible();
  });

  it('lists the editor’s own unsaved edit as a card marked as theirs', async () => {
    const user = userEvent.setup();
    renderPane('#/collections/post/content%2Fposts%2Fhello.mdx');
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.type(title, 'banner.png');
    await user.click(screen.getByRole('button', { name: 'Media' }));
    await user.click(await file('banner.png'));
    await user.click(
      within(
        await screen.findByRole('region', { name: 'Details of banner.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(
      await within(dialog).findByText('hello.mdx (your unsaved edits)', {
        selector: 'p',
      })
    ).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Delete' })
    ).toBeEnabled();
  });
});

describe('Delete: focus and messages', () => {
  it('moves focus to the next file, and clears the done message after 6 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderPane();
      await user.click(await file('logo.png'));
      await user.click(
        within(
          await screen.findByRole('region', { name: 'Details of logo.png' })
        ).getByRole('button', { name: 'Delete' })
      );
      await user.click(
        await within(await screen.findByRole('alertdialog')).findByRole(
          'button',
          { name: 'Delete' }
        )
      );
      expect(await screen.findByText('Deleted logo.png.')).toBeVisible();
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'banner.png' })).toHaveFocus()
      );
      await act(() => vi.advanceTimersByTimeAsync(6000));
      expect(screen.queryByText('Deleted logo.png.')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Move on a protected branch', () => {
  beforeEach(() => {
    localStorage.clear();
    world.hasRename = true;
  });

  const reachDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));
    const move = await screen.findByRole('alertdialog');
    await user.click(
      await within(move).findByRole('button', { name: 'posts' })
    );
    await user.click(within(move).getByRole('button', { name: 'Move here' }));
    return screen.findByRole('dialog', { name: 'Save to a new branch' });
  };

  it('with no handler, Continue is off and nothing moves', async () => {
    const user = userEvent.setup();
    const dialog = await reachDialog(user);
    expect(
      within(dialog).getByText(
        'main is protected, so moving logo.png happens on a new branch with a pull request. You carry on there.'
      )
    ).toBeVisible();
    expect(
      within(dialog).getByRole('textbox', { name: /New branch name/ })
    ).toHaveValue('media/move-logo');
    expect(
      within(dialog).getByRole('button', { name: 'Continue' })
    ).toBeDisabled();
    expect(world.moved).toEqual([]);
  });

  it('makes the branch through the handler, then moves on it', async () => {
    world.saveHandler = vi.fn(async (request) => {
      world.switchBranch?.(request.name);
    });
    const user = userEvent.setup();
    const dialog = await reachDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Moved logo.png to posts.')).toBeVisible();
    expect(world.saveHandler).toHaveBeenCalledWith({
      kind: 'media',
      name: 'media/move-logo',
      reason: 'protected',
    });
    expect(world.moved).toEqual([{ from: 'logo.png', to: 'posts/logo.png' }]);
  });
});

describe('header Back and loading on focus', () => {
  it('Back closes the details that fill the pane and returns to the files', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await file('logo.png'));
    await screen.findByRole('region', { name: 'Details of logo.png' });
    expect(screen.queryByRole('region', { name: 'Files in Media' })).toBeNull();
    await user.click(
      within(await pane()).getByRole('button', { name: 'Back' })
    );
    expect(
      screen.queryByRole('region', { name: 'Details of logo.png' })
    ).toBeNull();
    expect(await library()).toBeVisible();
  });

  it('loads the next page when focus reaches the last loaded item', async () => {
    world.pageSize = 2;
    renderPane();
    const last = await file('logo.png');
    expect(screen.queryByRole('button', { name: 'banner.png' })).toBeNull();
    act(() => last.focus());
    expect(await file('banner.png')).toBeVisible();
  });
});

describe('permission lock and the signed-in state', () => {
  const alice = { id: toUserId('alice'), name: 'Alice' };
  const bob = { id: toUserId('bob'), name: 'Bob' };
  let setAuth: ((patch: Partial<AuthSlice>) => void) | undefined;

  const authPlugin = (status: AuthSlice['status']) =>
    definePlugin({
      name: 'test:auth',
      provides: ['auth'],
      server: async () => ({ default: {} }),
      client: async () => ({
        default: {
          slice: (set) => {
            setAuth = (patch) => set(patch);
            return {
              status,
              user: status === 'signed-out' ? null : alice,
              roles: ['editor'],
              getToken: async () => undefined,
              login: async () => {},
              logout: async () => {},
            };
          },
        },
      }),
    });

  const renderBare = (status: AuthSlice['status']) =>
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [authPlugin(status), mediaPlugin(), stringFieldPlugin],
          schema: { collections: [] },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <HashRouter>
          <MediaPane segments={[]} />
        </HashRouter>
      </TinaProvider>
    );

  const refuseDelete = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await file('logo.png'));
    await user.click(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    await user.click(
      await within(await screen.findByRole('alertdialog')).findByRole(
        'button',
        { name: 'Delete' }
      )
    );
  };

  const detailsDelete = () =>
    within(
      screen.getByRole('region', { name: 'Details of logo.png' })
    ).getByRole('button', { name: 'Delete' });

  it('locks Delete when signed in, and a new sign-in clears the lock', async () => {
    world.failDelete = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderBare('signed-in');
    await refuseDelete(user);
    expect(
      await screen.findByText(/You don't have permission to delete\. 0 done/)
    ).toBeVisible();
    expect(detailsDelete()).toBeDisabled();
    act(() => setAuth?.({ status: 'signed-in', user: bob }));
    await waitFor(() => expect(detailsDelete()).toBeEnabled());
  });

  it('says the session expired, and locks nothing, when the editor is signed out', async () => {
    world.failDelete = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderBare('signed-in');
    await user.click(await file('logo.png'));
    act(() => setAuth?.({ status: 'signed-out', user: null }));
    await user.click(detailsDelete());
    await user.click(
      await within(await screen.findByRole('alertdialog')).findByRole(
        'button',
        { name: 'Delete' }
      )
    );
    expect(
      await screen.findByText('Your session has expired. Sign in again.')
    ).toBeVisible();
    expect(detailsDelete()).toBeEnabled();
  });

  it('does not call a forbidden account an expired session', async () => {
    world.failDelete = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderBare('signed-in');
    await user.click(await file('logo.png'));
    act(() => setAuth?.({ status: 'forbidden', user: alice }));
    await user.click(detailsDelete());
    await user.click(
      await within(await screen.findByRole('alertdialog')).findByRole(
        'button',
        { name: 'Delete' }
      )
    );
    expect(
      await screen.findByText(
        "Your account doesn't have access to this project."
      )
    ).toBeVisible();
    expect(screen.queryByText(/session has expired/)).toBeNull();
  });
});
