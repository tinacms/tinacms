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
import { type ReactNode, useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../config';
import { branchSliceOf } from '../../core/branch/contract';
import {
  MediaError,
  type MediaItem,
  type MediaPage,
  type MediaProvider,
  type MediaUploadOptions,
  type MediaUrlOptions,
} from '../../core/media/contract';
import { definePlugin } from '../../core/plugin';
import type { CollectionSchema } from '../../core/schema/types';
import { FormProvider, TinaProvider, useTinaStore } from '../../editor';
import {
  type MediaPickerRequest,
  useMediaPicker,
} from '../../editor/media-picker';
import { useUploadView } from '../../editor/uploads/use-uploads';
import {
  FOLDER_DROPPED,
  NOT_AN_IMAGE,
  READ_ONLY_UPLOAD,
  SAVING_HOLD,
  protectedBranchWords,
} from '../../editor/uploads/upload-words';
import { toFormId, useFormStore } from '../../form/form-store';
import { t } from '../../index';
import { LabelledFields } from '../../test/labelled-fields';
import stringFieldPlugin from '../fields/string/string-field.plugin';
import { SESSION_EXPIRED } from './media-pane-words';
import { MediaPickerHost } from './media-picker-host';
import {
  LOAD_FAILED,
  emptyWords,
  loadingWords,
  missingCardWords,
} from './media-picker-words';

const DOCUMENT_PATH = 'content/posts/hello.mdx';
const SAVING_FORM = toFormId(DOCUMENT_PATH);

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

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

// The newest observer is the one watching the sentinel now in view.
const scrollToEnd = async () => {
  await waitFor(() => expect(observers.length).toBeGreaterThan(0));
  await act(async () => observers.at(-1)?.intersect());
};

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
              page.extensions.some((ext) =>
                path.toLowerCase().endsWith(`.${ext}`)
              ))
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
            list: async () => [
              { name: 'main', protected: true },
              { name: 'other' },
            ],
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

type AuthStatus = 'signed-in' | 'signed-out';
let setAuth: ((status: AuthStatus) => void) | undefined;

const authPlugin = (status: AuthStatus) =>
  definePlugin({
    name: 'test:auth',
    provides: ['auth'],
    server: async () => ({ default: {} }),
    client: async () => ({
      default: {
        slice: (set) => {
          setAuth = (next) =>
            set(
              next === 'signed-in'
                ? { status: next, user: { id: 'alice' }, roles: ['editor'] }
                : { status: next, user: null, roles: [] }
            );
          return {
            status,
            user: status === 'signed-in' ? { id: 'alice' } : null,
            roles: ['editor'],
            getToken: async () => undefined,
            login: async () => {},
            logout: async () => {},
          };
        },
      },
    }),
  });

type Ask = Omit<MediaPickerRequest, 'opener'>;

/** One "Open <name>" button per request: the stand-in for a field's Choose from Media. */
function Openers({ asks }: { asks: Record<string, Ask> }) {
  const picker = useMediaPicker();
  return (
    <>
      {Object.entries(asks).map(([name, ask]) => (
        <button
          key={name}
          type='button'
          onClick={(event) =>
            picker.open({ ...ask, opener: event.currentTarget })
          }
        >
          Open {name}
        </button>
      ))}
      <button type='button' onClick={() => picker.close()}>
        Close from outside
      </button>
    </>
  );
}

function MediaOpenProbe() {
  return (
    <output>{useUploadView().mediaOpen ? 'media open' : 'media shut'}</output>
  );
}

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

const single = (overrides: Partial<Ask> = {}): Ask => ({
  mode: 'single',
  forLabel: 'Hero',
  target: 'hero',
  choose: vi.fn(),
  ...overrides,
});
const many = (overrides: Partial<Ask> = {}): Ask =>
  single({
    mode: 'multiple',
    forLabel: 'Gallery',
    target: 'gallery',
    ...overrides,
  });

interface Options {
  asks?: Record<string, Ask>;
  protectedBranch?: boolean;
  auth?: AuthStatus;
  plugin?: ReturnType<typeof definePlugin>;
  extra?: ReactNode;
  document?: { title: string };
}

