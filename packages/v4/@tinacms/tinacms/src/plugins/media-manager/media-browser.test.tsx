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
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../config';
import { branchSliceOf } from '../../core/branch/contract';
import {
  type MediaItem,
  type MediaPage,
  type MediaProvider,
  MediaError,
  type MediaUploadOptions,
  type MediaUrlOptions,
} from '../../core/media/contract';
import { definePlugin } from '../../core/plugin';
import { TinaProvider, useTinaStore } from '../../editor';
import { UploadHost } from '../../editor/uploads/upload-host';
import { toFormId, useFormStore } from '../../form/form-store';
import { MediaBrowser } from './media-browser';
import { MEDIA_EXTENSIONS } from './media-types';

let files: MediaItem[];
let observers: FakeIntersectionObserver[];

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

const childrenOf = (folder: string) => {
  const prefix = folder ? `${folder}/` : '';
  return files.filter(
    ({ path }) =>
      path.startsWith(prefix) && !path.slice(prefix.length).includes('/')
  );
};

const createProvider = (overrides: Partial<MediaProvider> = {}) => {
  const provider = {
    upload: vi.fn(async (file: File, folder = '') => {
      const path = folder ? `${folder}/${file.name}` : file.name;
      files.push({ path, kind: 'file' });
      return path;
    }),
    list: vi.fn(
      async (
        folder: string,
        page: { search?: string; extensions?: string[] } = {}
      ): Promise<MediaPage> => ({
        items: childrenOf(folder).filter(
          ({ path, kind }) =>
            (!page.search || path.includes(page.search)) &&
            (!page.extensions ||
              kind === 'directory' ||
              page.extensions.some((ext) => path.endsWith(`.${ext}`)))
        ),
      })
    ),
    delete: vi.fn(async (path: string) => {
      files = files.filter((item) => item.path !== path);
    }),
    resolveUrl: vi.fn((path: string, options?: MediaUrlOptions) =>
      options
        ? `/uploads/${path}?w=${options.width}&h=${options.height}`
        : `/uploads/${path}`
    ),
    ...overrides,
  };
  return provider;
};

/** An `upload` that the test settles: `sent[n].land()` or `sent[n].fail(cause)`. */
const gatedUpload = () => {
  const sent: {
    name: string;
    folder: string;
    progress: (fraction: number) => void;
    land: () => void;
    fail: (cause: unknown) => void;
  }[] = [];
  const upload = vi.fn(
    (file: File, folder = '', options?: MediaUploadOptions) =>
      new Promise<string>((resolve, reject) => {
        options?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
        sent.push({
          name: file.name,
          folder,
          progress: (fraction) => options?.onProgress?.(fraction),
          land: () => {
            const path = folder ? `${folder}/${file.name}` : file.name;
            files.push({ path, kind: 'file' });
            resolve(path);
          },
          fail: reject,
        });
      })
  );
  return { upload, sent };
};

let switchBranch: (name: string) => void;
let branchReads: number;

// `main` is protected, and the editor starts on it.
const protectedContentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: (_set, get) => {
        switchBranch = (name) => branchSliceOf(get())?.switchTo(name);
        return {
          branches: {
            list: async () => {
              branchReads += 1;
              return [{ name: 'main', protected: true }, { name: 'other' }];
            },
            defaultBranch: async () => 'main',
          },
          list: async () => [],
          get: async () => null,
          update: async () => {
            throw new Error('not used');
          },
        };
      },
    },
  }),
});

const renderBrowser = (
  provider: MediaProvider,
  ui: ReactElement = <MediaBrowser mode='pick' onSelect={() => {}} />,
  { protectedBranch = false } = {}
) => {
  const mediaPlugin = definePlugin({
    name: 'test:media',
    provides: ['media'],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });
  return render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: protectedBranch
          ? [protectedContentPlugin, mediaPlugin]
          : [mediaPlugin],
        schema: { collections: [] },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {ui}
    </TinaProvider>
  );
};

const fileTile = (name: string) => screen.findByRole('button', { name });
const png = (name: string) => new File(['x'], name, { type: 'image/png' });
const fileInput = () => screen.getByLabelText('Choose files to upload');
const dropOf = (dropped: File[]) => ({
  dataTransfer: { files: dropped, types: ['Files'] },
});
const SAVING_FORM = toFormId('content/posts/hello.mdx');

