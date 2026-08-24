import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { EventBus } from '@toolkit/core/event';
import { MediaManager as MediaManagerCore } from '@toolkit/core/media';
import type { Media, MediaStore } from '@toolkit/core/media';
import { CMSContext } from '@toolkit/react-core/use-cms';
import { ModalProvider } from '@toolkit/react-modals';
import React from 'react';
import { MediaPicker } from './media-manager';

vi.mock('../../../lib/posthog/posthogProvider', () => ({
  captureEvent: vi.fn(),
}));

const file = (filename: string, directory = ''): Media => ({
  type: 'file',
  id: filename,
  filename,
  directory,
  src: `/uploads/${directory ? `${directory}/` : ''}${filename}`,
  thumbnails: {
    '75x75': `/uploads/${filename}`,
    '400x400': `/uploads/${filename}`,
    '1000x1000': `/uploads/${filename}`,
  },
});

const buildCms = (
  storeOverrides: Partial<MediaStore> = {},
  items = [file('photo.jpg')]
) => {
  const events = new EventBus();
  const store: MediaStore = {
    accept: '*',
    async persist() {
      return [];
    },
    async delete() {},
    async list() {
      return { items, nextOffset: undefined };
    },
    ...storeOverrides,
  };
  const media = new MediaManagerCore(store, events);
  const cms = {
    media,
    events,
    alerts: { error: vi.fn(), success: vi.fn(), warn: vi.fn(), info: vi.fn() },
    api: {
      tina: {
        isLocalMode: true,
        schema: { schema: { config: { media: { tina: {} } } } },
        getProject: vi.fn().mockResolvedValue({ mediaBranch: 'main' }),
        appDashboardLink: 'https://app.tina.io',
      },
    },
  };
  return { cms, events, store, media };
};

const withCms = (cms: any, children: React.ReactNode) => (
  <ModalProvider>
    <CMSContext.Provider value={{ cms, dispatch: vi.fn(), state: {} } as any}>
      {children}
    </CMSContext.Provider>
  </ModalProvider>
);

const renderPicker = (cms: any, props: any = {}) =>
  render(withCms(cms, <MediaPicker allowDelete={true} {...props} />));

const openPreview = async (filename: string) => {
  const item = await screen.findByTitle(filename);
  fireEvent.click(item);
};

// The picker and the open modal both render a "Rename" label; modals portal
// into #modal-root, so scope to it to tell them apart.
const modal = () => within(document.getElementById('modal-root'));

const submitRename = async (newBase: string) => {
  fireEvent.click(await screen.findByText('Rename'));
  fireEvent.change(screen.getByPlaceholderText('File name'), {
    target: { value: newBase },
  });
  fireEvent.click(modal().getByText('Rename').closest('button'));
};

describe('MediaPicker rename action', () => {
  it('shows Rename when the store implements it', async () => {
    const { cms } = buildCms({ rename: vi.fn() });
    renderPicker(cms);

    await openPreview('photo.jpg');
    expect(await screen.findByText('Rename')).toBeDefined();
  });

  it('hides Rename when the store does not implement it', async () => {
    const { cms } = buildCms();
    renderPicker(cms);

    await openPreview('photo.jpg');
    await screen.findByText('Delete');
    expect(screen.queryByText('Rename')).toBeNull();
  });

  it('hides Rename for a static store', async () => {
    const { cms } = buildCms({ rename: vi.fn(), isStatic: true });
    renderPicker(cms);

    await openPreview('photo.jpg');
    expect(screen.queryByText('Rename')).toBeNull();
  });

  it('hides Rename when the caller disallows destructive actions', async () => {
    const { cms } = buildCms({ rename: vi.fn() });
    renderPicker(cms, { allowDelete: false });

    await openPreview('photo.jpg');
    expect(screen.queryByText('Rename')).toBeNull();
  });

  it('sends media-root-relative from/to paths for a nested file', async () => {
    const renamed = file('new.jpg', 'products');
    const rename = vi.fn().mockResolvedValue(renamed);
    const { cms } = buildCms({ rename }, [file('old.jpg', 'products')]);
    renderPicker(cms);

    await openPreview('old.jpg');
    await submitRename('new');

    await waitFor(() =>
      expect(rename).toHaveBeenCalledWith(
        'products/old.jpg',
        'products/new.jpg'
      )
    );
  });

  // A search hit reports its folder inside `filename` and leaves `directory`
  // empty, unlike a file reached by browsing into that folder.
  it('keeps a searched file in its folder when renamed', async () => {
    const rename = vi.fn().mockResolvedValue(file('new.jpg', 'nested'));
    const { cms } = buildCms({ rename }, [file('nested/old.jpg')]);
    renderPicker(cms);

    await openPreview('nested/old.jpg');
    await submitRename('new');

    await waitFor(() =>
      expect(rename).toHaveBeenCalledWith('nested/old.jpg', 'nested/new.jpg')
    );
  });

  it('offers only the base name of a searched file for editing', async () => {
    const rename = vi.fn();
    const { cms } = buildCms({ rename }, [file('nested/old.jpg')]);
    renderPicker(cms);

    await openPreview('nested/old.jpg');
    fireEvent.click(await screen.findByText('Rename'));

    const input = screen.getByPlaceholderText('File name') as HTMLInputElement;
    expect(input.value).toBe('old');

    // Submitting an untouched name is not a rename, so the folder cannot be
    // dropped just by opening the modal and confirming.
    fireEvent.click(modal().getByText('Rename').closest('button'));
    expect(rename).not.toHaveBeenCalled();
  });

  it('reloads the list and re-points the preview at the renamed file', async () => {
    const renamed = file('new.jpg');
    let current = [file('old.jpg')];
    const rename = vi.fn().mockImplementation(async () => {
      current = [renamed];
      return renamed;
    });
    const list = vi.fn().mockImplementation(async () => ({ items: current }));
    const { cms } = buildCms({ rename, list });
    renderPicker(cms);

    await openPreview('old.jpg');
    const callsBefore = list.mock.calls.length;
    await submitRename('new');

    // the preview heading follows the renamed file
    expect(
      await screen.findByRole('heading', { name: 'new.jpg' })
    ).toBeDefined();
    await waitFor(() =>
      expect(list.mock.calls.length).toBeGreaterThan(callsBefore)
    );
    await waitFor(() => expect(screen.queryByTitle('old.jpg')).toBeNull());
  });

  it('keeps a second picker in sync through the event bus', async () => {
    const renamed = file('new.jpg');
    let current = [file('old.jpg')];
    const rename = vi.fn().mockImplementation(async () => {
      current = [renamed];
      return renamed;
    });
    const list = vi.fn().mockImplementation(async () => ({ items: current }));
    const { cms } = buildCms({ rename, list });

    render(
      withCms(
        cms,
        <>
          <MediaPicker allowDelete={true} />
          <MediaPicker allowDelete={true} />
        </>
      )
    );

    expect(await screen.findAllByTitle('old.jpg')).toHaveLength(2);

    await cms.media.rename('old.jpg', 'new.jpg');

    await waitFor(() =>
      expect(screen.getAllByTitle('new.jpg')).toHaveLength(2)
    );
  });
});