const renderPicker = (provider: MediaProvider, options: Options = {}) => {
  const { asks = { hero: single() }, protectedBranch = false } = options;
  const mediaPlugin =
    options.plugin ??
    definePlugin({
      name: 'test:media',
      provides: ['media'],
      client: async () => ({ default: { slice: () => ({ ...provider }) } }),
    });
  const contentStub = definePlugin({
    name: 'test:content:stub',
    provides: ['content'],
    client: async () => ({
      default: {
        slice: () => ({
          list: async () => ({ items: [], cursor: undefined }),
          get: async () => null,
          update: async () => {
            throw new Error('not used');
          },
        }),
      },
    }),
  });
  const plugins = [
    protectedBranch ? protectedContentPlugin : contentStub,
    mediaPlugin,
    stringFieldPlugin,
    ...(options.auth ? [authPlugin(options.auth)] : []),
  ];
  return render(
    <TinaProvider
      config={asResolvedConfig({
        plugins,
        schema: { collections: [collection] },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <FormProvider
        collection={collection}
        path={DOCUMENT_PATH}
        document={options.document}
      >
        <Openers asks={asks} />
        <MediaOpenProbe />
        {options.extra}
      </FormProvider>
    </TinaProvider>
  );
};

const openPicker = async (
  user: ReturnType<typeof userEvent.setup>,
  name = 'hero'
) => {
  await user.click(await screen.findByRole('button', { name: `Open ${name}` }));
  return screen.findByRole('region', {
    name: /^Choose (an image|images)$/,
  });
};

const tile = (name: string) => screen.findByRole('button', { name });
const tileNames = () =>
  within(screen.getByRole('list', { name: 'Images' }))
    .getAllByRole('button')
    .map((each) => each.getAttribute('aria-label'));
const folderCard = (name: string) =>
  screen.findByRole('button', { name: `Open folder ${name}` });
const png = (name: string) => new File(['x'], name, { type: 'image/png' });
const fileInput = () => screen.getByLabelText('Choose files to upload');
const library = () => screen.getByRole('region', { name: 'Media library' });
const dropOf = (dropped: File[]) => ({
  dataTransfer: { files: dropped, types: ['Files'] },
});
const searchBox = () =>
  screen.getByRole('searchbox', { name: 'Search this folder' });
const failedUploadButton = () =>
  screen.findByRole('button', { name: /^Upload\b.*couldn't upload/ });

beforeEach(() => {
  files = [
    { path: 'posts', kind: 'directory' },
    { path: 'logo.png', kind: 'file' },
    { path: 'photo.jpg', kind: 'file' },
    { path: 'HERO.JPG', kind: 'file' },
    { path: 'clip.mp4', kind: 'file' },
    { path: 'notes.pdf', kind: 'file' },
    { path: 'posts/hero.jpg', kind: 'file' },
  ];
  observers = [];
  setAuth = undefined;
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  act(() => useFormStore.getState().clearSavePhase(SAVING_FORM));
});

describe('opening and closing', () => {
  it('opens a region for one image, names the field, and puts focus in the library', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider());
    const region = await openPicker(user);
    expect(region).toHaveAccessibleName('Choose an image');
    expect(within(region).getByText('For Hero')).toBeVisible();
    await tile('logo.png');
    expect(library()).toHaveFocus();
  });

  it('names the parent of a nested field, and says images for a gallery', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), {
      asks: { logos: many({ forLabel: 'Logos', parentLabel: 'Logo strip' }) },
    });
    const region = await openPicker(user, 'logos');
    expect(region).toHaveAccessibleName('Choose images');
    expect(within(region).getByText('For Logos in Logo strip')).toBeVisible();
  });

  it.each([
    [
      'Cancel',
      (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole('button', { name: 'Cancel' })),
    ],
    [
      'Close picker',
      (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole('button', { name: 'Close picker' })),
    ],
    [
      'Escape',
      (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}'),
    ],
  ])(
    '%s closes without choosing, and focus returns to the opener',
    async (_name, back) => {
      const user = userEvent.setup();
      const ask = single();
      renderPicker(createProvider(), { asks: { hero: ask } });
      await openPicker(user);
      await user.click(await tile('logo.png'));
      await back(user);
      await waitFor(() =>
        expect(
          screen.queryByRole('region', { name: 'Choose an image' })
        ).toBeNull()
      );
      expect(ask.choose).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Open hero' })).toHaveFocus();
    }
  );

  it('closes without choosing when the form view closes it, and marks Media open only meanwhile', async () => {
    const user = userEvent.setup();
    const ask = single();
    renderPicker(createProvider(), { asks: { hero: ask } });
    expect(await screen.findByText('media shut')).toBeVisible();
    await openPicker(user);
    await tile('logo.png');
    expect(screen.getByText('media open')).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Close from outside' })
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Choose an image' })
      ).toBeNull()
    );
    expect(ask.choose).not.toHaveBeenCalled();
    expect(screen.getByText('media shut')).toBeVisible();
  });
});

describe('what it lists', () => {
  it.each([
    ['without', {}, undefined],
    [
      'with',
      { extensionFilter: true },
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'ico'],
    ],
  ])(
    'lists folders and images only, %s the provider extension filter',
    async (_name, features, extensions) => {
      const user = userEvent.setup();
      const provider = createProvider({ features });
      renderPicker(provider);
      await openPicker(user);
      await tile('logo.png');
      expect(
        within(screen.getByRole('list', { name: 'Folders' })).getAllByRole(
          'button'
        )
      ).toHaveLength(1);
      expect(tileNames()).toEqual(['logo.png', 'photo.jpg', 'HERO.JPG']);
      expect(screen.queryByRole('button', { name: 'clip.mp4' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'notes.pdf' })).toBeNull();
      expect(provider.list).toHaveBeenCalledWith(
        '',
        expect.objectContaining({ extensions })
      );
    }
  );

  it('keeps paging past a first page of PDFs until images turn up', async () => {
    const user = userEvent.setup();
    const pdfs: MediaItem[] = Array.from({ length: 50 }, (_, index) => ({
      path: `doc-${index}.pdf`,
      kind: 'file',
    }));
    const provider = createProvider({
      list: vi.fn(async (_folder: string, page: { cursor?: string } = {}) =>
        page.cursor === 'p2'
          ? { items: [{ path: 'late.png', kind: 'file' as const }] }
          : { items: pdfs, cursor: 'p2' }
      ),
    });
    renderPicker(provider);
    await openPicker(user);
    await screen.findByRole('status', { name: 'Loading more images' });
    expect(screen.queryByText(/^No images in/)).toBeNull();
    await scrollToEnd();
    expect(await tile('late.png')).toBeVisible();
    expect(provider.list).toHaveBeenLastCalledWith(
      '',
      expect.objectContaining({ cursor: 'p2' })
    );
  });

  it('shows the breadcrumb only inside a folder, and it leads back', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider());
    await openPicker(user);
    await tile('logo.png');
    expect(screen.queryByRole('navigation')).toBeNull();
    await user.click(await folderCard('posts'));
    expect(await tile('hero.jpg')).toBeVisible();
    const crumbs = screen.getByRole('navigation');
    await user.click(within(crumbs).getByRole('button', { name: 'Media' }));
    expect(await tile('logo.png')).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('says an empty folder has no images yet', async () => {
    const user = userEvent.setup();
    files = [{ path: 'empty', kind: 'directory' }];
    renderPicker(createProvider());
    await openPicker(user);
    await user.click(await folderCard('empty'));
    expect(await screen.findByText('No images in empty yet.')).toBeVisible();
    expect(screen.getByText('Drop images here, or')).toBeVisible();
  });

  it('reopens in the folder it was last in', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider());
    await openPicker(user);
    await user.click(await folderCard('posts'));
    await tile('hero.jpg');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await openPicker(user);
    expect(await tile('hero.jpg')).toBeVisible();
  });
});

