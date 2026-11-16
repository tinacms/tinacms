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
  type MediaUploadOptions,
} from '../../core/media/contract';
import { definePlugin } from '../../core/plugin';
import { validateCapabilityGraph } from '../../core/resolve';
import stringFieldPlugin from '../fields/string/string-field.plugin';
import homePlugin from '../home/home.plugin';
import { TinaProvider } from '../../editor';
import { type SavePhase, toFormId, useFormStore } from '../../form/form-store';
import { MEDIA_EXTENSIONS } from './media-types';
import { MediaPane } from './media-pane';
import { mediaManagerPlugin } from './media-manager.plugin';
import { connectionOf } from '../../test/connection';

const BRANCHES: BranchInfo[] = [
  { name: 'main', protected: true },
  { name: 'feature/news' },
  { name: 'other' },
];

const POST = { path: 'content/posts/hello.mdx', title: 'Hello' };

interface UploadCall {
  name: string;
  folder: string;
  branch: string;
  aborted: boolean;
  settled: boolean;
  progress: (fraction: number) => void;
  land: () => void;
  fail: (cause: unknown) => void;
}

interface World {
  files: MediaItem[];
  uploadCalls: UploadCall[];
  holdUploads: boolean;
  /** A provider that does not stop on Cancel: the abort rejects nothing. */
  ignoreAbort: boolean;
  listCalls: { branch: string; folder: string }[];
  failUpload: (name: string) => unknown;
  storedName: (name: string) => string;
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
  searchGate: Promise<void>;
  deleteGate: (() => Promise<void>) | null;
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
            upload: vi.fn(
              (file: File, folder = '', options: MediaUploadOptions = {}) =>
                new Promise<string>((resolve, reject) => {
                  const pathOf = (name: string) =>
                    folder ? `${folder}/${name}` : name;
                  const call: UploadCall = {
                    name: file.name,
                    folder,
                    branch: currentBranchOf(get()) ?? 'main',
                    aborted: false,
                    settled: false,
                    progress: (fraction) => options.onProgress?.(fraction),
                    land: () => {
                      call.settled = true;
                      const path = pathOf(world.storedName(file.name));
                      world.files.push({ path, kind: 'file' });
                      resolve(path);
                    },
                    fail: (cause) => {
                      call.settled = true;
                      reject(cause);
                    },
                  };
                  world.uploadCalls.push(call);
                  options.signal?.addEventListener('abort', () => {
                    call.aborted = true;
                    if (world.ignoreAbort) return;
                    call.fail(new DOMException('Aborted', 'AbortError'));
                  });
                  const taken = world.files.some(
                    (item) =>
                      item.path.toLowerCase() ===
                      pathOf(file.name).toLowerCase()
                  );
                  const failure = world.failUpload(file.name);
                  if (failure) {
                    call.fail(failure);
                  } else if (taken) {
                    call.fail(new MediaError('name-taken'));
                  } else if (!world.holdUploads) {
                    call.land();
                  }
                })
            ),
            list: vi.fn(
              async (folder: string, page = {}): Promise<MediaPage> => {
                world.listCalls.push({
                  branch: currentBranchOf(get()) ?? 'main',
                  folder,
                });
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
              const sentOn = currentBranchOf(get()) ?? 'main';
              await world.deleteGate?.();
              const failure = world.failDelete(path);
              if (failure) throw failure;
              world.deleted.push({
                branch: sentOn,
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
          list: async () => connectionOf([{ path: POST.path }]),
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
    default: {
      slice: () => ({
        search: async () => {
          await world.searchGate;
          return [
            {
              ref: { collection: 'post', path: POST.path },
              score: 1,
              snippet: '',
            },
          ];
        },
      }),
    },
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

let paneClient = new QueryClient();

const renderPane = (hash = '#/screens/media') => {
  window.location.hash = hash;
  paneClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin,
          homePlugin,
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
      queryClient={paneClient}
    />
  );
};

const pane = () => screen.findByRole('complementary', { name: 'Media' });
const file = (name: string) => screen.findByRole('button', { name });
const library = (name = 'Media') =>
  screen.findByRole('region', { name: `Files in ${name}` });

type User = ReturnType<typeof userEvent.setup>;

const SAVING_FORM = toFormId(POST.path);
const setSave = (phase: SavePhase) =>
  act(() => useFormStore.getState().setSavePhase(SAVING_FORM, phase));

const png = (name: string, bytes = 1) =>
  new File([new Uint8Array(bytes)], name, { type: 'image/png' });
const pngs = (count: number) =>
  Array.from({ length: count }, (_, index) => png(`file-${index + 1}.png`));

const uploadButton = async (name: string | RegExp = 'Upload') =>
  within(await pane()).findByRole('button', { name });
const pick = (user: User, ...picked: File[]) =>
  user.upload(screen.getByLabelText('Choose files to upload'), picked);
const dropOn = (target: HTMLElement, dropped: File[]) =>
  fireEvent.drop(target, {
    dataTransfer: { files: dropped, types: ['Files'] },
  });
const openList = async (user: User) => {
  await user.click(await uploadButton(/^Uploading|couldn't upload$/));
  return screen.findByRole('dialog', { name: 'Uploads' });
};
// A row draws its name a second time for the eye, hidden from assistive technology.
const SPOKEN = { ignore: '[aria-hidden="true"], [aria-hidden="true"] *' };
const rowOf = (list: HTMLElement, name: string) => {
  const row = within(list)
    .getAllByRole('listitem')
    .find((item) => within(item).queryByText(name, SPOKEN) !== null);
  if (!row) throw new Error(`No upload row for ${name}`);
  return row;
};
const settle = (run: () => void) =>
  act(async () => {
    run();
  });
const callOf = (name: string, nth = 0) => {
  const call = world.uploadCalls.filter((entry) => entry.name === name)[nth];
  if (!call) throw new Error(`No upload call ${nth} for ${name}`);
  return call;
};
const sentNames = () => world.uploadCalls.map((call) => call.name);
const rootListCalls = () =>
  world.listCalls.filter(
    (call) => call.branch === 'feature/news' && call.folder === ''
  ).length;
const sending = () => world.uploadCalls.filter((call) => !call.settled);
const uploadStatuses = () => document.querySelectorAll('[data-upload-status]');

beforeEach(() => {
  startOnFeatureBranch();
  world = {
    files: [
      { path: 'posts', kind: 'directory' },
      { path: 'logo.png', kind: 'file' },
      { path: 'banner.png', kind: 'file' },
      { path: 'posts/hero.jpg', kind: 'file' },
    ],
    uploadCalls: [],
    holdUploads: false,
    ignoreAbort: false,
    listCalls: [],
    failUpload: () => null,
    storedName: (name) => name,
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
    searchGate: Promise.resolve(),
    deleteGate: null,
    switchBranch: undefined,
    currentBranch: () => 'main',
  };
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  useFormStore.getState().clearSavePhase(SAVING_FORM);
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
    expect(
      await screen.findByText('1', { selector: '[role=status]' })
    ).toBeVisible();
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
    await pick(user, png('new.png'));
    expect(await file('new.png')).toBeVisible();
    expect(world.uploadCalls.map((call) => call.folder)).toEqual(['posts']);
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

describe('copy failures', () => {
  const copyFails: Array<[string, () => void]> = [
    [
      'writeText rejects',
      () => {
        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
          new Error('denied')
        );
      },
    ],
    [
      'navigator.clipboard is missing',
      () => {
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          configurable: true,
        });
      },
    ],
  ];

  it.each(copyFails)(
    'Copy URL reports a failure and never shows Copied when %s',
    async (_name, breakClipboard) => {
      const user = userEvent.setup();
      breakClipboard();
      renderPane('#/screens/media/posts');
      await user.click(await file('hero.jpg'));
      const details = await screen.findByRole('region', {
        name: 'Details of hero.jpg',
      });
      await user.click(
        within(details).getByRole('button', { name: 'Copy URL' })
      );
      expect(await screen.findByRole('alert')).toHaveTextContent(
        "Couldn't copy the URL."
      );
      expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
      expect(screen.queryByText('URL copied')).toBeNull();
    }
  );

  it.each(copyFails)(
    'Copy URLs reports a failure, keeps the selection and never shows Copied when %s',
    async (_name, breakClipboard) => {
      const user = userEvent.setup();
      breakClipboard();
      renderPane();
      await user.click(await screen.findByRole('button', { name: 'Select' }));
      const bar = screen.getByRole('toolbar', { name: 'Selected files' });
      await user.click(within(bar).getByRole('button', { name: 'Select all' }));
      await user.click(within(bar).getByRole('button', { name: 'Copy URLs' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        "Couldn't copy the URLs."
      );
      expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
      expect(within(bar).getByText('2 selected')).toBeVisible();
    }
  );

  it('a failed copy removes the Copied of an earlier success, and a retry clears the notice', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    renderPane('#/screens/media/posts');
    await user.click(await file('hero.jpg'));
    const details = await screen.findByRole('region', {
      name: 'Details of hero.jpg',
    });
    await user.click(within(details).getByRole('button', { name: 'Copy URL' }));
    const copied = await within(details).findByRole('button', {
      name: 'Copied',
    });
    writeText.mockRejectedValueOnce(new Error('denied'));
    await user.click(copied);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't copy the URL."
    );
    expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
    await user.click(within(details).getByRole('button', { name: 'Copy URL' }));
    expect(
      await within(details).findByRole('button', { name: 'Copied' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
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

describe('on a protected branch', () => {
  const NOTE =
    'main is protected. Switch to another branch to upload, delete or move files.';

  beforeEach(() => {
    localStorage.clear();
    world.hasRename = true;
  });

  it('disables Delete and Move with the lock note, and sends nothing', async () => {
    const user = userEvent.setup();
    renderPane();
    expect((await screen.findAllByText(NOTE))[0]).toBeVisible();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    const bar = screen.getByRole('toolbar', { name: 'Selected files' });
    expect(
      within(bar).getByRole('button', { name: 'Delete 1' })
    ).toBeDisabled();
    expect(within(bar).getByRole('button', { name: 'Move' })).toBeDisabled();
    expect(within(bar).getByRole('button', { name: 'Download' })).toBeEnabled();
    expect(
      within(bar).getByRole('button', { name: 'Copy URLs' })
    ).toBeEnabled();
    await user.keyboard('{Escape}');
    await user.click(await file('logo.png'));
    const details = await screen.findByRole('region', {
      name: 'Details of logo.png',
    });
    expect(
      within(details).getByRole('button', { name: 'Delete' })
    ).toBeDisabled();
    await user.click(within(details).getByRole('button', { name: 'Delete' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(world.deleted).toEqual([]);
    expect(world.moved).toEqual([]);
  });

  it('counts the default branch as protected while no branch is chosen', async () => {
    renderPane();
    expect((await screen.findAllByText(NOTE))[0]).toBeVisible();
    expect(world.currentBranch()).toBe('main');
  });

  it('enables Delete and Move again on an unprotected branch', async () => {
    const user = userEvent.setup();
    renderPane();
    await screen.findAllByText(NOTE);
    act(() => world.switchBranch?.('other'));
    await waitFor(() => expect(screen.queryAllByText(NOTE)).toHaveLength(0));
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    const bar = screen.getByRole('toolbar', { name: 'Selected files' });
    expect(within(bar).getByRole('button', { name: 'Delete 1' })).toBeEnabled();
    expect(within(bar).getByRole('button', { name: 'Move' })).toBeEnabled();
  });

  it('puts read-only first in the lock order', async () => {
    world.features = { ...world.features, readOnly: true };
    renderPane();
    expect(
      await screen.findByText(
        "This storage is read-only. Files can't be uploaded or deleted here."
      )
    ).toBeVisible();
    expect(screen.queryByText(NOTE)).toBeNull();
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

  it('uploads, fails, retries and cancels without a console warning or error', async () => {
    const error = vi.spyOn(console, 'error');
    const warn = vi.spyOn(console, 'warn');
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(3));
    await waitFor(() => expect(sending()).toHaveLength(3));
    await settle(() => callOf('file-1.png').progress(0.5));
    await settle(() => callOf('file-1.png').land());
    await settle(() =>
      callOf('file-2.png').fail(new MediaError('backend-failure'))
    );
    const list = await openList(user);
    await user.click(
      within(list).getByRole('button', { name: 'Retry uploading file-2.png' })
    );
    await user.click(
      within(list).getByRole('button', { name: 'Cancel uploading file-3.png' })
    );
    await settle(() => callOf('file-2.png', 1).land());
    expect(await file('file-2.png')).toBeVisible();
    await act(async () => {});
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
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

describe('Delete: unsaved edits that change while the pane is open', () => {
  it('lists a reference the editor adds to an already-dirty document', async () => {
    const user = userEvent.setup();
    renderPane('#/collections/post/content%2Fposts%2Fhello.mdx');
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.type(title, 'draft');
    await user.click(screen.getByRole('button', { name: 'Media' }));
    await user.click(await file('banner.png'));
    await screen.findByRole('region', { name: 'Details of banner.png' });
    await user.clear(title);
    await user.type(title, 'banner.png');
    await user.click(
      within(
        screen.getByRole('region', { name: 'Details of banner.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(
      await within(dialog).findByText('hello.mdx (your unsaved edits)', {
        selector: 'p',
      })
    ).toBeVisible();
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

  const bareUpload = () => screen.findByRole('button', { name: /^Upload\b/ });
  const refusedRow = async (user: User) => {
    await user.click(await bareUpload());
    return rowOf(
      await screen.findByRole('dialog', { name: 'Uploads' }),
      'new.png'
    );
  };

  it('locks Upload for the signed-in user, and a new sign-in clears the lock', async () => {
    world.failUpload = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderBare('signed-in');
    await file('logo.png');
    await pick(user, png('new.png'));
    const row = await refusedRow(user);
    expect(
      within(row).getByText("You don't have permission to upload.")
    ).toBeVisible();
    expect(
      within(row).getByRole('button', { name: 'Remove new.png' })
    ).toBeVisible();
    expect(within(row).queryByRole('button', { name: /Retry/ })).toBeNull();
    await user.keyboard('{Escape}');
    expect(await bareUpload()).toBeDisabled();
    act(() => setAuth?.({ status: 'signed-in', user: bob }));
    await waitFor(async () => expect(await bareUpload()).toBeEnabled());
  });

  it.each([
    ['forbidden', alice, "Your account doesn't have access to this project."],
    ['signed-out', null, 'Your session has expired. Sign in again.'],
  ] as const)(
    'a refused upload for a %s account says so and locks nothing',
    async (status, account, words) => {
      world.failUpload = () => new MediaError('unauthorized');
      const user = userEvent.setup();
      renderBare('signed-in');
      await file('logo.png');
      act(() => setAuth?.({ status, user: account }));
      await pick(user, png('new.png'));
      const row = await refusedRow(user);
      expect(within(row).getByText(words)).toBeVisible();
      expect(within(row).queryByRole('button', { name: /Retry/ })).toBeNull();
      await user.click(
        within(row).getByRole('button', { name: 'Remove new.png' })
      );
      expect(await bareUpload()).toBeEnabled();
      expect(
        screen.queryByText("You don't have permission to upload.")
      ).toBeNull();
    }
  );
});

describe('changes on a feature branch', () => {
  const selectAllThenDelete = async (
    user: ReturnType<typeof userEvent.setup>
  ) => {
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 2' }));
    await user.click(
      await screen.findByRole('button', { name: 'Delete 2 files' })
    );
  };

  it('removes a deleted file from the feature branch’s listing', async () => {
    const user = userEvent.setup();
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
      expect(screen.queryByRole('button', { name: 'logo.png' })).toBeNull()
    );
  });

  it('removes several deleted files from the feature branch’s listing', async () => {
    const user = userEvent.setup();
    renderPane();
    await selectAllThenDelete(user);
    expect(await screen.findByText('Deleted 2 files.')).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'logo.png' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'logo.png' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'banner.png' })).toBeNull();
    });
  });

  it('removes a moved file from the folder it left', async () => {
    world.hasRename = true;
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));
    const move = await screen.findByRole('alertdialog');
    await user.click(
      await within(move).findByRole('button', { name: 'posts' })
    );
    await user.click(within(move).getByRole('button', { name: 'Move here' }));
    expect(await screen.findByText('Moved logo.png to posts.')).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByRole('checkbox', { name: 'logo.png' })).toBeNull()
    );
    expect(
      await screen.findByRole('button', { name: 'banner.png' })
    ).toBeVisible();
  });

  it('Retry after a partial failure deletes on the feature branch, refreshes it and leaves Select mode', async () => {
    world.failDelete = (path) =>
      path === 'banner.png' ? new MediaError('backend-failure') : null;
    const user = userEvent.setup();
    renderPane();
    await selectAllThenDelete(user);
    expect(
      await screen.findByText("Couldn't delete 1 of 2 files.")
    ).toBeVisible();
    world.failDelete = () => null;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(world.deleted.map(({ path }) => path)).toEqual([
        'logo.png',
        'banner.png',
      ])
    );
    expect(world.deleted.every(({ branch }) => branch === 'feature/news')).toBe(
      true
    );
    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'banner.png' })).toBeNull();
      expect(
        screen.queryByRole('toolbar', { name: 'Selected files' })
      ).toBeNull();
    });
  });

  it('locks Delete and Move on the feature branch after a refusal there, and refreshes its listing', async () => {
    world.hasRename = true;
    world.failDelete = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderPane();
    await selectAllThenDelete(user);
    expect(await screen.findByText(/0 done, 2 left\./)).toBeVisible();
    expect(
      screen.getByText("You don't have permission to delete.")
    ).toBeVisible();
    const bar = screen.getByRole('toolbar', { name: 'Selected files' });
    expect(
      within(bar).getByRole('button', { name: 'Delete 2' })
    ).toBeDisabled();
    expect(within(bar).getByRole('button', { name: 'Move' })).toBeDisabled();
  });
});

describe('runs are bound to their branch', () => {
  it('stops a run when the branch changes, sends nothing after the switch, and offers no Retry', async () => {
    world.files.push({ path: 'third.png', kind: 'file' });
    let release: () => void = () => {};
    let calls = 0;
    world.deleteGate = async () => {
      calls += 1;
      if (calls === 1) {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      }
    };
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 3' }));
    await user.click(
      await screen.findByRole('button', { name: 'Delete 3 files' })
    );
    await waitFor(() => expect(calls).toBe(1));
    act(() => world.switchBranch?.('other'));
    await act(async () => release());
    expect(
      await screen.findByText(
        'The branch changed, so this stopped. Deleted 1 of 3 files.'
      )
    ).toBeVisible();
    expect(world.deleted).toHaveLength(1);
    expect(world.deleted[0]?.branch).toBe('feature/news');
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('keeps a delete stopped after the editor switches away and back during a call', async () => {
    world.files.push({ path: 'third.png', kind: 'file' });
    let release: () => void = () => {};
    let calls = 0;
    world.deleteGate = async () => {
      calls += 1;
      if (calls === 1) {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      }
    };
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 3' }));
    await user.click(
      await screen.findByRole('button', { name: 'Delete 3 files' })
    );
    await waitFor(() => expect(calls).toBe(1));
    act(() => world.switchBranch?.('other'));
    act(() => world.switchBranch?.('feature/news'));
    await act(async () => release());
    expect(
      await screen.findByText(
        'The branch changed, so this stopped. Deleted 1 of 3 files.'
      )
    ).toBeVisible();
    expect(calls).toBe(1);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('closes the open confirm when the branch changes, so nothing runs on the old paths', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await file('logo.png'));
    await user.click(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    expect(await screen.findByRole('alertdialog')).toBeVisible();
    act(() => world.switchBranch?.('other'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => {
      expect(['Media', 'Files in Media']).toContain(
        document.activeElement?.getAttribute('aria-label')
      );
    });
    expect(world.deleted).toEqual([]);
  });

  it('keeps a Retry run stopped when the branch changes during it', async () => {
    world.files.push({ path: 'third.png', kind: 'file' });
    world.failDelete = () => new MediaError('backend-failure');
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Delete 3' }));
    await user.click(
      await screen.findByRole('button', { name: 'Delete 3 files' })
    );
    const retry = await screen.findByRole('button', { name: 'Retry' });
    let release: () => void = () => {};
    let calls = 0;
    world.failDelete = () => undefined;
    world.deleteGate = async () => {
      calls += 1;
      if (calls === 1) {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      }
    };
    await user.click(retry);
    await waitFor(() => expect(calls).toBe(1));
    act(() => world.switchBranch?.('other'));
    await act(async () => release());
    expect(
      await screen.findByText(/The branch changed, so this stopped/)
    ).toBeVisible();
    expect(calls).toBe(1);
  });

  it('refreshes the usage cache once the run ends even if the pane closed mid-run', async () => {
    let release: () => void = () => {};
    world.deleteGate = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });
    const user = userEvent.setup();
    const view = renderPane();
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
    await waitFor(() => expect(world.deleteGate).not.toBeNull());
    const invalidate = vi.spyOn(paneClient, 'invalidateQueries');
    view.unmount();
    await act(async () => release());
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ['tina', 'media', 'usage'],
      })
    );
    expect(invalidate).toHaveBeenCalledTimes(2);
  });

  it('drops a failure and its Retry when the branch changes to a protected main, where Delete is disabled', async () => {
    world.failDelete = () => new MediaError('backend-failure');
    const user = userEvent.setup();
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
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeVisible();
    act(() => world.switchBranch?.('main'));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
    );
    expect(
      (
        await screen.findAllByText(
          'main is protected. Switch to another branch to upload, delete or move files.'
        )
      )[0]
    ).toBeVisible();
    expect(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    ).toBeDisabled();
    expect(world.deleted).toEqual([]);
  });

  it('turns Delete off while a run is in progress', async () => {
    let release: () => void = () => {};
    world.deleteGate = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });
    const user = userEvent.setup();
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
    expect(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    ).toBeDisabled();
    await act(async () => release());
    expect(await screen.findByText('Deleted logo.png.')).toBeVisible();
  });
});

describe('focus after a branch change', () => {
  const frames = () =>
    act(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    });

  const insidePane = async () =>
    (await pane()).contains(document.activeElement);

  it('leaves focus on the header Search button when nothing in the pane was open', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    const search = screen.getByRole('button', { name: /^Search/ });
    search.focus();
    act(() => world.switchBranch?.('other'));
    await frames();
    expect(search).toHaveFocus();
    expect(await insidePane()).toBe(false);
    await user.keyboard('{Escape}');
  });

  it('leaves focus on Copy URL when the details are open', async () => {
    renderPane();
    await userEvent.setup().click(await file('logo.png'));
    const copy = await within(
      await screen.findByRole('region', { name: 'Details of logo.png' })
    ).findByRole('button', { name: 'Copy URL' });
    copy.focus();
    act(() => world.switchBranch?.('other'));
    await frames();
    expect(copy).toHaveFocus();
  });

  it('keeps typing into an open New folder dialog', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await user.click(screen.getByRole('button', { name: 'New folder' }));
    const field = await within(
      await screen.findByRole('alertdialog')
    ).findByRole('textbox', { name: 'Folder name' });
    await user.type(field, 'ab');
    act(() => world.switchBranch?.('other'));
    await frames();
    await user.keyboard('cd');
    expect(field).toHaveValue('abcd');
  });

  it('keeps typing into the open Search palette', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await user.click(screen.getByRole('button', { name: /^Search/ }));
    const field = await screen.findByRole('searchbox', { name: 'Search' });
    await user.type(field, 'ab');
    act(() => world.switchBranch?.('other'));
    await frames();
    await user.keyboard('cd');
    expect(field).toHaveValue('abcd');
  });

  it('does not pull focus in when the page falls back to the default branch on load', async () => {
    localStorage.setItem(
      'tina-store',
      JSON.stringify({
        state: { branch: { current: 'deleted/branch' } },
        version: 0,
      })
    );
    renderPane();
    await file('logo.png');
    const search = screen.getByRole('button', { name: /^Search/ });
    search.focus();
    await waitFor(() => expect(world.currentBranch?.()).toBe('main'));
    await frames();
    expect(search).toHaveFocus();
  });

  it('moves focus into the pane when the branch change closed the Delete confirm', async () => {
    const user = userEvent.setup();
    renderPane();
    await user.click(await file('logo.png'));
    await user.click(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    expect(await screen.findByRole('alertdialog')).toBeVisible();
    act(() => world.switchBranch?.('other'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await frames();
    expect(await insidePane()).toBe(true);
    expect(['Media', 'Files in Media']).toContain(
      document.activeElement?.getAttribute('aria-label')
    );
  });

  it('moves focus into the pane when the branch change closed the Move dialog', async () => {
    world.hasRename = true;
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));
    expect(await screen.findByRole('alertdialog')).toBeVisible();
    act(() => world.switchBranch?.('other'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await frames();
    expect(await insidePane()).toBe(true);
    expect(world.moved).toEqual([]);
  });
});

describe('Move waits for the usage lookup', () => {
  it('keeps Move here off while usage is checked, then turns it on', async () => {
    world.hasRename = true;
    world.searchHits = true;
    let release: () => void = () => {};
    world.searchGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const user = userEvent.setup();
    renderPane();
    await user.click(await screen.findByRole('button', { name: 'Select' }));
    await user.click(await screen.findByRole('checkbox', { name: 'logo.png' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(
      await within(dialog).findByRole('button', { name: 'posts' })
    );
    expect(
      within(dialog).getByText('Checking where this file is used')
    ).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Move here' })
    ).toBeDisabled();
    await act(async () => release());
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Move here' })
      ).toBeEnabled()
    );
    expect(
      within(dialog).getByText(
        'Used in 1 document, which will show a missing image:'
      )
    ).toBeVisible();
  });
});

describe('uploading: where files go', () => {
  it('uploads 5 picked files into the folder in view, even after the editor opens another folder', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane('#/screens/media/posts');
    await file('hero.jpg');
    await pick(user, ...pngs(5));
    await waitFor(() => expect(sending()).toHaveLength(3));
    await user.click(
      within(await pane()).getByRole('button', { name: 'Back' })
    );
    await file('logo.png');
    for (let landed = 0; landed < 5; landed += 1) {
      await settle(() => sending()[0]?.land());
    }
    expect(world.uploadCalls.map((call) => call.folder)).toEqual(
      Array.from({ length: 5 }, () => 'posts')
    );
    expect(world.files.map((item) => item.path)).toEqual(
      expect.arrayContaining(['posts/file-1.png', 'posts/file-5.png'])
    );
  });

  it('uploads 5 dropped files into the folder in view', async () => {
    renderPane('#/screens/media/posts');
    await file('hero.jpg');
    dropOn(await library('posts'), pngs(5));
    await waitFor(() => expect(world.uploadCalls).toHaveLength(5));
    expect(new Set(world.uploadCalls.map((call) => call.folder))).toEqual(
      new Set(['posts'])
    );
    expect(await file('file-5.png')).toBeVisible();
  });

  it('does nothing when no file is picked', async () => {
    renderPane();
    await file('logo.png');
    fireEvent.change(screen.getByLabelText('Choose files to upload'), {
      target: { files: [] },
    });
    expect(world.uploadCalls).toEqual([]);
    expect(await uploadButton()).toBeEnabled();
  });
});

describe('uploading: the Upload button', () => {
  it('is the last control before Maximise and Close in the header', async () => {
    renderPane();
    await file('logo.png');
    const names = within(await pane())
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent);
    const at = names.indexOf('Upload');
    expect(at).toBeGreaterThanOrEqual(0);
    expect(names.slice(at, at + 3)).toEqual(['Upload', 'Maximise', 'Close']);
  });

  it('shows "Uploading K of N" while a batch runs, stays enabled, and opens the list instead of the file dialog', async () => {
    world.holdUploads = true;
    const chooser = vi.spyOn(HTMLInputElement.prototype, 'click');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(4));
    const button = await uploadButton('Uploading 1 of 4');
    expect(button).toBeEnabled();
    await settle(() => callOf('file-1.png').land());
    expect(await uploadButton('Uploading 2 of 4')).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    chooser.mockClear();
    await user.click(await uploadButton('Uploading 2 of 4'));
    expect(
      await screen.findByRole('dialog', { name: 'Uploads' })
    ).toBeVisible();
    expect(chooser).not.toHaveBeenCalled();
  });

  it('reads "Uploading" for one file', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('one.png'));
    expect(await uploadButton('Uploading')).toBeEnabled();
  });