beforeEach(() => {
  files = [
    { path: 'posts', kind: 'directory' },
    { path: 'logo.png', kind: 'file' },
    { path: 'photo.jpg', kind: 'file' },
    { path: 'clip.mp4', kind: 'file' },
    { path: 'notes.pdf', kind: 'file' },
    { path: 'posts/hero.jpg', kind: 'file' },
  ];
  observers = [];
  branchReads = 0;
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MediaBrowser branches', () => {
  it("lists the new branch's files after a switch, not the cached ones", async () => {
    const byBranch: Record<string, MediaItem[]> = {
      main: [{ path: 'main-only.png', kind: 'file' }],
      other: [{ path: 'other-only.png', kind: 'file' }],
    };
    const mediaPlugin = definePlugin({
      name: 'test:media',
      provides: ['media'],
      client: async () => ({
        default: {
          slice: (_set, get) => ({
            ...createProvider(),
            list: async (): Promise<MediaPage> => ({
              items: byBranch[String(get().branch?.current ?? 'main')],
            }),
          }),
        },
      }),
    });
    function SwitchToOther() {
      const switchTo = useTinaStore((state) => state.branch.switchTo) as (
        name: string
      ) => void;
      return (
        <button type='button' onClick={() => switchTo('other')}>
          Use other
        </button>
      );
    }
    const user = userEvent.setup();
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [mediaPlugin],
          schema: { collections: [] },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <SwitchToOther />
        <MediaBrowser mode='pick' onSelect={() => {}} />
      </TinaProvider>
    );
    expect(await fileTile('main-only.png')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Use other' }));
    expect(await fileTile('other-only.png')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'main-only.png' })).toBeNull();
  });
});