describe('search', () => {
  it('hands a debounced search to a provider that searches', async () => {
    const user = userEvent.setup();
    const provider = createProvider({ features: { search: true } });
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    await user.type(searchBox(), 'zzz');
    expect(
      await screen.findByText('No images in Media match “zzz”.')
    ).toBeVisible();
    expect(provider.list).toHaveBeenLastCalledWith(
      '',
      expect.objectContaining({ search: 'zzz' })
    );
    expect(provider.list).not.toHaveBeenCalledWith(
      '',
      expect.objectContaining({ search: 'z' })
    );
    await user.click(
      within(library()).getByRole('button', { name: 'Clear search' })
    );
    expect(await tile('logo.png')).toBeVisible();
  });

  describe('on a provider without search', () => {
    const pages = () =>
      createProvider({
        list: vi.fn(async (_folder: string, page: { cursor?: string } = {}) =>
          page.cursor === 'p2'
            ? { items: [{ path: 'needle.png', kind: 'file' as const }] }
            : {
                items: [{ path: 'first.png', kind: 'file' as const }],
                cursor: 'p2',
              }
        ),
      });

    it('reads a later page for a match, loading until it arrives', async () => {
      const user = userEvent.setup();
      renderPicker(pages());
      await openPicker(user);
      await tile('first.png');
      await user.type(searchBox(), 'needle');
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'first.png' })).toBeNull()
      );
      expect(
        screen.getByRole('status', { name: 'Loading more images' })
      ).toBeVisible();
      expect(screen.queryByText(/^No images in/)).toBeNull();
      await scrollToEnd();
      expect(await tile('needle.png')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'first.png' })).toBeNull();
      expect(screen.getByText('1 image')).toBeVisible();
    });

    it('says no hits only after the last page, and Clear search brings the list back', async () => {
      const user = userEvent.setup();
      renderPicker(pages());
      await openPicker(user);
      await tile('first.png');
      await user.type(searchBox(), 'zzz');
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'first.png' })).toBeNull()
      );
      expect(
        screen.getByRole('status', { name: 'Loading more images' })
      ).toBeVisible();
      expect(screen.queryByText(/match “zzz”/)).toBeNull();
      await scrollToEnd();
      expect(
        await screen.findByText('No images in Media match “zzz”.')
      ).toBeVisible();
      await user.click(
        within(library()).getByRole('button', { name: 'Clear search' })
      );
      expect(await tile('first.png')).toBeVisible();
    });
  });
});

