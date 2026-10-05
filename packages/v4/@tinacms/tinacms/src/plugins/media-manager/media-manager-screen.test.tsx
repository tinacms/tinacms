import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TinaAdmin } from '../../admin/admin';
import { asResolvedConfig } from '../../config';
import type {
  MediaItem,
  MediaPage,
  MediaProvider,
} from '../../core/media/contract';
import { definePlugin } from '../../core/plugin';
import { validateCapabilityGraph } from '../../core/resolve';
import { mediaManagerPlugin } from './media-manager.plugin';

let files: MediaItem[];
let failList: Error | null;
let listGate: Promise<void>;

const fakeMedia = {
  upload: vi.fn(async (file: File, folder = '') => {
    const path = folder ? `${folder}/${file.name}` : file.name;
    files.push({ path, kind: 'file' });
    return path;
  }),
  list: vi.fn(async (folder: string): Promise<MediaPage> => {
    await listGate;
    if (failList) throw failList;
    const prefix = folder ? `${folder}/` : '';
    return {
      items: files.filter(
        ({ path }) =>
          path.startsWith(prefix) && !path.slice(prefix.length).includes('/')
      ),
    };
  }),
  delete: vi.fn(async (path: string) => {
    files = files.filter((item) => item.path !== path);
  }),
  resolveUrl: (path: string) => `/uploads/${path}`,
} satisfies MediaProvider;

const fakeMediaPlugin = definePlugin({
  name: 'test:media',
  provides: ['media'],
  client: async () => ({ default: { slice: () => ({ ...fakeMedia }) } }),
});

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: async () => [],
        get: async () => null,
        update: async () => {
          throw new Error('not used');
        },
      }),
    },
  }),
});

const renderMediaManager = (hash = '#/screens/media') => {
  window.location.hash = hash;
  return render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [contentPlugin, fakeMediaPlugin, mediaManagerPlugin()],
        schema: { collections: [] },
        build: { publicFolder: 'public', outputFolder: 'admin' },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );
};

beforeEach(() => {
  files = [
    { path: 'posts', kind: 'directory' },
    { path: 'logo.png', kind: 'file' },
    { path: 'posts/hero.jpg', kind: 'file' },
  ];
  failList = null;
  listGate = Promise.resolve();
  vi.clearAllMocks();
});

describe('media manager plugin', () => {
  it('refuses to start without a media plugin', () => {
    expect(() =>
      validateCapabilityGraph([contentPlugin, mediaManagerPlugin()])
    ).toThrow(/depends on the "media" capability/);
  });

  it('adds a Media entry to the sidebar that opens the screen', async () => {
    const user = userEvent.setup();
    renderMediaManager('#/');
    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await waitFor(() => expect(window.location.hash).toBe('#/screens/media'));
    expect(await screen.findByRole('list', { name: 'Files' })).toBeVisible();
  });
});

describe('media manager screen', () => {
  it('shows a loading state, then the folder', async () => {
    let release = () => {};
    listGate = new Promise((resolve) => {
      release = resolve;
    });
    renderMediaManager();
    expect(
      await screen.findByRole('status', { name: 'Loading media' })
    ).toBeVisible();
    release();
    expect(await screen.findByRole('list', { name: 'Folders' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'logo.png' })).toHaveAttribute(
      'src',
      '/uploads/logo.png'
    );
  });

  it('opens the folder in the URL', async () => {
    renderMediaManager('#/screens/media/posts');
    expect(await screen.findByRole('img', { name: 'hero.jpg' })).toBeVisible();
    expect(fakeMedia.list).toHaveBeenLastCalledWith(
      'posts',
      expect.objectContaining({ cursor: undefined })
    );
  });

  it('writes an opened folder to the URL, and the breadcrumb goes back', async () => {
    const user = userEvent.setup();
    renderMediaManager();
    await user.click(await screen.findByRole('button', { name: 'posts' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/screens/media/posts')
    );
    expect(await screen.findByRole('img', { name: 'hero.jpg' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Parent folder' }));
    await waitFor(() => expect(window.location.hash).toBe('#/screens/media'));
    expect(await screen.findByRole('img', { name: 'logo.png' })).toBeVisible();
  });

  it('shows an error state and retries', async () => {
    failList = new Error('disk unavailable');
    const user = userEvent.setup();
    renderMediaManager();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load media: disk unavailable'
    );
    failList = null;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('list', { name: 'Files' })).toBeVisible();
  });

  it('uploads into the folder in the URL', async () => {
    const user = userEvent.setup();
    renderMediaManager('#/screens/media/posts');
    await screen.findByRole('list', { name: 'Files' });
    await user.upload(
      screen.getByLabelText('Choose files to upload'),
      new File(['x'], 'new.png', { type: 'image/png' })
    );
    expect(fakeMedia.upload).toHaveBeenCalledWith(expect.any(File), 'posts');
    expect(
      await screen.findByRole('button', { name: 'new.png (new)' })
    ).toBeVisible();
  });
});