describe('MediaBrowser views', () => {
  it('shows folders and files in separate grid sections', async () => {
    renderBrowser(createProvider());
    const folders = await screen.findByRole('list', { name: 'Folders' });
    expect(
      within(folders).getByRole('button', { name: 'posts' })
    ).toBeVisible();
    const fileList = screen.getByRole('list', { name: 'Files' });
    expect(
      within(fileList)
        .getAllByRole('button')
        .map((tile) => tile.getAttribute('aria-label'))
    ).toEqual(['logo.png', 'photo.jpg', 'clip.mp4', 'notes.pdf']);
    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('loads grid thumbnails at 400x400 and marks the type', async () => {
    const provider = createProvider();
    renderBrowser(provider);
    expect(
      await screen.findByRole('img', { name: 'logo.png' })
    ).toHaveAttribute('src', '/uploads/logo.png?w=400&h=400');
    expect(within(await fileTile('photo.jpg')).getByText('JPEG')).toBeVisible();
    const video = await fileTile('clip.mp4');
    expect(within(video).queryByRole('img')).toBeNull();
    expect(within(video).getByText('MP4')).toBeVisible();
  });

  it('switches to a list view with 75x75 thumbnails', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await screen.findByRole('list', { name: 'Files' });
    await user.click(screen.getByRole('button', { name: 'List view' }));
    const list = screen.getByRole('list', { name: 'Media' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(within(list).getByRole('img', { name: 'logo.png' })).toHaveAttribute(
      'src',
      '/uploads/logo.png?w=75&h=75'
    );
    expect(screen.queryByRole('list', { name: 'Folders' })).toBeNull();
  });

  it('shows the empty state for an empty folder', async () => {
    files = [];
    renderBrowser(createProvider());
    expect(await screen.findByText('Drag and drop assets here')).toBeVisible();
  });

  it('filters to folders or files on the client', async () => {
    const user = userEvent.setup();
    files = [{ path: 'logo.png', kind: 'file' }];
    renderBrowser(createProvider());
    await fileTile('logo.png');
    await user.click(screen.getByRole('button', { name: 'Folders' }));
    expect(screen.getByText('No folders here')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'logo.png' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Files' }));
    expect(await fileTile('logo.png')).toBeVisible();
  });

  it('shows "No files here" for a folder with folders only', async () => {
    const user = userEvent.setup();
    files = [{ path: 'posts', kind: 'directory' }];
    renderBrowser(createProvider());
    await screen.findByRole('button', { name: 'posts' });
    await user.click(screen.getByRole('button', { name: 'Files' }));
    expect(screen.getByText('No files here')).toBeVisible();
  });
});

describe('MediaBrowser preview panel', () => {
  it('opens a file, and closes it on a second click', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await user.click(await fileTile('logo.png'));
    const details = screen.getByRole('complementary', {
      name: 'Details of logo.png',
    });
    expect(
      within(details).getByRole('img', { name: 'logo.png' })
    ).toHaveAttribute('src', '/uploads/logo.png?w=1000&h=1000');
    expect(await fileTile('logo.png')).toHaveAttribute('aria-pressed', 'true');
    await user.click(await fileTile('logo.png'));
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('closes with the close button', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('copies the absolute URL of the file', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await user.click(await fileTile('logo.png'));
    const url = `${window.location.origin}/uploads/logo.png`;
    await user.click(screen.getByRole('button', { name: `Copy URL ${url}` }));
    expect(await navigator.clipboard.readText()).toBe(url);
    expect(
      within(screen.getByRole('complementary')).getAllByText(
        'Copied to clipboard!'
      ).length
    ).toBeGreaterThan(0);
  });
});

describe('MediaBrowser folders', () => {
  it('opens a folder and returns through the breadcrumb in pick mode', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderBrowser(provider, <MediaBrowser mode='pick' onSelect={() => {}} />);
    await user.click(await screen.findByRole('button', { name: 'posts' }));
    expect(await fileTile('hero.jpg')).toBeVisible();
    expect(provider.list).toHaveBeenLastCalledWith(
      'posts',
      expect.objectContaining({ cursor: undefined })
    );
    await user.click(screen.getByRole('button', { name: 'Media' }));
    expect(await fileTile('logo.png')).toBeVisible();
  });

  it('opens a new folder from the New Folder dialog', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.click(screen.getByRole('button', { name: 'New Folder' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/the folder disappears/)).toBeVisible();
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Folder name' }),
      'drafts'
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Create New Folder' })
    );
    await waitFor(() =>
      expect(provider.list).toHaveBeenLastCalledWith(
        'drafts',
        expect.anything()
      )
    );
    expect(
      within(
        screen.getByRole('navigation', { name: 'Media folders' })
      ).getByText('drafts')
    ).toHaveAttribute('aria-current', 'page');
  });
});

describe('MediaBrowser upload', () => {
  it('uploads to the open folder, puts the new file first and selects it', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderBrowser(provider);
    await user.click(await screen.findByRole('button', { name: 'posts' }));
    await fileTile('hero.jpg');
    await user.upload(fileInput(), png('new.png'));
    expect(provider.upload).toHaveBeenCalledWith(
      expect.any(File),
      'posts',
      expect.anything()
    );
    const tile = await fileTile('new.png (new)');
    expect(within(tile).getByText('New')).toBeVisible();
    const tiles = within(
      screen.getByRole('list', { name: 'Files' })
    ).getAllByRole('button');
    expect(tiles[0]).toBe(tile);
    await waitFor(() => expect(provider.list).toHaveBeenCalledTimes(3));
    expect(
      within(screen.getByRole('list', { name: 'Files' }))
        .getAllByRole('button')
        .map((each) => each.getAttribute('aria-label'))
    ).toEqual(['new.png (new)', 'hero.jpg']);
    expect(
      screen.getByRole('complementary', { name: 'Details of new.png' })
    ).toBeVisible();
  });

  it('keeps Upload as the last toolbar control through idle, running, failed and done', async () => {
    const user = userEvent.setup();
    const { upload, sent } = gatedUpload();
    renderBrowser(createProvider({ upload }));
    await fileTile('logo.png');
    const idle = screen.getByRole('button', { name: 'Upload' });
    expect(
      idle.compareDocumentPosition(
        screen.getByRole('button', { name: 'New Folder' })
      ) & Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
    expect(
      idle.compareDocumentPosition(
        screen.getByRole('button', { name: 'Grid view' })
      ) & Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();

    await user.upload(fileInput(), [png('one.png'), png('two.png')]);
    const running = await screen.findByRole('button', {
      name: 'Uploading 1 of 2',
    });
    expect(running).toBeEnabled();
    act(() => sent[0]?.progress(0.4));
    await user.click(running);
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText(/^Uploading 40% · /)).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Cancel uploading two.png' })
    ).toBeVisible();

    await act(async () => {
      sent[0]?.land();
      sent[1]?.fail(new MediaError('backend-failure'));
    });
    expect(
      within(list).getByText('Something went wrong. Please try again.')
    ).toBeVisible();
    await user.keyboard('{Escape}');
    expect(
      await screen.findByRole('button', { name: /^Upload\b.*couldn't upload/ })
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: /^Upload\b.*couldn't upload/ })
    );
    await user.click(
      await screen.findByRole('button', { name: 'Retry uploading two.png' })
    );
    await waitFor(() => expect(sent).toHaveLength(3));
    await act(async () => sent[2]?.land());
    expect(
      await screen.findByRole('button', { name: '2 uploaded' })
    ).toBeVisible();
    expect(
      screen.getByRole('complementary', { name: 'Details of two.png' })
    ).toBeVisible();
  });

  it('does not select a landed file after the picker moved to another folder', async () => {
    const user = userEvent.setup();
    const { upload, sent } = gatedUpload();
    renderBrowser(createProvider({ upload }));
    await fileTile('logo.png');
    await user.upload(fileInput(), png('late.png'));
    await waitFor(() => expect(sent).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: 'posts' }));
    await fileTile('hero.jpg');
    await act(async () => sent[0]?.land());
    expect(sent[0]?.folder).toBe('');
    expect(
      await screen.findByRole('button', { name: '1 uploaded' })
    ).toBeVisible();
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.queryByRole('button', { name: /late\.png/ })).toBeNull();
  });

  describe('with a branch in view', () => {
    beforeEach(() => {
      localStorage.setItem(
        'tina-store',
        JSON.stringify({ state: { branch: { current: 'other' } }, version: 0 })
      );
      // Both branches hold the file, so the tile is there to select after the switch.
      files.push({ path: 'late.png', kind: 'file' });
    });
    afterEach(() => localStorage.removeItem('tina-store'));

    const sendLate = async () => {
      const user = userEvent.setup();
      let land = () => {};
      const upload = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            land = () => resolve('late.png');
          })
      );
      renderBrowser(createProvider({ upload }), undefined, {
        protectedBranch: true,
      });
      await fileTile('late.png');
      await user.upload(fileInput(), png('late.png'));
      await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
      return () => land();
    };

    it('selects a file that lands on the branch in view', async () => {
      const land = await sendLate();
      await act(async () => land());
      expect(
        await screen.findByRole('complementary', {
          name: 'Details of late.png',
        })
      ).toBeVisible();
    });

    it('does not select a file that lands after the branch changed', async () => {
      const land = await sendLate();
      act(() => switchBranch('main'));
      await act(async () => land());
      expect(
        await screen.findByRole('button', { name: '1 uploaded' })
      ).toBeVisible();
      expect(await fileTile('late.png')).toBeVisible();
      expect(screen.queryByRole('complementary')).toBeNull();
    });
  });

  it("refuses a type outside a provider's list of extensions before a request, and a picker with accept uses its own rules", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const provider = createProvider({
      features: { acceptedExtensions: [...MEDIA_EXTENSIONS] },
    });
    const { unmount } = renderBrowser(provider);
    await fileTile('logo.png');
    await user.upload(fileInput(), [
      new File(['x'], 'notes.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    ]);
    await user.click(
      await screen.findByRole('button', { name: /^Upload\b.*couldn't upload/ })
    );
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(
      within(list).getByText("This file type can't be uploaded here.")
    ).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Remove notes.docx' })
    ).toBeVisible();
    expect(provider.upload).not.toHaveBeenCalled();
    unmount();

    renderBrowser(
      provider,
      <MediaBrowser mode='pick' accept='image' onSelect={() => {}} />
    );
    await fileTile('logo.png');
    await user.upload(fileInput(), [
      new File(['x'], 'song.mp3', { type: 'audio/mpeg' }),
      new File(['x'], 'notes.pdf', { type: 'image/png' }),
    ]);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /^Upload\b.*couldn't upload/ })
      ).toBeVisible()
    );
    expect(provider.upload).not.toHaveBeenCalled();
  });

  it('lists a file over maxSize or of a refused type with Remove only', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const provider = createProvider({
      features: { acceptedMimeTypes: ['image/*'], maxSize: 4 },
    });
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.upload(fileInput(), [
      new File(['x'], 'doc.pdf', { type: 'application/pdf' }),
      new File(['too large'], 'big.png', { type: 'image/png' }),
      png('ok.png'),
    ]);
    expect(await fileTile('ok.png (new)')).toBeVisible();
    expect(provider.upload).toHaveBeenCalledTimes(1);
    await user.click(
      screen.getByRole('button', { name: /^Upload\b.*couldn't upload/ })
    );
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(
      within(list).getByText("This file type can't be uploaded here.")
    ).toBeVisible();
    expect(within(list).getByText(/^Too large\. The limit is/)).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Remove doc.pdf' })
    ).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Remove big.png' })
    ).toBeVisible();
    expect(within(list).queryByRole('button', { name: /^Retry/ })).toBeNull();
  });

  it('shows a failure from the provider in the list with Retry', async () => {
    const user = userEvent.setup();
    const provider = createProvider({
      upload: vi.fn(async () => {
        throw new Error('disk full');
      }),
    });
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.upload(fileInput(), png('new.png'));
    await user.click(
      await screen.findByRole('button', { name: /^Upload\b.*couldn't upload/ })
    );
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(
      within(list).getByText(
        "Couldn't upload. Check your connection, then retry."
      )
    ).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Retry uploading new.png' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('uploads dropped files and highlights the drop zone for a drag of files only', async () => {
    const provider = createProvider();
    renderBrowser(provider);
    await fileTile('logo.png');
    const zone = screen.getByRole('region', { name: 'Media library' });
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['text/plain'] } });
    expect(zone).not.toHaveAttribute('data-dragging');
    fireEvent.drop(zone, {
      dataTransfer: { files: [png('text.png')], types: ['text/plain'] },
    });
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'] } });
    expect(zone).toHaveAttribute('data-dragging', 'true');
    fireEvent.drop(zone, dropOf([png('dropped.png')]));
    expect(zone).not.toHaveAttribute('data-dragging');
    expect(await fileTile('dropped.png (new)')).toBeVisible();
    expect(provider.upload).toHaveBeenCalledTimes(1);
  });

  it('turns a dropped folder away in words', async () => {
    const provider = createProvider();
    renderBrowser(provider);
    await fileTile('logo.png');
    fireEvent.drop(screen.getByRole('region', { name: 'Media library' }), {
      dataTransfer: {
        files: [new File([], 'photos')],
        types: ['Files'],
        items: [{ webkitGetAsEntry: () => ({ isDirectory: true }) }],
      },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Folders can't be uploaded. Drop the files instead."
    );
    expect(provider.upload).not.toHaveBeenCalled();
  });

  it('resets a Folders filter after an upload', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await fileTile('logo.png');
    await user.click(screen.getByRole('button', { name: 'Folders' }));
    await user.upload(fileInput(), png('new.png'));
    expect(await fileTile('new.png (new)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('drops the New mark once the picker leaves the folder', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await fileTile('logo.png');
    await user.upload(fileInput(), png('new.png'));
    await fileTile('new.png (new)');
    await user.click(screen.getByRole('button', { name: 'posts' }));
    await fileTile('hero.jpg');
    await user.click(screen.getByRole('button', { name: 'Media' }));
    expect(await fileTile('new.png')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'new.png (new)' })).toBeNull();
  });
});