  it('reads "N uploaded" when every file lands, then returns to Upload with an empty list after 5 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderPane();
      await file('logo.png');
      await pick(user, ...pngs(4));
      expect(await uploadButton('4 uploaded')).toBeEnabled();
      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(await uploadButton('Upload')).toBeEnabled();
      expect(
        within(await pane()).queryByRole('button', { name: /uploaded/ })
      ).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the list while focus is inside it, and looks again 5 seconds later', async () => {
    world.holdUploads = true;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderPane();
      await file('logo.png');
      await pick(user, ...pngs(2));
      const list = await openList(user);
      await settle(() => callOf('file-1.png').land());
      await settle(() => callOf('file-2.png').land());
      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(within(list).getAllByRole('listitem')).toHaveLength(2);
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Uploads' })).toBeNull()
      );
      expect(await uploadButton('2 uploaded')).toBeVisible();
      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(await uploadButton('Upload')).toBeEnabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the list after a failure and shows a red count until the list has been opened', async () => {
    world.failUpload = (name) =>
      name === 'file-2.png' ? new MediaError('backend-failure') : null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderPane();
      await file('logo.png');
      await pick(user, ...pngs(3));
      expect(
        await uploadButton(/^Upload\b.*\b1 couldn't upload$/)
      ).toBeEnabled();
      await act(() => vi.advanceTimersByTimeAsync(10000));
      const list = await openList(user);
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
      await user.keyboard('{Escape}');
      expect(await uploadButton('Upload')).toBeEnabled();
      expect(
        within(await pane()).queryByRole('button', { name: /couldn't upload/ })
      ).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('uploading: the list', () => {
  it('has one row per file with its name, progress, size and a named Cancel', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(4));
    await waitFor(() => expect(sending()).toHaveLength(3));
    await settle(() => callOf('file-1.png').progress(0.4));
    const list = await openList(user);
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    const first = rowOf(list, 'file-1.png');
    expect(within(first).getByText('Uploading 40% · 1 KB')).toBeVisible();
    expect(
      within(first).getByRole('button', { name: 'Cancel uploading file-1.png' })
    ).toBeVisible();
    expect(
      within(rowOf(list, 'file-4.png')).getByText('Uploading 0% · 1 KB')
    ).toBeVisible();
  });

  it('never shows a percentage for a provider that reports no progress', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(4));
    const list = await openList(user);
    for (const name of ['file-1.png', 'file-4.png']) {
      expect(
        within(rowOf(list, name)).getByText('Uploading · 1 KB')
      ).toBeVisible();
    }
    expect(list).not.toHaveTextContent('%');
  });

  it('moves focus into the list, Escape closes it and returns focus to Upload, and Select mode stays', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await user.click(screen.getByRole('button', { name: 'Select' }));
    await pick(user, png('one.png'));
    const list = await openList(user);
    await waitFor(() =>
      expect(list.contains(document.activeElement)).toBe(true)
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Uploads' })).toBeNull()
    );
    expect(await uploadButton('Uploading')).toHaveFocus();
    expect(
      screen.getByRole('toolbar', { name: 'Selected files' })
    ).toBeVisible();
  });