describe('picking one image', () => {
  it('toggles the pick, gates Choose image on it, and confirms the path', async () => {
    const user = userEvent.setup();
    const ask = single();
    renderPicker(createProvider(), { asks: { hero: ask } });
    await openPicker(user);
    const choose = screen.getByRole('button', { name: 'Choose image' });
    expect(choose).toBeDisabled();
    await user.click(await tile('logo.png'));
    expect(
      screen.getByRole('button', { name: 'logo.png, selected' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 picked')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'photo.jpg' }));
    expect(screen.getByRole('button', { name: 'logo.png' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
    await user.click(
      screen.getByRole('button', { name: 'photo.jpg, selected' })
    );
    expect(choose).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'logo.png' }));
    await user.click(choose);
    expect(ask.choose).toHaveBeenCalledExactlyOnceWith(['logo.png']);
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Choose an image' })
      ).toBeNull()
    );
  });
});

describe('picking several images', () => {
  it('numbers picks across folders, renumbers on unpick and confirms in pick order', async () => {
    const user = userEvent.setup();
    const ask = many();
    renderPicker(createProvider(), { asks: { gallery: ask } });
    await openPicker(user, 'gallery');
    const add = screen.getByRole('button', { name: 'Add image' });
    expect(add).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear picks' })).toBeDisabled();
    await user.click(await tile('logo.png'));
    expect(add).toBeEnabled();
    await user.click(await folderCard('posts'));
    await user.click(await tile('hero.jpg'));
    expect(screen.getByRole('button', { name: 'Add 2 images' })).toBeVisible();
    expect(screen.getByText('2 picked')).toBeVisible();
    await user.click(
      within(screen.getByRole('navigation')).getByRole('button', {
        name: 'Media',
      })
    );
    expect(await tile('logo.png, selected, number 1')).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'logo.png, selected, number 1' })
    );
    await user.click(await folderCard('posts'));
    expect(await tile('hero.jpg, selected, number 1')).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'hero.jpg, selected, number 1' })
    );
    expect(screen.getByRole('button', { name: 'Clear picks' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'hero.jpg' }));
    await user.click(
      within(screen.getByRole('navigation')).getByRole('button', {
        name: 'Media',
      })
    );
    await user.click(await tile('photo.jpg'));
    await user.click(screen.getByRole('button', { name: 'Add 2 images' }));
    expect(ask.choose).toHaveBeenCalledExactlyOnceWith([
      'posts/hero.jpg',
      'photo.jpg',
    ]);
  });

  it('keeps picks through a search, and the disc clears them', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), { asks: { gallery: many() } });
    await openPicker(user, 'gallery');
    await user.click(await tile('logo.png'));
    await user.type(searchBox(), 'photo');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /^logo\.png/ })).toBeNull()
    );
    expect(screen.getByText('1 picked')).toBeVisible();
    await user.clear(searchBox());
    expect(await tile('logo.png, selected, number 1')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Clear picks' }));
    expect(screen.getByText('0 picked')).toBeVisible();
    expect(screen.getByRole('button', { name: 'logo.png' })).toBeVisible();
  });

  describe('Already added', () => {
    const taken: Ask['taken'] = {
      address: 'title',
      paths: (value) => (typeof value === 'string' && value ? [value] : []),
    };

    const renderTaken = async () => {
      const user = userEvent.setup();
      renderPicker(createProvider(), {
        asks: { gallery: many({ taken }) },
        document: { title: 'logo.png' },
        extra: <LabelledFields />,
      });
      await openPicker(user, 'gallery');
      return user;
    };

    it('refuses a click and Enter, and says so', async () => {
      const user = await renderTaken();
      const added = await tile('logo.png, Already added');
      expect(added).toHaveAttribute('aria-disabled', 'true');
      expect(added).not.toHaveAttribute('aria-pressed');
      await user.click(added);
      act(() => added.focus());
      await user.keyboard('{Enter}');
      expect(screen.getByText('0 picked')).toBeVisible();
    });

    it('frees the image when the field drops it while the picker is open', async () => {
      const user = await renderTaken();
      await tile('logo.png, Already added');
      await user.clear(screen.getByRole('textbox', { name: 'Title' }));
      await user.click(await tile('logo.png'));
      expect(screen.getByText('1 picked')).toBeVisible();
    });
  });
});

describe('re-targeting', () => {
  it('a second open for another target retitles the picker, drops the picks and keeps the folder', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), {
      asks: {
        one: single({ forLabel: 'Hero', target: 'hero' }),
        two: many({ forLabel: 'Gallery', target: 'gallery' }),
      },
    });
    await openPicker(user, 'one');
    await user.click(await folderCard('posts'));
    await user.click(await tile('hero.jpg'));
    expect(screen.getByText('1 picked')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Open two' }));
    const region = await screen.findByRole('region', { name: 'Choose images' });
    expect(within(region).getByText('For Gallery')).toBeVisible();
    expect(screen.getByText('0 picked')).toBeVisible();
    expect(await tile('hero.jpg')).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
  });
});

describe('a missing image', () => {
  it('opens in the folder the image was in, with the card', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), {
      asks: {
        hero: single({ replacing: { path: 'posts/gone.jpg', missing: true } }),
      },
    });
    await openPicker(user);
    expect(await tile('hero.jpg')).toBeVisible();
    expect(screen.getByText('gone.jpg')).toBeVisible();
    expect(screen.getByText(missingCardWords('posts'))).toBeVisible();
  });

  it('falls back to the root when that folder cannot be listed, and the card still names it', async () => {
    const user = userEvent.setup();
    const provider = createProvider({
      list: vi.fn(async (folder: string): Promise<MediaPage> => {
        if (folder === 'nowhere') throw new MediaError('not-found');
        return { items: childrenOf(folder) };
      }),
    });
    renderPicker(provider, {
      asks: {
        hero: single({
          replacing: { path: 'nowhere/gone.jpg', missing: true },
        }),
      },
    });
    await openPicker(user);
    expect(await tile('logo.png')).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByText(missingCardWords('nowhere'))).toBeVisible();
  });
});

describe('focus after a confirm from a custom field', () => {
  function CustomField({
    focusInput = false,
    swapOpener = false,
  }: {
    focusInput?: boolean;
    swapOpener?: boolean;
  }) {
    const picker = useMediaPicker();
    const [version, setVersion] = useState(0);
    const input = useRef<HTMLInputElement>(null);
    return (
      <>
        <button
          key={swapOpener ? version : 0}
          type='button'
          onClick={(event) =>
            picker.open({
              mode: 'single',
              forLabel: 'Custom',
              target: 'custom',
              opener: event.currentTarget,
              choose: () => {
                setVersion((current) => current + 1);
                if (focusInput) input.current?.focus();
              },
            })
          }
        >
          Open custom
        </button>
        <input ref={input} aria-label='Other input' />
      </>
    );
  }

  const confirm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(
      await screen.findByRole('button', { name: 'Open custom' })
    );
    await user.click(await tile('logo.png'));
    await user.click(screen.getByRole('button', { name: 'Choose image' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Choose an image' })
      ).toBeNull()
    );
  };

  it('returns focus to the opener when it is still in the page', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), { extra: <CustomField /> });
    await confirm(user);
    expect(screen.getByRole('button', { name: 'Open custom' })).toHaveFocus();
  });

  it('leaves focus where the field put it', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), { extra: <CustomField focusInput /> });
    await confirm(user);
    expect(screen.getByLabelText('Other input')).toHaveFocus();
  });

  it('goes to the form scroll region when the opener was replaced', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), {
      extra: (
        <>
          <div data-form-id={SAVING_FORM} tabIndex={-1} aria-label='Form' />
          <CustomField swapOpener />
        </>
      ),
    });
    await confirm(user);
    expect(screen.getByLabelText('Form')).toHaveFocus();
  });
});