describe('MediaBrowser upload with no TinaAdmin above it', () => {
  afterEach(() => {
    act(() => useFormStore.getState().clearSavePhase(SAVING_FORM));
  });

  it('shows progress and the result, and reads them in one polite status', async () => {
    const user = userEvent.setup();
    const { upload, sent } = gatedUpload();
    const { container } = renderBrowser(createProvider({ upload }));
    await fileTile('logo.png');
    await user.upload(fileInput(), png('solo.png'));
    const running = await screen.findByRole('button', { name: 'Uploading' });
    const statuses = container.ownerDocument.querySelectorAll(
      '[data-upload-status]'
    );
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveTextContent('Uploading solo.png to Media.');
    act(() => sent[0]?.progress(0.5));
    await user.click(running);
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(within(list).getByText(/^Uploading 50% · /)).toBeVisible();
    await act(async () => sent[0]?.land());
    expect(within(list).getByText('Uploaded to Media')).toBeVisible();
    expect(await fileTile('solo.png (new)')).toBeVisible();
    expect(statuses[0]).toHaveTextContent(/uploaded/i);
    expect(statuses[0]?.textContent).not.toMatch(/%/);
  });

  it('draws one polite status and reads the branches once for two pickers and a host above them', async () => {
    const { container } = renderBrowser(
      createProvider(),
      <>
        <UploadHost />
        <MediaBrowser mode='pick' onSelect={() => {}} />
        <MediaBrowser mode='pick' onSelect={() => {}} />
      </>,
      { protectedBranch: true }
    );
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'logo.png' })).toHaveLength(
        2
      )
    );
    expect(
      container.ownerDocument.querySelectorAll('[data-upload-status]')
    ).toHaveLength(1);
    expect(branchReads).toBe(1);
  });

  it('turns files away with the reason while a save runs', async () => {
    const provider = createProvider();
    renderBrowser(provider);
    await fileTile('logo.png');
    act(() =>
      useFormStore.getState().setSavePhase(SAVING_FORM, { phase: 'saving' })
    );
    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(
      'Saving. You can upload once it finishes.'
    );
    const zone = screen.getByRole('region', { name: 'Media library' });
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'] } });
    expect(zone).not.toHaveAttribute('data-dragging');
    fireEvent.drop(zone, dropOf([png('dropped.png')]));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Saving. You can upload once it finishes.'
    );
    expect(provider.upload).not.toHaveBeenCalled();

    act(() => useFormStore.getState().clearSavePhase(SAVING_FORM));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();
  });
});

