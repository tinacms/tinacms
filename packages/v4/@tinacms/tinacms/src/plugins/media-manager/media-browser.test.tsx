import { QueryClient } from '@tanstack/react-query';
import {
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
import {
  type MediaItem,
  type MediaPage,
  type MediaProvider,
  MediaRenameError,
  type MediaUrlOptions,
} from '../../core/media/contract';
import { definePlugin } from '../../core/plugin';
import { TinaProvider } from '../../editor';
import { MediaBrowser } from './media-browser';

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

const renderBrowser = (
  provider: MediaProvider,
  ui: ReactElement = <MediaBrowser mode='manage' />
) => {
  const mediaPlugin = definePlugin({
    name: 'test:media',
    provides: ['media'],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });
  return render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [mediaPlugin],
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
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
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
      ).getByRole('button', { name: 'drafts' })
    ).toHaveAttribute('aria-current', 'page');
  });
});

describe('MediaBrowser upload', () => {
  it('uploads to the open folder and puts the new file first', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.upload(
      screen.getByLabelText('Upload'),
      new File(['x'], 'new.png', { type: 'image/png' })
    );
    expect(provider.upload).toHaveBeenCalledWith(expect.any(File), '');
    const tile = await fileTile('new.png (new)');
    expect(within(tile).getByText('NEW')).toBeVisible();
    expect(
      within(screen.getByRole('list', { name: 'Files' })).getAllByRole(
        'button'
      )[0]
    ).toBe(tile);
    expect(
      screen.getByRole('complementary', { name: 'Details of new.png' })
    ).toBeVisible();
  });

  it('rejects files outside accept or over maxSize', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const provider = createProvider({
      features: { acceptedMimeTypes: ['image/*'], maxSize: 4 },
    });
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.upload(screen.getByLabelText('Upload'), [
      new File(['x'], 'doc.pdf', { type: 'application/pdf' }),
      new File(['too large'], 'big.png', { type: 'image/png' }),
      new File(['x'], 'ok.png', { type: 'image/png' }),
    ]);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('doc.pdf: Invalid file type');
    expect(alert).toHaveTextContent('big.png: File too large');
    expect(provider.upload).toHaveBeenCalledTimes(1);
    expect(await fileTile('ok.png (new)')).toBeVisible();
  });

  it('shows a failure from the provider', async () => {
    const user = userEvent.setup();
    const provider = createProvider({
      upload: vi.fn(async () => {
        throw new Error('disk full');
      }),
    });
    renderBrowser(provider);
    await fileTile('logo.png');
    await user.upload(
      screen.getByLabelText('Upload'),
      new File(['x'], 'new.png', { type: 'image/png' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'new.png: disk full'
    );
  });

  it('uploads dropped files and highlights the drop zone', async () => {
    const provider = createProvider();
    renderBrowser(provider);
    await fileTile('logo.png');
    const zone = screen.getByRole('region', { name: 'Media library' });
    fireEvent.dragEnter(zone);
    expect(zone).toHaveAttribute('data-dragging', 'true');
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [new File(['x'], 'dropped.png', { type: 'image/png' })],
      },
    });
    expect(zone).not.toHaveAttribute('data-dragging');
    expect(await fileTile('dropped.png (new)')).toBeVisible();
  });

  it('resets a Folders filter after an upload', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await fileTile('logo.png');
    await user.click(screen.getByRole('button', { name: 'Folders' }));
    await user.upload(
      screen.getByLabelText('Upload'),
      new File(['x'], 'new.png', { type: 'image/png' })
    );
    expect(await fileTile('new.png (new)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
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

describe('MediaBrowser rename', () => {
  it('offers no Rename without provider support', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await user.click(await fileTile('logo.png'));
    expect(screen.queryByRole('button', { name: 'Rename' })).toBeNull();
  });

  it('renames the base name and keeps the extension', async () => {
    const user = userEvent.setup();
    const rename = vi.fn(async (from: string, to: string) => {
      files = files.map((item) =>
        item.path === from ? { ...item, path: to } : item
      );
      return to;
    });
    renderBrowser(createProvider({ rename }));
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(
      within(dialog).getByText(/does not update existing content/)
    ).toBeVisible();
    const input = within(dialog).getByRole('textbox', { name: 'File name' });
    await user.clear(input);
    await user.type(input, 'my logo');
    expect(dialog).toHaveTextContent('Will be saved as my-logo.png');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(rename).toHaveBeenCalledWith('logo.png', 'my-logo.png');
    expect(
      await screen.findByRole('complementary', {
        name: 'Details of my-logo.png',
      })
    ).toBeVisible();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('shows the message for a rename error code', async () => {
    const user = userEvent.setup();
    const rename = vi.fn(async () => {
      throw new MediaRenameError('name-taken', 'exists');
    });
    renderBrowser(createProvider({ rename }));
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    const dialog = await screen.findByRole('alertdialog');
    const input = within(dialog).getByRole('textbox', { name: 'File name' });
    await user.clear(input);
    await user.type(input, 'photo');
    await user.click(within(dialog).getByRole('button', { name: 'Rename' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'A file named "photo.png" already exists in this folder. Choose a different name.'
    );
  });
});

describe('MediaBrowser delete', () => {
  it('deletes the active file after confirmation', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderBrowser(provider);
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'Are you sure you want to delete logo.png?'
    );
    expect(provider.delete).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(provider.delete).toHaveBeenCalledWith('logo.png');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'logo.png' })).toBeNull()
    );
  });

  it('keeps the file when the delete is cancelled', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderBrowser(provider);
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Cancel',
      })
    );
    expect(provider.delete).not.toHaveBeenCalled();
    expect(await fileTile('logo.png')).toBeVisible();
  });

  it('shows a delete failure', async () => {
    const user = userEvent.setup();
    renderBrowser(
      createProvider({
        delete: vi.fn(async () => {
          throw new Error('locked');
        }),
      })
    );
    await user.click(await fileTile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete logo.png.locked'
    );
  });
});

describe('MediaBrowser provider features', () => {
  it('hides the toolbar, rename and delete when read-only', async () => {
    const user = userEvent.setup();
    renderBrowser(
      createProvider({
        features: { readOnly: true },
        rename: vi.fn(async (_from: string, to: string) => to),
      })
    );
    await user.click(await fileTile('logo.png'));
    for (const name of [
      'Refresh',
      'New Folder',
      'Upload',
      'Rename',
      'Delete',
    ]) {
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

  it('offers no Insert in manage mode', async () => {
    const user = userEvent.setup();
    renderBrowser(createProvider());
    await user.click(await fileTile('logo.png'));
    expect(screen.queryByRole('button', { name: 'Insert' })).toBeNull();
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
      screen.getByLabelText('Upload'),
      new File(['x'], 'clip.mov', { type: 'video/quicktime' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'clip.mov: Invalid file type'
    );
    expect(provider.upload).not.toHaveBeenCalled();
  });
});