  it('keeps focus inside the list when the focused Cancel goes away because the file landed', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(2));
    const list = await openList(user);
    const cancel = within(list).getByRole('button', {
      name: 'Cancel uploading file-1.png',
    });
    act(() => cancel.focus());
    await settle(() => callOf('file-1.png').land());
    expect(cancel).not.toBeInTheDocument();
    expect(list.contains(document.activeElement)).toBe(true);
  });

  it('has no Cancel and never reads 100% once every byte is sent, and the file still lands', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(2));
    const list = await openList(user);
    await settle(() => callOf('file-1.png').progress(1));
    const row = rowOf(list, 'file-1.png');
    expect(within(row).getByText('Uploading 99% · 1 KB')).toBeVisible();
    expect(within(row).queryByRole('button')).toBeNull();
    await settle(() => callOf('file-1.png').land());
    expect(
      within(rowOf(list, 'file-1.png')).getByText('Uploaded to Media')
    ).toBeVisible();
    expect(callOf('file-1.png').aborted).toBe(false);
    expect(world.files.map((item) => item.path)).toContain('file-1.png');
  });

  it.each([
    ['a-long-photo-name-2026.png', 'a-long-photo-n', 'ame-2026.png'],
    ['thirteen1.png', 't', 'hirteen1.png'],
    ['my summer photos', 'my s', 'ummer photos'],
    [
      '写真のファイル名はとても長いです.png',
      '写真のファイル名',
      'はとても長いです.png',
    ],
    ['holiday-👨‍👩‍👧-and-🇦🇺-9.png', 'holiday-👨‍👩‍👧', '-and-🇦🇺-9.png'],
  ])(
    'cuts %s in the middle for the eye and keeps its last 12 characters, and reads the full name once',
    async (name, start, end) => {
      world.holdUploads = true;
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, png(name));
      const list = await openList(user);
      const row = rowOf(list, name);
      const drawn = within(row).getByTitle(name);
      expect(Array.from(drawn.children, (part) => part.textContent)).toEqual([
        start,
        end,
      ]);
      expect(drawn.closest('[aria-hidden="true"]')).not.toBeNull();
      expect(within(row).getAllByText(name, SPOKEN)).toHaveLength(1);
      expect(within(row).getAllByTitle(name)).toHaveLength(1);
      expect(within(row).queryByText(start, SPOKEN)).toBeNull();
      expect(within(row).queryByText(end, SPOKEN)).toBeNull();
      expect(
        within(row).getByRole('button', { name: `Cancel uploading ${name}` })
      ).toBeVisible();
    }
  );

  it.each(['short.png', 'twelve12.png'])(
    'shows %s whole, with no split',
    async (name) => {
      world.holdUploads = true;
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, png(name));
      const list = await openList(user);
      const row = rowOf(list, name);
      const drawn = within(row).getByTitle(name);
      expect(Array.from(drawn.children, (part) => part.textContent)).toEqual([
        name,
      ]);
      expect(drawn.querySelector('.text-ellipsis')).toBeNull();
      expect(within(row).getAllByText(name, SPOKEN)).toHaveLength(1);
    }
  );

  it('keeps the full name in the Retry and Remove buttons of a row with a long name', async () => {
    const name = 'a-long-photo-name-2026.png';
    world.failUpload = () => new MediaError('backend-failure');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png(name));
    const list = await openList(user);
    expect(
      within(rowOf(list, name)).getByRole('button', {
        name: `Retry uploading ${name}`,
      })
    ).toBeVisible();
    world.failUpload = () => new MediaError('too-large');
    await user.click(
      within(list).getByRole('button', { name: `Retry uploading ${name}` })
    );
    expect(
      await within(list).findByRole('button', { name: `Remove ${name}` })
    ).toBeVisible();
    expect(within(rowOf(list, name)).getByTitle(name)).toBeVisible();
  });

  it('sends 3 files at a time, and starts the next one each time one settles', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(7));
    await waitFor(() => expect(world.uploadCalls).toHaveLength(3));
    await settle(() => callOf('file-1.png').land());
    expect(world.uploadCalls).toHaveLength(4);
    expect(sending()).toHaveLength(3);
    await settle(() => callOf('file-2.png').fail(new MediaError('not-found')));
    expect(world.uploadCalls).toHaveLength(5);
    expect(sending()).toHaveLength(3);
  });
});