describe('MediaBrowser upload on a protected branch', () => {
  const words =
    'main is protected. Switch to another branch to upload, delete or move files.';

  it('turns files away with the reason', async () => {
    const provider = createProvider();
    renderBrowser(provider, <MediaBrowser mode='pick' onSelect={() => {}} />, {
      protectedBranch: true,
    });
    await fileTile('logo.png');
    const button = screen.getByRole('button', { name: 'Upload' });
    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveAccessibleDescription(words);
    const zone = screen.getByRole('region', { name: 'Media library' });
    fireEvent.drop(zone, dropOf([png('summit.png')]));
    expect(await screen.findByRole('alert')).toHaveTextContent(words);
    expect(provider.upload).not.toHaveBeenCalled();
  });
});

describe('MediaBrowser search and type filter', () => {
  it('hides search and type filter when the provider lacks them', async () => {
    renderBrowser(createProvider());
    await fileTile('logo.png');
    expect(
      screen.queryByRole('searchbox', { name: 'Search media library' })
    ).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'File type' })).toBeNull();
  });

  it('passes a debounced search to list', async () => {
    const user = userEvent.setup();
    const provider = createProvider({ features: { search: true } });
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.type(
      screen.getByRole('searchbox', { name: 'Search media library' }),
      'zzz'
    );
    expect(await screen.findByText('No media matches “zzz”')).toBeVisible();
    expect(provider.list).toHaveBeenLastCalledWith(
      '',
      expect.objectContaining({ search: 'zzz' })
    );
    expect(provider.list).not.toHaveBeenCalledWith(
      '',
      expect.objectContaining({ search: 'z' })
    );
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(await fileTile('logo.png')).toBeVisible();
  });

  it('passes the extensions of a type to list', async () => {
    const user = userEvent.setup();
    const provider = createProvider({ features: { extensionFilter: true } });
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.click(screen.getByRole('combobox', { name: 'File type' }));
    await user.click(await screen.findByRole('option', { name: 'Video' }));
    await waitFor(() =>
      expect(provider.list).toHaveBeenLastCalledWith(
        '',
        expect.objectContaining({ extensions: ['mp4', 'webm', 'mov'] })
      )
    );
    expect(await fileTile('clip.mp4')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'logo.png' })).toBeNull();
  });

  it('puts the type filter and kind toggle in a wrapping row', async () => {
    const provider = createProvider({ features: { extensionFilter: true } });
    renderBrowser(provider);
    await fileTile('logo.png');
    const row = screen
      .getByRole('combobox', { name: 'File type' })
      .closest('.ml-auto');
    expect(row).toHaveClass('flex-wrap');
    expect(row).toContainElement(screen.getByRole('group', { name: 'Show' }));
  });
});

