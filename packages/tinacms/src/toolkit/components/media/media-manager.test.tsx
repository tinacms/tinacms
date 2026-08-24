import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventBus } from '@toolkit/core/event';
import { MediaManager as MediaManagerCore } from '@toolkit/core/media';
import type { Media, MediaStore } from '@toolkit/core/media';
import { CMSContext } from '@toolkit/react-core/use-cms';
import { ModalProvider } from '@toolkit/react-modals';
import React from 'react';
import { MediaManager, MediaPicker } from './media-manager';

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

describe('MediaPicker type filter', () => {
  const listSpy = () =>
    vi.fn().mockResolvedValue({ items: [file('photo.jpg')] });

  const extOf = (list: ReturnType<typeof listSpy>) =>
    list.mock.calls.at(-1)?.[0]?.ext;

  it('sends nothing when neither the field nor the toolbar narrows', async () => {
    const list = listSpy();
    const { cms } = buildCms({ extensionFilterable: true, list });
    renderPicker(cms);

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(extOf(list)).toBeUndefined();
  });

  it("sends the field's accept, expanded from a category", async () => {
    const list = listSpy();
    const { cms } = buildCms({ extensionFilterable: true, list });
    renderPicker(cms, { accept: 'audio' });

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(extOf(list)).toEqual(['mp3', 'wav', 'ogg']);
  });

  it('sends both jpeg spellings when the field names one', async () => {
    const list = listSpy();
    const { cms } = buildCms({ extensionFilterable: true, list });
    renderPicker(cms, { accept: 'jpeg' });

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect([...extOf(list)].sort()).toEqual(['jpeg', 'jpg']);
  });

  it('sends nothing when the store does not filter, whatever the field says', async () => {
    const list = listSpy();
    const { cms } = buildCms({ list });
    renderPicker(cms, { accept: 'pdf' });

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(extOf(list)).toBeUndefined();
  });

  it('shows a locked chip instead of a dropdown for a constrained field', async () => {
    const { cms } = buildCms({ extensionFilterable: true, list: listSpy() });
    renderPicker(cms, { accept: 'pdf' });

    expect(await screen.findByText('PDF only')).toBeTruthy();
    expect(screen.queryByText('Any type')).toBeNull();
  });

  it('names the category on the chip rather than counting its extensions', async () => {
    const { cms } = buildCms({ extensionFilterable: true, list: listSpy() });
    renderPicker(cms, { accept: 'image' });

    expect(await screen.findByText('Images only')).toBeTruthy();
  });

  it('spells out the concrete types for assistive tech', async () => {
    const { cms } = buildCms({ extensionFilterable: true, list: listSpy() });
    renderPicker(cms, { accept: 'jpg' });

    // the visible chip stays short; the full list is not left to `title`
    expect(await screen.findByText('JPG only')).toBeTruthy();
    expect(screen.getByText('This field accepts jpg, jpeg')).toBeTruthy();
  });

  it('offers the dropdown when the field is unconstrained', async () => {
    const { cms } = buildCms({ extensionFilterable: true, list: listSpy() });
    renderPicker(cms);

    expect(await screen.findByText('Any type')).toBeTruthy();
  });

  it('hides the control entirely when the store cannot filter', async () => {
    const { cms } = buildCms({ list: listSpy() });
    renderPicker(cms);

    await waitFor(() => expect(screen.queryByText('Any type')).toBeNull());
  });

  it('re-lists with the chosen category when the toolbar narrows', async () => {
    const list = listSpy();
    const { cms } = buildCms({ extensionFilterable: true, list });
    renderPicker(cms);

    const user = userEvent.setup();
    await user.click(await screen.findByText('Any type'));
    await user.click(await screen.findByText('Documents'));

    await waitFor(() =>
      expect(extOf(list)).toEqual(['pdf', 'json', 'csv', 'txt'])
    );
  });
});

// The field plugin reaches the picker through `cms.media.open()`, not by
// rendering it, so the option has to survive the event round-trip.
describe('cms.media.open accept plumbing', () => {
  it('carries a field accept from open() through to the listing', async () => {
    const list = vi.fn().mockResolvedValue({ items: [file('photo.jpg')] });
    const { cms } = buildCms({ extensionFilterable: true, list });

    render(withCms(cms, <MediaManager />));
    cms.media.open({ accept: 'pdf' });

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(list.mock.calls.at(-1)?.[0]?.ext).toEqual(['pdf']);
    expect(await screen.findByText('PDF only')).toBeTruthy();
  });
});

// Paging is driven by an IntersectionObserver, which jsdom does not implement.
const withInfiniteScroll = () => {
  const observers: Array<(entries: unknown[]) => void> = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: unknown[]) => void) {
        observers.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  return () => observers.at(-1)?.([{ isIntersecting: true }]);
};

describe('MediaPicker type filter after paging', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('replaces the listing rather than appending to the previous page', async () => {
    const scrollToBottom = withInfiniteScroll();
    const pages: Record<string, Media[]> = {
      'page-1': [file('photo.png')],
      'page-2': [file('diagram.svg')],
      video: [file('clip.mp4')],
    };
    const list = vi.fn(async (opts: any) => {
      if (opts.ext?.length)
        return { items: pages.video, nextOffset: undefined };
      return opts.offset
        ? { items: pages['page-2'], nextOffset: undefined }
        : { items: pages['page-1'], nextOffset: 20 };
    });
    const { cms } = buildCms({ extensionFilterable: true, list });
    renderPicker(cms);

    expect(await screen.findByTitle('photo.png')).toBeTruthy();
    scrollToBottom();
    expect(await screen.findByTitle('diagram.svg')).toBeTruthy();

    const user = userEvent.setup();
    await user.click(await screen.findByText('Any type'));
    await user.click(await screen.findByText('Video'));

    expect(await screen.findByTitle('clip.mp4')).toBeTruthy();
    expect(screen.queryByTitle('photo.png')).toBeNull();
    expect(screen.queryByTitle('diagram.svg')).toBeNull();
  });
});