describe('uploading: Cancel, Retry and Remove', () => {
  it('Cancel stops a file that is sending, and the other files go on', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(2));
    const list = await openList(user);
    await user.click(
      within(list).getByRole('button', { name: 'Cancel uploading file-1.png' })
    );
    expect(
      await within(rowOf(list, 'file-1.png')).findByText('Cancelled')
    ).toBeVisible();
    expect(callOf('file-1.png').aborted).toBe(true);
    await settle(() => callOf('file-2.png').land());
    expect(await file('file-2.png')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'file-1.png' })).toBeNull();
    expect(world.files.map((item) => item.path)).not.toContain('file-1.png');
  });

  describe('a double click on a row action', () => {
    const failedThenHeld = async (user: User, ...picked: File[]) => {
      world.failUpload = () => new Error('offline');
      renderPane();
      await file('logo.png');
      await pick(user, ...picked);
      const list = await openList(user);
      world.failUpload = () => null;
      world.holdUploads = true;
      return list;
    };
    const action = (list: HTMLElement, label: string) =>
      within(list).getByRole('button', { name: label });

    it('retries once: the second click lands on Cancel and does nothing', async () => {
      const user = userEvent.setup();
      const list = await failedThenHeld(user, png('file-1.png'));
      fireEvent.click(action(list, 'Retry uploading file-1.png'), {
        detail: 1,
      });
      fireEvent.click(
        await within(list).findByRole('button', {
          name: 'Cancel uploading file-1.png',
        }),
        {
          detail: 2,
        }
      );
      const row = rowOf(list, 'file-1.png');
      expect(within(row).queryByText('Cancelled')).toBeNull();
      expect(within(row).getByText(/^Uploading/)).toBeVisible();
      expect(action(list, 'Cancel uploading file-1.png')).toBeVisible();
      expect(sentNames()).toEqual(['file-1.png', 'file-1.png']);
      expect(world.uploadCalls[1]?.aborted).toBe(false);
      await settle(() => world.uploadCalls[1]?.land());
      expect(await within(list).findByText('Uploaded to Media')).toBeVisible();
    });

    it('still cancels with a click of its own after Retry, and with Enter and Space', async () => {
      const user = userEvent.setup();
      const list = await failedThenHeld(
        user,
        png('file-1.png'),
        png('file-2.png'),
        png('file-3.png')
      );
      fireEvent.click(action(list, 'Retry uploading file-1.png'), {
        detail: 1,
      });
      fireEvent.click(
        await within(list).findByRole('button', {
          name: 'Cancel uploading file-1.png',
        }),
        { detail: 1 }
      );
      expect(
        await within(rowOf(list, 'file-1.png')).findByText('Cancelled')
      ).toBeVisible();

      action(list, 'Retry uploading file-2.png').focus();
      await user.keyboard('{Enter}');
      const cancel = await within(list).findByRole('button', {
        name: 'Cancel uploading file-2.png',
      });
      cancel.focus();
      await user.keyboard(' ');
      expect(
        await within(rowOf(list, 'file-2.png')).findByText('Cancelled')
      ).toBeVisible();
      expect(sentNames()).toEqual([
        'file-1.png',
        'file-2.png',
        'file-3.png',
        'file-1.png',
        'file-2.png',
      ]);
    });

    it('on Remove takes out that row only, whatever the action of the row that moves up', async () => {
      world.features = { maxSize: 10 };
      world.holdUploads = true;
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      const large = (name: string) =>
        new File(['x'.repeat(20)], name, { type: 'image/png' });
      await pick(user, large('big-1.png'), large('big-2.png'), png('ok.png'));
      const list = await openList(user);

      fireEvent.click(action(list, 'Remove big-1.png'), { detail: 1 });
      fireEvent.click(action(list, 'Remove big-2.png'), { detail: 2 });
      expect(within(list).queryByText('big-1.png')).toBeNull();
      expect(action(list, 'Remove big-2.png')).toBeVisible();

      fireEvent.click(action(list, 'Remove big-2.png'), { detail: 1 });
      fireEvent.click(action(list, 'Cancel uploading ok.png'), { detail: 2 });
      expect(within(rowOf(list, 'ok.png')).queryByText('Cancelled')).toBeNull();
      expect(callOf('ok.png').aborted).toBe(false);
      expect(sentNames()).toEqual(['ok.png']);
    });

    it('on Remove does not retry the failed row that moves up', async () => {
      world.features = { maxSize: 10 };
      world.failUpload = () => new Error('offline');
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(
        user,
        new File(['x'.repeat(20)], 'big.png', { type: 'image/png' }),
        png('lost.png')
      );
      const list = await openList(user);
      fireEvent.click(action(list, 'Remove big.png'), { detail: 1 });
      fireEvent.click(action(list, 'Retry uploading lost.png'), { detail: 2 });
      expect(action(list, 'Retry uploading lost.png')).toBeVisible();
      expect(sentNames()).toEqual(['lost.png']);
    });

    it('on Cancel cancels that row only', async () => {
      world.holdUploads = true;
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, ...pngs(2));
      const list = await openList(user);
      fireEvent.click(action(list, 'Cancel uploading file-1.png'), {
        detail: 1,
      });
      fireEvent.click(action(list, 'Cancel uploading file-2.png'), {
        detail: 2,
      });
      expect(
        await within(rowOf(list, 'file-1.png')).findByText('Cancelled')
      ).toBeVisible();
      expect(
        within(rowOf(list, 'file-2.png')).queryByText('Cancelled')
      ).toBeNull();
      expect(callOf('file-2.png').aborted).toBe(false);
    });

    it('on Retry of a row with 20 refused names asks the number after the last one refused, once', async () => {
      const taken = [
        'image.png',
        ...Array.from({ length: 19 }, (_, index) => `image-${index + 1}.png`),
      ];
      world.files.push(
        ...taken.map((path) => ({ path, kind: 'file' }) satisfies MediaItem)
      );
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, png('image.png'));
      const list = await openList(user);
      world.holdUploads = true;
      fireEvent.click(action(list, 'Retry uploading image.png'), {
        detail: 1,
      });
      fireEvent.click(
        await within(list).findByRole('button', {
          name: 'Cancel uploading image.png',
        }),
        { detail: 2 }
      );
      expect(sentNames()).toEqual([...taken, 'image-20.png']);
      expect(callOf('image-20.png').aborted).toBe(false);
      await settle(() => callOf('image-20.png').land());
      expect(
        await within(list).findByText(
          'image.png was taken, saved as image-20.png'
        )
      ).toBeVisible();
    });
  });

  it('Cancel on a file that waits for its turn sends no request for it', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(4));
    const list = await openList(user);
    await user.click(
      within(list).getByRole('button', { name: 'Cancel uploading file-4.png' })
    );
    expect(
      within(rowOf(list, 'file-4.png')).getByText('Cancelled')
    ).toBeVisible();
    await settle(() => callOf('file-1.png').land());
    await settle(() => callOf('file-2.png').land());
    await settle(() => callOf('file-3.png').land());
    expect(sentNames()).toEqual(['file-1.png', 'file-2.png', 'file-3.png']);
  });

  it('Cancel on a numbered try sends no further request for that file', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    world.holdUploads = true;
    await pick(user, png('logo.png'));
    await waitFor(() =>
      expect(sentNames()).toEqual(['logo.png', 'logo-1.png'])
    );
    const list = await openList(user);
    await user.click(
      within(list).getByRole('button', { name: 'Cancel uploading logo.png' })
    );
    expect(await within(list).findByText('Cancelled')).toBeVisible();
    expect(sentNames()).toEqual(['logo.png', 'logo-1.png']);
    expect(world.files.map((item) => item.path)).not.toContain('logo-1.png');
  });

  it('Retry runs a failed file again from its picked name, and a second failure offers Retry again', async () => {
    world.failUpload = () => new MediaError('backend-failure');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    const list = await openList(user);
    const row = () => rowOf(list, 'new.png');
    expect(
      within(row()).getByText('Something went wrong. Please try again.')
    ).toBeVisible();
    await user.click(
      within(row()).getByRole('button', { name: 'Retry uploading new.png' })
    );
    await waitFor(() => expect(sentNames()).toEqual(['new.png', 'new.png']));
    expect(
      await within(row()).findByRole('button', {
        name: 'Retry uploading new.png',
      })
    ).toBeVisible();
    world.failUpload = () => null;
    await user.click(
      within(row()).getByRole('button', { name: 'Retry uploading new.png' })
    );
    expect(await within(row()).findByText('Uploaded to Media')).toBeVisible();
    expect(await file('new.png')).toBeVisible();
  });

  it('Remove takes the last row out, closes the list and returns focus to Upload', async () => {
    world.features = { search: true, maxSize: 1024 * 1024 };
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('huge.png', 1024 * 1024 + 1));
    const list = await openList(user);
    const row = rowOf(list, 'huge.png');
    expect(
      within(row).getByText('Too large. The limit is 1 MB.')
    ).toBeVisible();
    expect(within(row).queryByRole('button', { name: /Retry/ })).toBeNull();
    await user.click(
      within(row).getByRole('button', { name: 'Remove huge.png' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Uploads' })).toBeNull()
    );
    await waitFor(async () => expect(await uploadButton()).toHaveFocus());
    expect(world.uploadCalls).toEqual([]);
  });
});