describe('MediaBrowser infinite scroll', () => {
  it('fetches the next page when the sentinel scrolls into view', async () => {
    const provider = createProvider({
      list: vi.fn(async (_folder: string, page: { cursor?: string } = {}) =>
        page.cursor === 'page-2'
          ? { items: [{ path: 'second.png', kind: 'file' as const }] }
          : {
              items: [{ path: 'first.png', kind: 'file' as const }],
              cursor: 'page-2',
            }
      ),
    });
    renderBrowser(provider);
    await fileTile('first.png');
    await waitFor(() => expect(observers).toHaveLength(1));
    observers[0]?.intersect();
    expect(await fileTile('second.png')).toBeVisible();
    expect(provider.list).toHaveBeenLastCalledWith(
      '',
      expect.objectContaining({ cursor: 'page-2' })
    );
    expect(
      screen.queryByRole('status', { name: 'Loading more media' })
    ).toBeNull();
  });
});

describe('MediaBrowser provider features', () => {
  it('hides the toolbar when read-only', async () => {
    const user = userEvent.setup();
    renderBrowser(
      createProvider({
        features: { readOnly: true },
        rename: vi.fn(async (_from: string, to: string) => to),
      })
    );
    await user.click(await fileTile('logo.png'));
    for (const name of ['Refresh', 'New Folder', 'Upload']) {
      expect(screen.queryByRole('button', { name })).toBeNull();
    }
  });

  it('shows the setup banner when the provider needs setup', async () => {
    renderBrowser(
      createProvider({
        status: async () => ({
          kind: 'needs-setup',
          message: 'Media needs to be turned on for this project.',
          actionLabel: 'Sync Your Media In TinaCloud.',
          actionUrl: 'https://app.tina.io/media',
        }),
      })
    );
    expect(
      await screen.findByText('Media needs to be turned on for this project.')
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Sync Your Media In TinaCloud.' })
    ).toHaveAttribute('href', 'https://app.tina.io/media');
    expect(screen.queryByRole('list', { name: 'Files' })).toBeNull();
  });
});