describe('a missing image in a folder that is still there', () => {
  const openMissing = async (provider: MediaProvider) => {
    const user = userEvent.setup();
    renderPicker(provider, {
      asks: {
        hero: single({ replacing: { path: 'posts/gone.jpg', missing: true } }),
      },
    });
    await openPicker(user);
    return user;
  };
  const emptyPosts = () => {
    files = files.filter((item) => item.path !== 'posts/hero.jpg');
  };

  it('stays in an empty folder that its parent lists, and uploads there', async () => {
    emptyPosts();
    const provider = createProvider();
    const user = await openMissing(provider);
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    expect(screen.getByText(missingCardWords('posts'))).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
    await user.upload(fileInput(), png('new.png'));
    await waitFor(() =>
      expect(provider.upload).toHaveBeenCalledWith(
        expect.any(File),
        'posts',
        expect.anything()
      )
    );
  });

  it('falls back to the root when the empty folder is not in its parent', async () => {
    emptyPosts();
    files = files.filter((item) => item.path !== 'posts');
    await openMissing(createProvider());
    expect(await tile('logo.png')).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByText(missingCardWords('posts'))).toBeVisible();
  });

  it('finds the folder on a later page of its parent', async () => {
    emptyPosts();
    const provider = createProvider({
      list: vi.fn(
        async (
          folder: string,
          page: { cursor?: string } = {}
        ): Promise<MediaPage> => {
          if (folder === 'posts') return { items: [] };
          if (!page.cursor) {
            return { items: [{ path: 'a', kind: 'directory' }], cursor: 'p2' };
          }
          return { items: [{ path: 'posts', kind: 'directory' }] };
        }
      ),
    });
    await openMissing(provider);
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
  });

  it('falls back once when the folder cannot be listed, then opens it without bouncing', async () => {
    const provider = createProvider({
      list: vi.fn(async (folder: string): Promise<MediaPage> => {
        if (folder === 'posts') throw new MediaError('not-found');
        return { items: childrenOf(folder) };
      }),
    });
    const user = await openMissing(provider);
    expect(await tile('logo.png')).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
    await user.click(await folderCard('posts'));
    expect(await screen.findByText(LOAD_FAILED)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
  });

  it('opens an empty folder again from the root without bouncing', async () => {
    emptyPosts();
    const user = await openMissing(createProvider());
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    await user.click(
      within(screen.getByRole('navigation')).getByRole('button', {
        name: 'Media',
      })
    );
    await user.click(await folderCard('posts'));
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
  });

  it('keeps the folder open when the parent check fails another way', async () => {
    emptyPosts();
    const failing = (error: Error) => {
      let first = true;
      return createProvider({
        list: vi.fn(async (folder: string): Promise<MediaPage> => {
          if (folder === '' && first) {
            first = false;
            throw error;
          }
          return { items: childrenOf(folder) };
        }),
      });
    };
    await openMissing(failing(new Error('boom')));
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
  });

  it('leaves the folder when the parent check says not-found', async () => {
    emptyPosts();
    let first = true;
    await openMissing(
      createProvider({
        list: vi.fn(async (folder: string): Promise<MediaPage> => {
          if (folder === '' && first) {
            first = false;
            throw new MediaError('not-found');
          }
          return { items: childrenOf(folder) };
        }),
      })
    );
    expect(await tile('logo.png')).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('does not retry a parent check that says not-found', async () => {
    emptyPosts();
    const rootLists = vi.fn();
    await openMissing(
      createProvider({
        list: vi.fn(async (folder: string): Promise<MediaPage> => {
          if (folder === '') {
            rootLists();
            if (rootLists.mock.calls.length === 1) {
              throw new MediaError('not-found');
            }
          }
          return { items: childrenOf(folder) };
        }),
      })
    );
    expect(await tile('logo.png')).toBeVisible();
    expect(rootLists).toHaveBeenCalledTimes(2);
  });

  it('checks the parent again when a second missing image re-seeds the open picker', async () => {
    emptyPosts();
    const user = userEvent.setup();
    renderPicker(createProvider(), {
      asks: {
        one: single({
          target: 'one',
          replacing: { path: 'posts/gone.jpg', missing: true },
        }),
        two: single({
          target: 'two',
          replacing: { path: 'posts/other.jpg', missing: true },
        }),
      },
    });
    await openPicker(user, 'one');
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    files = files.filter((item) => item.path !== 'posts');
    await user.click(screen.getByRole('button', { name: 'Open two' }));
    expect(await tile('logo.png')).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('trusts a fresh answer over a cached one when the folder was recreated', async () => {
    emptyPosts();
    files = files.filter((item) => item.path !== 'posts');
    const user = await openMissing(createProvider());
    expect(await tile('logo.png')).toBeVisible();
    await user.keyboard('{Escape}');
    files.push({ path: 'posts', kind: 'directory' });
    await openPicker(user);
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
  });

  it('stops showing loading once the editor left and re-entered the folder', async () => {
    emptyPosts();
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let parentChecked = false;
    const user = await openMissing(
      createProvider({
        list: vi.fn(async (folder: string): Promise<MediaPage> => {
          if (folder === '' && !parentChecked) {
            parentChecked = true;
            await held;
          }
          return { items: childrenOf(folder) };
        }),
      })
    );
    await screen.findByRole('status', { name: loadingWords('posts') });
    await user.click(
      within(screen.getByRole('navigation')).getByRole('button', {
        name: 'Media',
      })
    );
    await user.click(await folderCard('posts'));
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
    release();
  });

  it('shows the empty root, with Upload, for a missing image that was at the root', async () => {
    const user = userEvent.setup();
    files = [];
    renderPicker(createProvider(), {
      asks: {
        hero: single({ replacing: { path: 'gone.jpg', missing: true } }),
      },
    });
    await openPicker(user);
    expect(await screen.findByText(emptyWords(''))).toBeVisible();
    expect(screen.getByText(missingCardWords(''))).toBeVisible();
  });

  it('shows loading, not the empty message, while the parent check runs', async () => {
    emptyPosts();
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await openMissing(
      createProvider({
        list: vi.fn(async (folder: string): Promise<MediaPage> => {
          if (folder === '') await held;
          return { items: childrenOf(folder) };
        }),
      })
    );
    expect(
      await screen.findByRole('status', { name: loadingWords('posts') })
    ).toBeVisible();
    expect(screen.queryByText(emptyWords('posts'))).toBeNull();
    release();
    expect(await screen.findByText(emptyWords('posts'))).toBeVisible();
  });
});

describe('a missing image with a search', () => {
  it('stays in the old folder while a search finds nothing there', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider({ features: { search: true } }), {
      asks: {
        hero: single({ replacing: { path: 'posts/gone.jpg', missing: true } }),
      },
    });
    await openPicker(user);
    await tile('hero.jpg');
    await user.type(searchBox(), 'zzz');
    expect(
      await screen.findByText('No images in posts match “zzz”.')
    ).toBeVisible();
    expect(screen.getByText(missingCardWords('posts'))).toBeVisible();
  });
});

describe('a missing image on a provider without search', () => {
  it('still falls back to the root when the editor types before the folder lists', async () => {
    const user = userEvent.setup();
    let finishPosts: () => void = () => {};
    const postsListed = new Promise<void>((resolve) => {
      finishPosts = resolve;
    });
    const provider = createProvider({
      list: vi.fn(async (folder: string): Promise<MediaPage> => {
        if (folder === 'posts') await postsListed;
        if (folder === 'posts') return { items: [] };
        return {
          items: childrenOf(folder).filter((item) => item.path !== 'posts'),
        };
      }),
    });
    renderPicker(provider, {
      asks: {
        hero: single({ replacing: { path: 'posts/gone.jpg', missing: true } }),
      },
    });
    await openPicker(user);
    await user.type(searchBox(), 'zzz');
    await new Promise((resolve) => setTimeout(resolve, 400));
    finishPosts();
    await waitFor(() => expect(screen.queryByRole('navigation')).toBeNull());
  });
});

describe('the picker beside the Media pane', () => {
  function PaneHarness({ onClosePane }: { onClosePane: () => void }) {
    const [paneOpen, setPaneOpen] = useState(false);
    return (
      <>
        <button type='button' onClick={() => setPaneOpen(true)}>
          Open the Media pane
        </button>
        <MediaPickerHost
          primary
          paneOpen={paneOpen}
          onClosePane={onClosePane}
        />
      </>
    );
  }

  it('closes an open picker when the Media pane opens', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), {
      extra: <PaneHarness onClosePane={vi.fn()} />,
    });
    await openPicker(user);
    await user.click(
      screen.getByRole('button', { name: 'Open the Media pane' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull()
    );
  });

  it('closes the Media pane when a picker is asked for beside it, and shows the picker', async () => {
    const user = userEvent.setup();
    const closePane = vi.fn();
    renderPicker(createProvider(), {
      extra: <MediaPickerHost primary paneOpen onClosePane={closePane} />,
    });
    await openPicker(user);
    expect(closePane).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('region', { name: /^Choose / })).toBeVisible();
  });
});