describe('uploading: which failures can be retried', () => {
  const failedRow = async (user: User, name: string) => {
    const list = await openList(user);
    return rowOf(list, name);
  };

  it.each([
    [
      'a rejection that is not a MediaError, from a provider that reports no progress,',
      () => new Error('offline'),
      "Couldn't upload. Check your connection, then retry.",
    ],
    [
      'backend-failure',
      () => new MediaError('backend-failure'),
      'Something went wrong. Please try again.',
    ],
    [
      'not-found',
      () => new MediaError('not-found'),
      'This file no longer exists. Refresh and try again.',
    ],
    [
      '20 names refused',
      () => new MediaError('name-taken'),
      'A file with that name already exists in this folder.',
    ],
  ])('%s offers Retry', async (_label, cause, reason) => {
    world.failUpload = cause;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    const row = await failedRow(user, 'new.png');
    expect(within(row).getByText(reason)).toBeVisible();
    expect(
      within(row).getByRole('button', { name: 'Retry uploading new.png' })
    ).toBeVisible();
    expect(within(row).queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it.each([
    ['too-large', 'That file is too large to upload.'],
    [
      'invalid-name',
      "That name isn't valid. Avoid slashes and special characters.",
    ],
    ['invalid-path', "That file name or folder isn't valid."],
    ['unsupported', "This media store doesn't support that."],
  ] as const)(
    '%s from the provider offers Remove only',
    async (code, reason) => {
      world.failUpload = () => new MediaError(code);
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, png('new.png'));
      const row = await failedRow(user, 'new.png');
      expect(within(row).getByText(reason)).toBeVisible();
      expect(
        within(row).getByRole('button', { name: 'Remove new.png' })
      ).toBeVisible();
      expect(within(row).queryByRole('button', { name: /Retry/ })).toBeNull();
    }
  );

  it('a lost connection before every byte was sent offers Retry with the connection words', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    await waitFor(() => expect(sending()).toHaveLength(1));
    await settle(() => callOf('new.png').progress(0.9));
    const lists = rootListCalls();
    await settle(() => callOf('new.png').fail(new Error('offline')));
    const row = await failedRow(user, 'new.png');
    expect(
      within(row).getByText(
        "Couldn't upload. Check your connection, then retry."
      )
    ).toBeVisible();
    expect(
      within(row).getByRole('button', { name: 'Retry uploading new.png' })
    ).toBeVisible();
    expect(within(row).queryByRole('button', { name: /Remove/ })).toBeNull();
    expect(rootListCalls()).toBe(lists);
  });

  describe('after every byte was sent', () => {
    const UNCONFIRMED =
      "Couldn't confirm the upload. Check Media before you upload it again.";

    const sendAll = async (user: User, name: string) => {
      world.holdUploads = true;
      renderPane();
      await file('logo.png');
      await pick(user, png(name));
      await waitFor(() => expect(sending()).toHaveLength(1));
      await settle(() => callOf(name).progress(1));
    };

    it('no answer from the storage is unconfirmed: Remove only, the folder is listed again, no New mark, and no second upload can start', async () => {
      const user = userEvent.setup();
      await sendAll(user, 'new.png');
      const lists = rootListCalls();
      // The storage kept the file, and its answer was lost.
      world.files.push({ path: 'new.png', kind: 'file' });
      await settle(() => callOf('new.png').fail(new Error('no answer')));
      const row = await failedRow(user, 'new.png');
      expect(within(row).getByText(UNCONFIRMED)).toBeVisible();
      expect(
        within(row).getByRole('button', { name: 'Remove new.png' })
      ).toBeVisible();
      expect(screen.queryByRole('button', { name: /^Retry/ })).toBeNull();
      await waitFor(() => expect(rootListCalls()).toBe(lists + 1));
      const stored = await file('new.png');
      expect(stored).not.toHaveAccessibleDescription('New');
      expect(uploadStatuses()[0]).toHaveTextContent(
        `new.png couldn't upload. ${UNCONFIRMED}`
      );
      await user.click(
        within(row).getByRole('button', { name: 'Remove new.png' })
      );
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Uploads' })).toBeNull()
      );
      expect(world.uploadCalls).toHaveLength(1);
    });

    it('a provider that did not stop on Cancel is unconfirmed too, and never reads "Cancelled"', async () => {
      world.holdUploads = true;
      world.ignoreAbort = true;
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, png('new.png'), png('other.png'));
      await waitFor(() => expect(sending()).toHaveLength(2));
      const list = await openList(user);
      await user.click(
        within(list).getByRole('button', { name: 'Cancel uploading new.png' })
      );
      await settle(() => callOf('new.png').progress(1));
      const lists = rootListCalls();
      await settle(() => callOf('new.png').fail(new Error('no answer')));
      const row = rowOf(list, 'new.png');
      expect(within(row).getByText(UNCONFIRMED)).toBeVisible();
      expect(within(row).queryByText('Cancelled')).toBeNull();
      expect(
        within(row).getByRole('button', { name: 'Remove new.png' })
      ).toBeVisible();
      await waitFor(() => expect(rootListCalls()).toBe(lists + 1));
    });

    it('backend-failure is an answer from the storage and offers Retry', async () => {
      const user = userEvent.setup();
      await sendAll(user, 'new.png');
      const lists = rootListCalls();
      await settle(() =>
        callOf('new.png').fail(new MediaError('backend-failure'))
      );
      const row = await failedRow(user, 'new.png');
      expect(
        within(row).getByText('Something went wrong. Please try again.')
      ).toBeVisible();
      expect(
        within(row).getByRole('button', { name: 'Retry uploading new.png' })
      ).toBeVisible();
      expect(within(row).queryByRole('button', { name: /Remove/ })).toBeNull();
      expect(rootListCalls()).toBe(lists);
    });

    it('name-taken goes on to the next number', async () => {
      const user = userEvent.setup();
      await sendAll(user, 'new.png');
      await settle(() => callOf('new.png').fail(new MediaError('name-taken')));
      expect(sentNames()).toEqual(['new.png', 'new-1.png']);
      await settle(() => callOf('new-1.png').land());
      const list = await screen.findByRole('button', { name: '1 uploaded' });
      expect(list).toBeVisible();
      expect(await file('new-1.png')).toHaveAccessibleDescription('New');
    });
  });

  it('a file of a type that is not accepted offers Remove only, and no request is sent', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    dropOn(await library(), [
      new File(['x'], 'tool.exe', { type: 'application/x-msdownload' }),
    ]);
    const row = await failedRow(user, 'tool.exe');
    expect(
      within(row).getByText("This file type can't be uploaded here.")
    ).toBeVisible();
    expect(
      within(row).getByRole('button', { name: 'Remove tool.exe' })
    ).toBeVisible();
    expect(within(row).queryByRole('button', { name: /Retry/ })).toBeNull();
    expect(world.uploadCalls).toEqual([]);
  });

  describe('on a provider that accepts a list of extensions', () => {
    beforeEach(() => {
      world.features = { acceptedExtensions: [...MEDIA_EXTENSIONS] };
    });

    it.each([
      [
        'notes.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      ['tool.exe', 'image/png'],
    ])(
      'refuses a dropped %s before a request, with Remove only',
      async (name, type) => {
        const user = userEvent.setup();
        renderPane();
        await file('logo.png');
        dropOn(await library(), [new File(['x'], name, { type })]);
        const row = await failedRow(user, name);
        expect(
          within(row).getByText("This file type can't be uploaded here.")
        ).toBeVisible();
        expect(
          within(row).getByRole('button', { name: `Remove ${name}` })
        ).toBeVisible();
        expect(world.uploadCalls).toEqual([]);
      }
    );

    it('uploads a dropped audio file and an image', async () => {
      renderPane();
      await file('logo.png');
      dropOn(await library(), [
        new File(['x'], 'song.mp3', { type: 'audio/mpeg' }),
        new File(['x'], 'hero.jpg', { type: 'image/jpeg' }),
      ]);
      expect(await file('song.mp3')).toBeVisible();
      expect(await file('hero.jpg')).toBeVisible();
      expect(sentNames()).toEqual(['song.mp3', 'hero.jpg']);
    });
  });
});