describe('MediaBrowser pick mode', () => {
  it('inserts the active file', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderBrowser(
      createProvider(),
      <MediaBrowser mode='pick' onSelect={onSelect} />
    );
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Insert' }));
    expect(onSelect).toHaveBeenCalledWith({ path: 'logo.png', kind: 'file' });
  });

  it('offers no Rename and no Delete, with a provider that can rename', async () => {
    const user = userEvent.setup();
    renderBrowser(
      createProvider({
        rename: vi.fn(async (_from: string, to: string) => to),
      })
    );
    await user.click(await fileTile('logo.png'));
    expect(screen.getByRole('button', { name: 'Insert' })).toBeVisible();
    for (const name of ['Rename', 'Delete']) {
      expect(screen.queryByRole('button', { name })).toBeNull();
    }
  });

  it('locks the type filter to accept and lists only those files', async () => {
    const provider = createProvider({ features: { extensionFilter: true } });
    renderBrowser(
      provider,
      <MediaBrowser mode='pick' onSelect={() => {}} accept='image' />
    );
    expect(await screen.findByText('Images only')).toBeVisible();
    expect(
      screen.getByText(
        'This field accepts jpg, jpeg, png, gif, webp, svg, avif, ico'
      )
    ).toHaveClass('sr-only');
    expect(screen.queryByRole('combobox', { name: 'File type' })).toBeNull();
    expect(provider.list).toHaveBeenCalledWith(
      '',
      expect.objectContaining({
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'ico'],
      })
    );
    expect(await fileTile('logo.png')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'clip.mp4' })).toBeNull();
  });

  it('counts the accepted types when there are more than three', async () => {
    renderBrowser(
      createProvider({ features: { extensionFilter: true } }),
      <MediaBrowser
        mode='pick'
        onSelect={() => {}}
        accept={['png', 'gif', 'pdf', 'mp4']}
      />
    );
    expect(await screen.findByText('4 types only')).toBeVisible();
  });

  it('rejects an upload outside accept', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const provider = createProvider();
    renderBrowser(
      provider,
      <MediaBrowser mode='pick' onSelect={() => {}} accept='image' />
    );
    await fileTile('logo.png');
    await user.upload(
      fileInput(),
      new File(['x'], 'clip.mov', { type: 'video/quicktime' })
    );
    await user.click(
      await screen.findByRole('button', { name: /^Upload\b.*couldn't upload/ })
    );
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(
      within(list).getByText("This file type can't be uploaded here.")
    ).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Remove clip.mov' })
    ).toBeVisible();
    expect(within(list).queryByRole('button', { name: /^Retry/ })).toBeNull();
    expect(provider.upload).not.toHaveBeenCalled();
  });
});