describe('the picker over a narrow preview', () => {
  const stubRegion = (width: number) => {
    class FakeResizeObserver {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const slot = document.createElement('div');
    slot.setAttribute('data-preview-slot', '');
    slot.getBoundingClientRect = () =>
      ({ top: 56, left: 400, width, height: 600 }) as DOMRect;
    document.body.append(slot);
    return slot;
  };

  const withRegion = (width: number) => {
    const slot = stubRegion(width);
    renderPicker(createProvider(), { extra: <MediaPickerHost primary /> });
    return slot;
  };

  it('hides Maximise while it covers the page, and shows it on a wide enough preview', async () => {
    const user = userEvent.setup();
    const slot = withRegion(400);
    const panel = await openPicker(user);
    expect(
      within(panel).queryByRole('button', { name: 'Maximise' })
    ).toBeNull();
    expect(within(panel).queryByRole('button', { name: 'Restore' })).toBeNull();
    slot.remove();
  });

  it('keeps Maximise on a popover and restores it', async () => {
    const user = userEvent.setup();
    const slot = withRegion(900);
    const panel = await openPicker(user);
    await user.click(within(panel).getByRole('button', { name: 'Maximise' }));
    expect(
      within(panel).getByRole('button', { name: 'Restore' })
    ).toBeVisible();
    slot.remove();
  });
});

describe('states', () => {
  it('shows a loading status named for the folder', async () => {
    const user = userEvent.setup();
    renderPicker(
      createProvider({ list: () => new Promise<MediaPage>(() => {}) })
    );
    await openPicker(user);
    expect(
      await screen.findByRole('status', { name: 'Loading Media' })
    ).toBeVisible();
  });

  it('says the editor lacks permission, never the connection message, and Retry lists again', async () => {
    const user = userEvent.setup();
    let denied = true;
    const provider = createProvider({
      list: vi.fn(async (folder: string): Promise<MediaPage> => {
        if (denied) throw new MediaError('unauthorized');
        return { items: childrenOf(folder) };
      }),
    });
    renderPicker(provider);
    await openPicker(user);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("You don't have permission to do that.");
    expect(screen.queryByText(LOAD_FAILED)).toBeNull();
    denied = false;
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(await tile('logo.png')).toBeVisible();
  });

  it('says the session expired when the editor is signed out', async () => {
    const user = userEvent.setup();
    renderPicker(
      createProvider({
        list: vi.fn(async () => {
          throw new MediaError('unauthorized');
        }),
      }),
      { auth: 'signed-out' }
    );
    await openPicker(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(SESSION_EXPIRED);
    expect(screen.queryByText(LOAD_FAILED)).toBeNull();
  });

  it('says the connection failed, and Retry reloads', async () => {
    const user = userEvent.setup();
    let down = true;
    const provider = createProvider({
      list: vi.fn(async (folder: string): Promise<MediaPage> => {
        if (down) throw new Error('offline');
        return { items: childrenOf(folder) };
      }),
    });
    renderPicker(provider);
    await openPicker(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(LOAD_FAILED);
    down = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await tile('logo.png')).toBeVisible();
  });

  it('shows the setup banner when the provider needs setup', async () => {
    const user = userEvent.setup();
    renderPicker(
      createProvider({
        status: async () => ({
          kind: 'needs-setup',
          message: 'Media needs to be turned on for this project.',
          actionLabel: 'Sync Your Media In TinaCloud.',
          actionUrl: 'https://app.tina.io/media',
        }),
      })
    );
    await openPicker(user);
    expect(
      await screen.findByText('Media needs to be turned on for this project.')
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Sync Your Media In TinaCloud.' })
    ).toHaveAttribute('href', 'https://app.tina.io/media');
    expect(screen.queryByRole('list', { name: 'Images' })).toBeNull();
  });
});

describe('branches', () => {
  it('closes without choosing on a switch, and the next open lists the new branch', async () => {
    const byBranch: Record<string, MediaItem[]> = {
      main: [{ path: 'main-only.png', kind: 'file' }],
      other: [{ path: 'other-only.png', kind: 'file' }],
    };
    const plugin = definePlugin({
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
    const user = userEvent.setup();
    const ask = single();
    renderPicker(createProvider(), {
      plugin,
      asks: { hero: ask },
      extra: <SwitchToOther />,
    });
    await openPicker(user);
    await user.click(await tile('main-only.png'));
    await user.click(screen.getByRole('button', { name: 'Use other' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Choose an image' })
      ).toBeNull()
    );
    expect(ask.choose).not.toHaveBeenCalled();
    await openPicker(user);
    expect(await tile('other-only.png')).toBeVisible();
    expect(screen.queryByRole('button', { name: /main-only/ })).toBeNull();
  });
});

describe('upload', () => {
  it('sends images to the folder in view and picks the one that lands', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderPicker(provider);
    await openPicker(user);
    await user.click(await folderCard('posts'));
    await tile('hero.jpg');
    await user.upload(fileInput(), png('new.png'));
    expect(provider.upload).toHaveBeenCalledWith(
      expect.any(File),
      'posts',
      expect.anything()
    );
    const added = await tile('new.png, selected (new)');
    expect(tileNames()[0]).toBe('new.png, selected (new)');
    expect(screen.getByText('1 picked')).toBeVisible();
  });

  it('appends a landed upload to a gallery pick', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider(), { asks: { gallery: many() } });
    await openPicker(user, 'gallery');
    await user.click(await tile('logo.png'));
    await user.upload(fileInput(), png('new.png'));
    expect(await tile('new.png, selected, number 2 (new)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add 2 images' })).toBeVisible();
  });

  it('refuses a non-image in image-only words, before a request', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const provider = createProvider();
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    await user.upload(
      fileInput(),
      new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    );
    await user.click(await failedUploadButton());
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(within(list).getByText(NOT_AN_IMAGE)).toBeVisible();
    expect(provider.upload).not.toHaveBeenCalled();
  });

  it('lists a file over maxSize with Remove only, and still sends the good one', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const provider = createProvider({ features: { maxSize: 4 } });
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    await user.upload(fileInput(), [
      new File(['too large'], 'big.png', { type: 'image/png' }),
      png('ok.png'),
    ]);
    expect(await tile('ok.png, selected (new)')).toBeVisible();
    expect(provider.upload).toHaveBeenCalledTimes(1);
    await user.click(await failedUploadButton());
    const list = await screen.findByRole('dialog', { name: 'Uploads' });
    expect(within(list).getByText(/^Too large\. The limit is/)).toBeVisible();
    expect(
      within(list).getByRole('button', { name: 'Remove big.png' })
    ).toBeVisible();
    expect(within(list).queryByRole('button', { name: /^Retry/ })).toBeNull();
  });

  it('turns a dropped folder away in words', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    fireEvent.drop(library(), {
      dataTransfer: {
        files: [new File([], 'photos')],
        types: ['Files'],
        items: [{ webkitGetAsEntry: () => ({ isDirectory: true }) }],
      },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(FOLDER_DROPPED);
    expect(provider.upload).not.toHaveBeenCalled();
  });

  it('uploads dropped files, and highlights the library for a drag of files only', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    fireEvent.dragEnter(library(), { dataTransfer: { types: ['text/plain'] } });
    expect(library()).not.toHaveAttribute('data-dragging');
    fireEvent.dragEnter(library(), { dataTransfer: { types: ['Files'] } });
    expect(library()).toHaveAttribute('data-dragging', 'true');
    fireEvent.drop(library(), dropOf([png('dropped.png')]));
    expect(library()).not.toHaveAttribute('data-dragging');
    expect(await tile('dropped.png, selected (new)')).toBeVisible();
  });

  it('offers no Upload on read-only storage and turns a drop away', async () => {
    const user = userEvent.setup();
    const provider = createProvider({ features: { readOnly: true } });
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
    fireEvent.drop(library(), dropOf([png('dropped.png')]));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      READ_ONLY_UPLOAD
    );
    expect(provider.upload).not.toHaveBeenCalled();
  });

  it('does not pick a file that lands after the picker moved to another folder', async () => {
    const user = userEvent.setup();
    const { upload, sent } = gatedUpload();
    renderPicker(createProvider({ upload }));
    await openPicker(user);
    await tile('logo.png');
    await user.upload(fileInput(), png('late.png'));
    await waitFor(() => expect(sent).toHaveLength(1));
    await user.click(await folderCard('posts'));
    await tile('hero.jpg');
    await act(async () => sent[0]?.land());
    expect(sent[0]?.folder).toBe('');
    expect(
      await screen.findByRole('button', { name: '1 uploaded' })
    ).toBeVisible();
    expect(screen.getByText('0 picked')).toBeVisible();
  });

  it('drops a landed upload when the picker is re-targeted meanwhile', async () => {
    const user = userEvent.setup();
    const { upload, sent } = gatedUpload();
    renderPicker(createProvider({ upload }), {
      asks: { one: single(), two: many() },
    });
    await openPicker(user, 'one');
    await tile('logo.png');
    await user.upload(fileInput(), png('late.png'));
    await waitFor(() => expect(sent).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: 'Open two' }));
    await screen.findByRole('region', { name: 'Choose images' });
    await act(async () => sent[0]?.land());
    expect(
      await screen.findByRole('button', { name: 'late.png (new)' })
    ).toBeVisible();
    expect(screen.getByText('0 picked')).toBeVisible();
  });

  it('drops the New mark once the picker leaves the folder', async () => {
    const user = userEvent.setup();
    renderPicker(createProvider());
    await openPicker(user);
    await tile('logo.png');
    await user.upload(fileInput(), png('new.png'));
    await tile('new.png, selected (new)');
    await user.click(await folderCard('posts'));
    await tile('hero.jpg');
    await user.click(
      within(screen.getByRole('navigation')).getByRole('button', {
        name: 'Media',
      })
    );
    expect(await tile('new.png, selected')).toBeVisible();
    expect(screen.queryByRole('button', { name: /\(new\)/ })).toBeNull();
  });

  describe('with a branch in view', () => {
    beforeEach(() => {
      localStorage.setItem(
        'tina-store',
        JSON.stringify({ state: { branch: { current: 'other' } }, version: 0 })
      );
      files.push({ path: 'late.png', kind: 'file' });
    });
    afterEach(() => localStorage.removeItem('tina-store'));

    it('picks a file that lands on the branch in view', async () => {
      const user = userEvent.setup();
      let land = () => {};
      const upload = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            land = () => resolve('late.png');
          })
      );
      renderPicker(createProvider({ upload }), { protectedBranch: true });
      await openPicker(user);
      await tile('late.png');
      await user.upload(fileInput(), png('late.png'));
      await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
      await act(async () => land());
      expect(await tile('late.png, selected (new)')).toBeVisible();
    });
  });
});