describe('uploading: a taken name', () => {
  it('never overwrites: saves the file with a number and says so', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    world.holdUploads = true;
    await pick(user, png('logo.png'));
    await waitFor(() =>
      expect(sentNames()).toEqual(['logo.png', 'logo-1.png'])
    );
    const list = await openList(user);
    await settle(() => callOf('logo-1.png').land());
    expect(
      within(rowOf(list, 'logo-1.png')).getByText(
        'logo.png was taken, saved as logo-1.png'
      )
    ).toBeVisible();
    expect(world.files.filter((item) => item.path.startsWith('logo'))).toEqual([
      { path: 'logo.png', kind: 'file' },
      { path: 'logo-1.png', kind: 'file' },
    ]);
  });

  it('tries the next number when the numbered name is taken too', async () => {
    world.files.push({ path: 'logo-1.png', kind: 'file' });
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('logo.png'));
    expect(await file('logo-2.png')).toBeVisible();
    expect(sentNames()).toEqual(['logo.png', 'logo-1.png', 'logo-2.png']);
  });

  it('gives two files of one name in one batch their own names, also when they differ only in case', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('Photo.png'), png('photo.png'), png('photo.png'));
    await waitFor(() => expect(world.uploadCalls).toHaveLength(3));
    expect(sentNames()).toEqual(['Photo.png', 'photo-1.png', 'photo-2.png']);
  });

  it.each([
    ['archive.tar.gz', 'archive.tar-1.gz'],
    ['README', 'README-1'],
  ])('numbers %s as %s', async (name, numbered) => {
    world.files.push({ path: name, kind: 'file' });
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png(name));
    expect(await file(numbered)).toBeVisible();
    expect(sentNames()).toEqual([name, numbered]);
  });

  it('fails with the taken-name reason and Retry after 20 refused names', async () => {
    world.failUpload = () => new MediaError('name-taken');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    const list = await openList(user);
    expect(
      within(list).getByText(
        'A file with that name already exists in this folder.'
      )
    ).toBeVisible();
    expect(sentNames()).toEqual([
      'new.png',
      ...Array.from({ length: 19 }, (_, index) => `new-${index + 1}.png`),
    ]);
    world.failUpload = () => null;
    await user.click(
      within(list).getByRole('button', { name: 'Retry uploading new.png' })
    );
    await waitFor(() => expect(world.uploadCalls).toHaveLength(21));
    expect(sentNames().at(-1)).toBe('new-20.png');
  });

  it('Retry after 20 refused names asks for the 21st name first, and a second run of 20 goes on from there', async () => {
    const taken = [
      'image.png',
      ...Array.from({ length: 19 }, (_, index) => `image-${index + 1}.png`),
    ];
    world.files.push(
      ...taken.map((path) => ({ path, kind: 'file' }) satisfies MediaItem)
    );
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('image.png'));
    const list = await openList(user);
    const row = () => rowOf(list, 'image.png');
    expect(
      within(row()).getByText(
        'A file with that name already exists in this folder.'
      )
    ).toBeVisible();
    expect(sentNames()).toEqual(taken);
    await user.click(
      within(row()).getByRole('button', { name: 'Retry uploading image.png' })
    );
    expect(
      await within(list).findByText(
        'image.png was taken, saved as image-20.png'
      )
    ).toBeVisible();
    expect(sentNames()).toEqual([...taken, 'image-20.png']);
    expect(await file('image-20.png')).toBeVisible();
  });

  it('keeps its place after 20 refused names when a Retry fails for another reason: the next Retry sends one request for the 21st name', async () => {
    const taken = [
      'image.png',
      ...Array.from({ length: 19 }, (_, index) => `image-${index + 1}.png`),
    ];
    world.files.push(
      ...taken.map((path) => ({ path, kind: 'file' }) satisfies MediaItem)
    );
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('image.png'));
    const list = await openList(user);
    const row = () => rowOf(list, 'image.png');
    const retry = () =>
      within(row()).getByRole('button', { name: 'Retry uploading image.png' });
    expect(sentNames()).toEqual(taken);

    world.failUpload = () => new Error('offline');
    await user.click(retry());
    expect(
      await within(row()).findByText(
        "Couldn't upload. Check your connection, then retry."
      )
    ).toBeVisible();
    expect(sentNames()).toEqual([...taken, 'image-20.png']);

    world.failUpload = () => new MediaError('backend-failure');
    await user.click(retry());
    expect(
      await within(row()).findByText('Something went wrong. Please try again.')
    ).toBeVisible();
    expect(sentNames()).toEqual([...taken, 'image-20.png', 'image-20.png']);

    world.failUpload = () => null;
    await user.click(retry());
    expect(
      await within(list).findByText(
        'image.png was taken, saved as image-20.png'
      )
    ).toBeVisible();
    expect(sentNames()).toEqual([
      ...taken,
      'image-20.png',
      'image-20.png',
      'image-20.png',
    ]);
  });

  it('goes on from the last name the storage refused when a Retry meets more taken names and then loses the connection', async () => {
    const taken = [
      'image.png',
      ...Array.from({ length: 21 }, (_, index) => `image-${index + 1}.png`),
    ];
    world.files.push(
      ...taken.map((path) => ({ path, kind: 'file' }) satisfies MediaItem)
    );
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('image.png'));
    const list = await openList(user);
    const row = () => rowOf(list, 'image.png');
    const retry = () =>
      within(row()).getByRole('button', { name: 'Retry uploading image.png' });
    expect(sentNames()).toEqual(taken.slice(0, 20));

    world.failUpload = (name) =>
      name === 'image-22.png' ? new Error('offline') : null;
    await user.click(retry());
    expect(
      await within(row()).findByText(
        "Couldn't upload. Check your connection, then retry."
      )
    ).toBeVisible();
    expect(sentNames().slice(20)).toEqual([
      'image-20.png',
      'image-21.png',
      'image-22.png',
    ]);

    world.failUpload = () => null;
    await user.click(retry());
    expect(
      await within(list).findByText(
        'image.png was taken, saved as image-22.png'
      )
    ).toBeVisible();
    expect(sentNames().slice(23)).toEqual(['image-22.png']);
  });

  it('a second Retry after 40 refused names asks for the 41st name', async () => {
    world.failUpload = () => new MediaError('name-taken');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    const list = await openList(user);
    await user.click(
      within(list).getByRole('button', { name: 'Retry uploading new.png' })
    );
    await waitFor(() => expect(world.uploadCalls).toHaveLength(40));
    expect(sentNames().at(-1)).toBe('new-39.png');
    world.failUpload = () => null;
    await user.click(
      await within(list).findByRole('button', {
        name: 'Retry uploading new.png',
      })
    );
    await waitFor(() => expect(world.uploadCalls).toHaveLength(41));
    expect(sentNames().at(-1)).toBe('new-40.png');
  });

  it.each([
    ['a lost connection', () => new Error('offline')],
    ['backend-failure', () => new MediaError('backend-failure')],
  ])(
    'Retry after %s on a numbered name asks for the picked name first',
    async (_label, cause) => {
      world.failUpload = (name) => (name === 'logo-1.png' ? cause() : null);
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, png('logo.png'));
      const list = await openList(user);
      expect(sentNames()).toEqual(['logo.png', 'logo-1.png']);
      world.failUpload = () => null;
      world.holdUploads = true;
      await user.click(
        within(list).getByRole('button', { name: 'Retry uploading logo.png' })
      );
      await waitFor(() => expect(world.uploadCalls).toHaveLength(4));
      expect(sentNames()).toEqual([
        'logo.png',
        'logo-1.png',
        'logo.png',
        'logo-1.png',
      ]);
    }
  );

  it('does not report a name the provider only cleaned as taken', async () => {
    world.storedName = (name) => name.replaceAll(' ', '-');
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('my photo.png'), png('other.png'));
    const list = await openList(user);
    await settle(() => callOf('my photo.png').land());
    const row = rowOf(list, 'my-photo.png');
    expect(within(row).getByText('Uploaded to Media')).toBeVisible();
    expect(list).not.toHaveTextContent('was taken');
  });
});

describe('uploading: New files', () => {
  const namesIn = (area: HTMLElement) =>
    within(area)
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent);

  it('shows a landed file first among the files, after the folders, marked New, once', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('zebra.png'));
    const fresh = await file('zebra.png');
    expect(fresh).toHaveAccessibleDescription('New');
    await waitFor(() =>
      expect(screen.getByText('1 folder, 3 files')).toBeVisible()
    );
    expect(namesIn(await library())).toEqual([
      'posts',
      'zebra.png',
      'logo.png',
      'banner.png',
    ]);
  });

  it('drops the mark after the editor opens another folder and comes back', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('zebra.png'));
    expect(await file('zebra.png')).toHaveAccessibleDescription('New');
    await user.click(screen.getByRole('button', { name: 'posts' }));
    await file('hero.jpg');
    await user.click(
      within(await pane()).getByRole('button', { name: 'Back' })
    );
    expect(await file('zebra.png')).toHaveAccessibleDescription('');
    expect(namesIn(await library())).toEqual([
      'posts',
      'logo.png',
      'banner.png',
      'zebra.png',
    ]);
  });

  it('drops the mark after a branch change and after a reload', async () => {
    const user = userEvent.setup();
    const view = renderPane();
    await file('logo.png');
    await pick(user, png('zebra.png'));
    expect(await file('zebra.png')).toHaveAccessibleDescription('New');
    act(() => world.switchBranch?.('other'));
    await waitFor(async () =>
      expect(await file('zebra.png')).toHaveAccessibleDescription('')
    );
    act(() => world.switchBranch?.('feature/news'));
    await waitFor(async () =>
      expect(await file('zebra.png')).toHaveAccessibleDescription('')
    );
    await pick(user, png('yak.png'));
    expect(await file('yak.png')).toHaveAccessibleDescription('New');
    view.unmount();
    renderPane();
    expect(await file('yak.png')).toHaveAccessibleDescription('');
  });

  it('hides a New file that the active search leaves out', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('zebra.png'));
    await file('zebra.png');
    const box = screen.getByRole('searchbox', {
      name: 'Search Media by file name',
    });
    await user.type(box, 'logo');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'banner.png' })).toBeNull()
    );
    expect(await file('logo.png')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'zebra.png' })).toBeNull();
    await user.clear(box);
    await user.type(box, 'ZEB');
    expect(await file('zebra.png')).toHaveAccessibleDescription('New');
  });

  it('no longer shows a New file that was deleted', async () => {
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('zebra.png'));
    await user.click(await file('zebra.png'));
    await user.click(
      within(
        await screen.findByRole('region', { name: 'Details of zebra.png' })
      ).getByRole('button', { name: 'Delete' })
    );
    await user.click(
      await within(await screen.findByRole('alertdialog')).findByRole(
        'button',
        { name: 'Delete' }
      )
    );
    expect(await screen.findByText('Deleted zebra.png.')).toBeVisible();
    await file('logo.png');
    expect(screen.queryByRole('button', { name: 'zebra.png' })).toBeNull();
  });

  it('no longer shows a New file in its old place after it was moved', async () => {
    world.hasRename = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('zebra.png'));
    await file('zebra.png');
    await user.click(screen.getByRole('button', { name: 'Select' }));
    await user.click(
      await screen.findByRole('checkbox', { name: 'zebra.png' })
    );
    await user.click(screen.getByRole('button', { name: 'Move' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(
      await within(dialog).findByRole('button', { name: 'posts' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Move here' }));
    expect(await screen.findByText('Moved zebra.png to posts.')).toBeVisible();
    await file('logo.png');
    expect(screen.queryByRole('button', { name: 'zebra.png' })).toBeNull();
    expect(screen.queryByRole('checkbox', { name: 'zebra.png' })).toBeNull();
  });
});

describe('uploading: while a save runs', () => {
  const SAVING = 'Saving. You can upload once it finishes.';

  it('turns Upload off with the reason in words, and turns a drop away with the same words', async () => {
    renderPane();
    await file('logo.png');
    await setSave({ phase: 'saving' });
    const button = await uploadButton();
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(SAVING);
    expect(
      within(await pane()).getByText(SAVING, { selector: 'p' })
    ).toBeVisible();
    fireEvent.dragEnter(await library(), {
      dataTransfer: { types: ['Files'] },
    });
    expect(screen.queryByText('Drop to upload to Media')).toBeNull();
    dropOn(await library(), [png('new.png')]);
    expect(await within(await pane()).findByRole('alert')).toHaveTextContent(
      SAVING
    );
    expect(world.uploadCalls).toEqual([]);
    await setSave({ phase: 'saved' });
    expect(await uploadButton()).toBeEnabled();
    expect(within(await pane()).queryByText(SAVING)).toBeNull();
  });

  it.each([
    ['works', { phase: 'saved' }],
    ['fails', { phase: 'failed', message: 'offline' }],
  ] as const)(
    'holds files that have not started until the save ends, also when it %s, and lets a sending file finish',
    async (_label, end) => {
      world.holdUploads = true;
      const user = userEvent.setup();
      renderPane();
      await file('logo.png');
      await pick(user, ...pngs(5));
      await waitFor(() => expect(sending()).toHaveLength(3));
      await setSave({ phase: 'saving' });
      await settle(() => callOf('file-1.png').land());
      expect(world.uploadCalls).toHaveLength(3);
      expect(world.files.map((item) => item.path)).toContain('file-1.png');
      const list = await openList(user);
      expect(
        within(rowOf(list, 'file-4.png')).getByText(
          'Waiting for the save to finish'
        )
      ).toBeVisible();
      await user.click(
        within(list).getByRole('button', {
          name: 'Cancel uploading file-5.png',
        })
      );
      await setSave(end);
      await waitFor(() => expect(world.uploadCalls).toHaveLength(4));
      expect(sentNames()).not.toContain('file-5.png');
      expect(callOf('file-4.png').settled).toBe(false);
    }
  );
});

describe('uploading: the library drop', () => {
  const dragIn = (target: HTMLElement, types = ['Files']) =>
    fireEvent.dragEnter(target, { dataTransfer: { types } });
  const dragOut = (target: HTMLElement, types = ['Files']) =>
    fireEvent.dragLeave(target, { dataTransfer: { types } });

  it('shows "Drop to upload to FOLDER" while files are dragged over it, also across tiles, and hides it on leave', async () => {
    renderPane('#/screens/media/posts');
    const tile = await file('hero.jpg');
    const area = await library('posts');
    dragIn(area);
    expect(screen.getByText('Drop to upload to posts')).toBeVisible();
    dragIn(tile);
    dragOut(area);
    expect(screen.getByText('Drop to upload to posts')).toBeVisible();
    dragOut(tile);
    expect(screen.queryByText('Drop to upload to posts')).toBeNull();
  });

  it('names Media at the root, and hides the veil when the files drop', async () => {
    renderPane();
    await file('logo.png');
    const area = await library();
    dragIn(area);
    expect(screen.getByText('Drop to upload to Media')).toBeVisible();
    dropOn(area, [png('new.png')]);
    expect(screen.queryByText('Drop to upload to Media')).toBeNull();
    expect(await file('new.png')).toBeVisible();
  });

  it('shows no veil for a drag that carries no files, and its drop uploads nothing', async () => {
    renderPane();
    await file('logo.png');
    const area = await library();
    dragIn(area, ['text/plain']);
    expect(screen.queryByText('Drop to upload to Media')).toBeNull();
    fireEvent.drop(area, {
      dataTransfer: { files: [], types: ['text/plain'] },
    });
    expect(world.uploadCalls).toEqual([]);
    expect(await uploadButton()).toBeEnabled();
  });

  it('turns a dropped folder away with words and lists nothing', async () => {
    renderPane();
    await file('logo.png');
    dropOn(await library(), [new File([], 'holiday')]);
    expect(await within(await pane()).findByRole('alert')).toHaveTextContent(
      "Folders can't be uploaded. Drop the files instead."
    );
    expect(world.uploadCalls).toEqual([]);
    expect(await uploadButton()).toBeEnabled();
  });

  it('reads a folder from the entry API where the browser has it, and still uploads the files beside it', async () => {
    renderPane();
    await file('logo.png');
    const photo = png('new.png');
    fireEvent.drop(await library(), {
      dataTransfer: {
        types: ['Files'],
        files: [photo],
        items: [
          {
            kind: 'file',
            webkitGetAsEntry: () => ({ isDirectory: true }),
            getAsFile: () => null,
          },
          {
            kind: 'file',
            webkitGetAsEntry: () => ({ isDirectory: false }),
            getAsFile: () => photo,
          },
        ],
      },
    });
    expect(await within(await pane()).findByRole('alert')).toHaveTextContent(
      "Folders can't be uploaded. Drop the files instead."
    );
    expect(await file('new.png')).toBeVisible();
    expect(sentNames()).toEqual(['new.png']);
  });

  it('read-only storage: no Upload button, no veil, and a drop is turned away with the reason', async () => {
    world.features = { readOnly: true };
    renderPane();
    await file('logo.png');
    expect(
      within(await pane()).queryByRole('button', { name: /Upload/ })
    ).toBeNull();
    const area = await library();
    dragIn(area);
    expect(screen.queryByText('Drop to upload to Media')).toBeNull();
    dropOn(area, [png('new.png')]);
    expect(await within(await pane()).findByRole('alert')).toHaveTextContent(
      "This storage is read-only. Files can't be uploaded or deleted here."
    );
    expect(world.uploadCalls).toEqual([]);
  });

  it('storage that is not set up: no Upload button, and a drop is turned away with the reason', async () => {
    world.status = {
      kind: 'needs-setup',
      message: 'Media needs to be turned on for this project.',
      actionLabel: 'Sync Your Media In TinaCloud.',
      actionUrl: 'https://app.tina.io/media',
    };
    renderPane();
    const words = await screen.findByText(
      'Media needs to be turned on for this project.'
    );
    expect(
      within(await pane()).queryByRole('button', { name: /Upload/ })
    ).toBeNull();
    dropOn(words, [png('new.png')]);
    expect(await within(await pane()).findByRole('alert')).toHaveTextContent(
      'Media needs to be turned on for this project.'
    );
    expect(screen.queryByText(/Drop to upload/)).toBeNull();
    expect(world.uploadCalls).toEqual([]);
  });
});

describe('uploading: with Media closed, and the polite status', () => {
  it('keeps a batch running while the pane is closed, and shows its true state when it opens again', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(3));
    await waitFor(() => expect(sending()).toHaveLength(3));
    await user.click(
      within(await pane()).getByRole('button', { name: 'Close' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: 'Media' })).toBeNull()
    );
    expect(uploadStatuses()).toHaveLength(1);
    await settle(() => callOf('file-1.png').land());
    await settle(() => callOf('file-2.png').land());
    expect(callOf('file-3.png').aborted).toBe(false);
    await user.click(await screen.findByRole('button', { name: 'Media' }));
    expect(await uploadButton('Uploading 3 of 3')).toBeEnabled();
    expect(await file('file-1.png')).toBeVisible();
    expect(await file('file-2.png')).toBeVisible();
    const list = await openList(user);
    expect(
      within(rowOf(list, 'file-3.png')).getByRole('button', {
        name: 'Cancel uploading file-3.png',
      })
    ).toBeVisible();
    expect(uploadStatuses()).toHaveLength(1);
  });

  it('reads the start, each failure once, a cancel and the end with a taken name, and never a percentage', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    expect(uploadStatuses()).toHaveLength(1);
    const status = uploadStatuses()[0];
    const read: string[] = [];
    const observer = new MutationObserver(() =>
      read.push(status?.textContent ?? '')
    );
    if (status) {
      observer.observe(status, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
    await pick(user, png('logo.png'), png('bad.png'), png('stop.png'));
    expect(status).toHaveTextContent('Uploading 3 files to Media.');
    await settle(() => callOf('bad.png').progress(0.4));
    await settle(() =>
      callOf('bad.png').fail(new MediaError('backend-failure'))
    );
    expect(status).toHaveTextContent(
      "bad.png couldn't upload. Something went wrong. Please try again."
    );
    const list = await openList(user);
    await user.click(
      within(list).getByRole('button', { name: 'Cancel uploading stop.png' })
    );
    await waitFor(() =>
      expect(status).toHaveTextContent('Cancelled uploading stop.png.')
    );
    await settle(() => callOf('logo-1.png').land());
    await waitFor(() =>
      expect(status).toHaveTextContent(
        'logo.png was taken, saved as logo-1.png'
      )
    );
    observer.disconnect();
    expect(
      read.filter((words) =>
        words.includes("bad.png couldn't upload. Something")
      )
    ).toHaveLength(1);
    expect(read.join(' ')).not.toContain('%');
    expect(uploadStatuses()).toHaveLength(1);
  });
});

describe('uploading on a protected branch', () => {
  const WORDS =
    'main is protected. Switch to another branch to upload, delete or move files.';

  beforeEach(() => {
    localStorage.clear();
  });

  const onMain = async () => {
    renderPane();
    await file('logo.png');
    await waitFor(() => expect(world.currentBranch()).toBe('main'));
  };

  it('turns Upload off with the reason, and nothing uploads', async () => {
    await onMain();
    const button = await uploadButton();
    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveAccessibleDescription(WORDS);
    expect(within(await pane()).getAllByText(WORDS)).toHaveLength(2);
    expect(world.uploadCalls).toEqual([]);
  });

  it('turns a drop away with the same words', async () => {
    await onMain();
    await waitFor(async () => expect(await uploadButton()).toBeDisabled());
    dropOn(await library(), [png('new.png')]);
    expect(await screen.findByRole('alert')).toHaveTextContent(WORDS);
    expect(world.uploadCalls).toEqual([]);
  });

  it('turns Upload on again on an unprotected branch', async () => {
    await onMain();
    await waitFor(async () => expect(await uploadButton()).toBeDisabled());
    act(() => world.switchBranch?.('other'));
    await waitFor(async () => expect(await uploadButton()).toBeEnabled());
  });
});

describe('uploading: a batch is bound to its branch', () => {
  const STOPPED = 'The branch changed, so this stopped.';

  it('stops files that have not started when the branch changes, lets a sending file finish, and uploads nothing to the new branch', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(4));
    await waitFor(() => expect(sending()).toHaveLength(3));
    act(() => world.switchBranch?.('other'));
    const list = await openList(user);
    const stopped = rowOf(list, 'file-4.png');
    expect(within(stopped).getByText(STOPPED)).toBeVisible();
    expect(
      within(stopped).getByRole('button', { name: 'Remove file-4.png' })
    ).toBeVisible();
    expect(within(stopped).queryByRole('button', { name: /Retry/ })).toBeNull();
    await settle(() => callOf('file-1.png').land());
    await settle(() => callOf('file-2.png').land());
    await settle(() => callOf('file-3.png').land());
    expect(world.uploadCalls.map((call) => call.branch)).toEqual([
      'feature/news',
      'feature/news',
      'feature/news',
    ]);
  });

  it('turns a failed row’s Retry into Remove after a branch change, so nothing of the old batch can upload', async () => {
    world.failUpload = () => new MediaError('backend-failure');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    await uploadButton(/couldn't upload$/);
    act(() => world.switchBranch?.('other'));
    world.failUpload = () => null;
    const list = await openList(user);
    const row = rowOf(list, 'new.png');
    expect(within(row).getByText(STOPPED)).toBeVisible();
    expect(
      within(row).getByRole('button', { name: 'Remove new.png' })
    ).toBeVisible();
    expect(within(list).queryByRole('button', { name: /Retry/ })).toBeNull();
    expect(world.uploadCalls).toHaveLength(1);
  });
});