describe('upload with no TinaAdmin above the form', () => {
  it('draws its status before any picker opens', async () => {
    renderPicker(createProvider());
    await waitFor(() =>
      expect(document.querySelector('[data-upload-status]')).not.toBeNull()
    );
    expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
  });

  it('reads progress and the result in one polite status', async () => {
    const user = userEvent.setup();
    const { upload, sent } = gatedUpload();
    const { container } = renderPicker(createProvider({ upload }));
    await openPicker(user);
    await tile('logo.png');
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
    expect(statuses[0]).toHaveTextContent(/uploaded/i);
    expect(statuses[0]?.textContent).not.toMatch(/%/);
  });

  it('turns files away with the reason while a save runs', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderPicker(provider);
    await openPicker(user);
    await tile('logo.png');
    act(() =>
      useFormStore.getState().setSavePhase(SAVING_FORM, { phase: 'saving' })
    );
    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(SAVING_HOLD);
    fireEvent.dragEnter(library(), { dataTransfer: { types: ['Files'] } });
    expect(library()).not.toHaveAttribute('data-dragging');
    fireEvent.drop(library(), dropOf([png('dropped.png')]));
    expect(await screen.findByRole('alert')).toHaveTextContent(SAVING_HOLD);
    expect(provider.upload).not.toHaveBeenCalled();
    act(() => useFormStore.getState().clearSavePhase(SAVING_FORM));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();
  });

  it('turns files away on a protected branch with the reason', async () => {
    const user = userEvent.setup();
    const provider = createProvider();
    renderPicker(provider, { protectedBranch: true });
    await openPicker(user);
    await tile('logo.png');
    const button = screen.getByRole('button', { name: 'Upload' });
    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveAccessibleDescription(protectedBranchWords('main'));
    fireEvent.drop(library(), dropOf([png('summit.png')]));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      protectedBranchWords('main')
    );
    expect(provider.upload).not.toHaveBeenCalled();
  });
});