describe('uploading: the permission lock', () => {
  const NO_UPLOAD = "You don't have permission to upload.";
  const NO_DELETE = "You don't have permission to delete.";

  const refuseDelete = async (user: User) => {
    world.failDelete = () => new MediaError('unauthorized');
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
    await screen.findByText(/0 done, 1 left\./);
    await user.click(
      within(await pane()).getByRole('button', { name: 'Back' })
    );
  };

  it('fails the rest of the batch with Remove only, turns Upload off with the reason, turns a drop away, and leaves Delete on', async () => {
    world.holdUploads = true;
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, ...pngs(4));
    await waitFor(() => expect(sending()).toHaveLength(3));
    await settle(() =>
      callOf('file-1.png').fail(new MediaError('unauthorized'))
    );
    await settle(() => callOf('file-2.png').land());
    await settle(() => callOf('file-3.png').land());
    expect(sentNames()).not.toContain('file-4.png');
    const list = await openList(user);
    for (const name of ['file-1.png', 'file-4.png']) {
      const row = rowOf(list, name);
      expect(within(row).getByText(NO_UPLOAD)).toBeVisible();
      expect(
        within(row).getByRole('button', { name: `Remove ${name}` })
      ).toBeVisible();
      expect(within(row).queryByRole('button', { name: /Retry/ })).toBeNull();
    }
    await user.keyboard('{Escape}');
    const button = await uploadButton();
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(NO_UPLOAD);
    expect(
      within(await pane()).getByText(NO_UPLOAD, { selector: 'p' })
    ).toBeVisible();
    fireEvent.dragEnter(await library(), {
      dataTransfer: { types: ['Files'] },
    });
    expect(screen.queryByText('Drop to upload to Media')).toBeNull();
    dropOn(await library(), [png('later.png')]);
    expect(await within(await pane()).findByRole('alert')).toHaveTextContent(
      NO_UPLOAD
    );
    expect(sentNames()).not.toContain('later.png');
    expect(screen.queryByText(NO_DELETE)).toBeNull();
    await user.click(await file('logo.png'));
    expect(
      within(
        await screen.findByRole('region', { name: 'Details of logo.png' })
      ).getByRole('button', { name: 'Delete' })
    ).toBeEnabled();
  });

  it('a delete lock alone leaves Upload on, and with both locks the pane shows both reasons', async () => {
    const user = userEvent.setup();
    renderPane();
    await refuseDelete(user);
    expect(
      within(await pane()).getByText(NO_DELETE, { selector: 'p' })
    ).toBeVisible();
    expect(await uploadButton()).toBeEnabled();
    world.failUpload = () => new MediaError('unauthorized');
    await pick(user, png('new.png'));
    expect(
      await within(await pane()).findByText(NO_UPLOAD, { selector: 'p' })
    ).toBeVisible();
    expect(
      within(await pane()).getByText(NO_DELETE, { selector: 'p' })
    ).toBeVisible();
  });

  it('drops the upload lock after a branch change', async () => {
    world.failUpload = () => new MediaError('unauthorized');
    const user = userEvent.setup();
    renderPane();
    await file('logo.png');
    await pick(user, png('new.png'));
    await openList(user);
    await user.keyboard('{Escape}');
    expect(await uploadButton()).toBeDisabled();
    act(() => world.switchBranch?.('other'));
    await waitFor(async () => expect(await uploadButton()).toBeEnabled());
    expect(within(await pane()).queryByText(NO_UPLOAD)).toBeNull();
  });
});
