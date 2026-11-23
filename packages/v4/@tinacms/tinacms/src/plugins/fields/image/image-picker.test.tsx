import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, use } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../config';
import type { ContentProvider } from '../../../core/content/contract';
import { toFieldAddress } from '../../../core/field/address';
import type {
  MediaItem,
  MediaProvider,
  MediaUrlOptions,
} from '../../../core/media/contract';
import { type PluginManifest, definePlugin } from '../../../core/plugin';
import type { CollectionSchema } from '../../../core/schema/types';
import {
  FormProvider,
  TinaProvider,
  useFormStatus,
  useFormId,
} from '../../../editor';
import { FormScopeContext } from '../../../editor/context';
import type { FormViewStore } from '../../../editor/form-view-state';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { connectionOf } from '../../../test/connection';
import { LabelledFields } from '../../../test/labelled-fields';
import arrayFieldPlugin from '../array/array-field.plugin';
import objectFieldPlugin from '../object/object-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import imageFieldPlugin from './image-field.plugin';

const DOCUMENT_PATH = 'content/posts/hello.mdx';

const FILES: MediaItem[] = [
  { path: 'posts', kind: 'directory' },
  { path: 'photo.jpg', kind: 'file' },
  { path: 'sunset.jpg', kind: 'file' },
  { path: 'notes.pdf', kind: 'file' },
  { path: 'posts/a.jpg', kind: 'file' },
  { path: 'posts/b.jpg', kind: 'file' },
];

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const media = (): MediaProvider => ({
  upload: vi.fn(async (file: File) => file.name),
  list: vi.fn(async (folder: string) => ({
    items: FILES.filter(({ path }) => {
      const prefix = folder ? `${folder}/` : '';
      return (
        path.startsWith(prefix) && !path.slice(prefix.length).includes('/')
      );
    }),
  })),
  delete: vi.fn(async () => {}),
  resolveUrl: vi.fn((path: string, options?: MediaUrlOptions) =>
    options ? `/uploads/${path}?w=${options.width}` : `/uploads/${path}`
  ),
});

const stubPlugin = (
  name: string,
  provides: 'content' | 'media',
  slice: object
) =>
  definePlugin({
    name,
    provides: [provides],
    client: async () => ({ default: { slice: () => ({ ...slice }) } }),
  });

const contentStub: ContentProvider = {
  list: vi.fn(async () => connectionOf([])),
  get: vi.fn(async () => null),
  update: vi.fn(async (_collection, path, value) => ({
    path,
    document: value,
  })),
};

const schema: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.image({ name: 'hero', label: 'Hero' }),
    t.image({ name: 'cover', label: 'Cover' }),
    t.array({
      name: 'images',
      label: 'Images',
      of: t.image({ name: 'image' }),
    }),
  ],
};

let view: FormViewStore | undefined;

function Probes() {
  view = use(FormScopeContext)?.view;
  const status = useFormStatus(useFormId());
  return <span data-testid='status'>{status}</span>;
}

const renderField = (
  document?: Record<string, unknown>,
  extra: PluginManifest[] = [],
  collection: CollectionSchema = schema,
  beside?: ReactNode
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          imageFieldPlugin,
          arrayFieldPlugin,
          objectFieldPlugin,
          stringFieldPlugin,
          stubPlugin('test:content', 'content', contentStub),
          stubPlugin('test:media', 'media', media()),
          coreValidatorsPlugin,
          ...extra,
        ],
        schema: { collections: [collection] },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <FormProvider
        collection={collection}
        path={DOCUMENT_PATH}
        document={document}
      >
        <LabelledFields />
        <Probes />
        {beside}
      </FormProvider>
    </TinaProvider>
  );

const group = (name: string) =>
  screen.findByRole('group', { name: new RegExp(`^${name}\\b`) });

const picker = (name: string = 'Choose an image') =>
  screen.findByRole('region', { name });

const tile = async (name: string) =>
  within(await screen.findByRole('region', { name: /^Choose / })).findByRole(
    'button',
    { name }
  );

const status = () => screen.getByTestId('status').textContent;

beforeEach(() => {
  view = undefined;
});

afterEach(() => {
  localStorage.clear();
});

describe('choosing an image with the picker', () => {
  it('opens over the form with no dialog, and the field says it is being chosen for', async () => {
    renderField();
    const hero = await group('Hero');
    await userEvent.click(
      within(hero).getByRole('button', { name: 'Choose from Media' })
    );
    const panel = await picker();
    expect(panel).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(panel).getByText('For Hero')).toBeVisible();
    expect(within(hero).getByText('Choosing in the picker')).toBeVisible();
    expect(
      within(await group('Cover')).queryByText('Choosing in the picker')
    ).toBeNull();
  });

  it('sets the field, marks the form changed and focuses Replace', async () => {
    renderField();
    const hero = await group('Hero');
    await userEvent.click(
      within(hero).getByRole('button', { name: 'Choose from Media' })
    );
    const choose = within(await picker()).getByRole('button', {
      name: 'Choose image',
    });
    expect(choose).toBeDisabled();
    await userEvent.click(await tile('photo.jpg'));
    await userEvent.click(await tile('sunset.jpg'));
    await userEvent.click(choose);
    expect(valueOf('hero')).toBe('sunset.jpg');
    expect(status()).toBe('dirty');
    expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
    expect(
      within(hero).getByRole('button', { name: 'Replace sunset.jpg' })
    ).toHaveFocus();
    expect(within(hero).queryByText('Choosing in the picker')).toBeNull();
  });

  it('moves focus into the library when it opens', async () => {
    renderField();
    await userEvent.click(
      within(await group('Hero')).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    expect(
      within(await picker()).getByRole('region', { name: 'Media library' })
    ).toHaveFocus();
  });

  it('puts the choice in the field when the document saved while the picker was open', async () => {
    renderField({ hero: 'photo.jpg' });
    await userEvent.click(
      within(await group('Hero')).getByRole('button', {
        name: 'Replace photo.jpg',
      })
    );
    const panel = await picker();
    await userEvent.click(await tile('sunset.jpg'));
    act(() => useFormStore.getState().markSaved(toFormId(DOCUMENT_PATH)));
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Choose image' })
    );
    expect(valueOf('hero')).toBe('sunset.jpg');
    expect(status()).toBe('dirty');
  });

  it('lists images and folders only', async () => {
    renderField();
    await userEvent.click(
      within(await group('Hero')).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    await tile('photo.jpg');
    expect(
      within(await picker()).queryByRole('button', { name: 'notes.pdf' })
    ).toBeNull();
  });

  it.each([
    [
      'Cancel',
      () => userEvent.click(screen.getByRole('button', { name: 'Cancel' })),
    ],
    [
      'Close',
      () =>
        userEvent.click(screen.getByRole('button', { name: 'Close picker' })),
    ],
    ['Escape', () => userEvent.keyboard('{Escape}')],
  ])(
    'closes on %s without changing the field, and returns focus',
    async (_name, close) => {
      renderField({ hero: 'photo.jpg' });
      const hero = await group('Hero');
      const replace = within(hero).getByRole('button', {
        name: 'Replace photo.jpg',
      });
      await userEvent.click(replace);
      await userEvent.click(await tile('sunset.jpg'));
      await close();
      expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
      expect(valueOf('hero')).toBe('photo.jpg');
      expect(status()).not.toBe('dirty');
      expect(replace).toHaveFocus();
    }
  );

  it('leaves the form clean when the field already holds the chosen path', async () => {
    renderField({ hero: 'photo.jpg' });
    const hero = await group('Hero');
    await userEvent.click(
      within(hero).getByRole('button', { name: 'Replace photo.jpg' })
    );
    await userEvent.click(await tile('photo.jpg'));
    await userEvent.click(
      within(await picker()).getByRole('button', { name: 'Choose image' })
    );
    expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
    expect(status()).not.toBe('dirty');
  });

  it('re-targets the open picker when another field asks, and clears the picks', async () => {
    renderField();
    await userEvent.click(
      within(await group('Hero')).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    await userEvent.click(await tile('Open folder posts'));
    await userEvent.click(await tile('a.jpg'));
    const panel = await picker();
    expect(within(panel).getByText('1 picked')).toBeVisible();

    await userEvent.click(
      within(await group('Cover')).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    expect(screen.getAllByRole('region', { name: /^Choose / })).toHaveLength(1);
    expect(within(panel).getByText('For Cover')).toBeVisible();
    expect(within(panel).getByText('0 picked')).toBeVisible();
    expect(
      within(panel).getByRole('button', { name: 'Parent folder' })
    ).toBeVisible();
    expect(
      within(await group('Hero')).queryByText('Choosing in the picker')
    ).toBeNull();
    expect(
      within(await group('Cover')).getByText('Choosing in the picker')
    ).toBeVisible();
  });

  it('says what a nested field is for', async () => {
    const nested: CollectionSchema = {
      name: 'post',
      format: 'mdx',
      fields: [
        t.object({
          name: 'seo',
          label: 'SEO',
          fields: [t.image({ name: 'og', label: 'Social image' })],
        }),
      ],
    };
    renderField(undefined, [], nested);
    await userEvent.click(
      within(await group('Social image')).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    expect(
      within(await picker()).getByText('For Social image in SEO')
    ).toBeVisible();
  });
});

describe('choosing several images for a gallery', () => {
  const open = async (images: unknown[] = []) => {
    renderField({ images });
    await userEvent.click(
      within(await group('Images')).getByRole('button', { name: 'Add images' })
    );
    return picker('Choose images');
  };

  it('numbers picks in pick order across folders, then adds them in that order', async () => {
    const panel = await open(['posts/b.jpg']);
    await userEvent.click(await tile('sunset.jpg'));
    await userEvent.click(await tile('Open folder posts'));
    await userEvent.click(await tile('a.jpg'));
    await userEvent.click(within(panel).getByRole('button', { name: 'Media' }));
    await userEvent.click(await tile('photo.jpg'));
    expect(within(panel).getByText('3 picked')).toBeVisible();
    expect(
      within(panel).getByRole('button', {
        name: 'photo.jpg, selected, number 3',
      })
    ).toBeVisible();

    await userEvent.click(
      within(panel).getByRole('button', {
        name: 'sunset.jpg, selected, number 1',
      })
    );
    expect(
      within(panel).getByRole('button', {
        name: 'photo.jpg, selected, number 2',
      })
    ).toBeVisible();
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Add 2 images' })
    );
    expect(valueOf('images')).toEqual([
      'posts/b.jpg',
      'posts/a.jpg',
      'photo.jpg',
    ]);
    expect(status()).toBe('dirty');
    expect(
      within(await group('Images')).getByRole('button', {
        name: 'Replace a.jpg',
      })
    ).toHaveFocus();
  });

  it('shows what the gallery holds as already added, live, and refuses it', async () => {
    const panel = await open(['photo.jpg']);
    const held = await tile('photo.jpg, Already added');
    await userEvent.click(held);
    expect(within(panel).getByText('0 picked')).toBeVisible();
    expect(
      within(panel).getByRole('button', { name: 'Add image' })
    ).toBeDisabled();

    await userEvent.click(
      within(await group('Images')).getByRole('button', {
        name: 'Remove photo.jpg',
      })
    );
    expect(
      await within(panel).findByRole('button', { name: 'photo.jpg' })
    ).toBeVisible();
  });

  it('clears every pick with the disc, which is off with none', async () => {
    const panel = await open();
    const clear = () =>
      within(panel).getByRole('button', { name: 'Clear picks' });
    expect(clear()).toBeDisabled();
    await userEvent.click(await tile('photo.jpg'));
    await userEvent.click(await tile('sunset.jpg'));
    await userEvent.click(clear());
    expect(within(panel).getByText('0 picked')).toBeVisible();
    expect(clear()).toBeDisabled();
  });

  it('replaces the targeted tile after it moved, and leaves the rest', async () => {
    renderField({ images: ['one.jpg', 'two.jpg', 'three.jpg'] });
    const images = await group('Images');
    await userEvent.click(
      within(images).getByRole('button', { name: 'Replace three.jpg' })
    );
    const panel = await picker();
    expect(
      await within(panel).findByRole('button', { name: 'photo.jpg' })
    ).toBeVisible();

    const grip = within(images).getByRole('button', {
      name: 'Move Image 3: three.jpg',
    });
    grip.focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(valueOf('images')).toEqual(['three.jpg', 'one.jpg', 'two.jpg']);

    await userEvent.click(await tile('photo.jpg'));
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Choose image' })
    );
    expect(valueOf('images')).toEqual(['photo.jpg', 'one.jpg', 'two.jpg']);
  });

  it('closes without writing when the targeted tile is removed', async () => {
    renderField({ images: ['one.jpg', 'two.jpg'] });
    const images = await group('Images');
    await userEvent.click(
      within(images).getByRole('button', { name: 'Replace two.jpg' })
    );
    await picker();
    await userEvent.click(
      within(images).getByRole('button', { name: 'Remove two.jpg' })
    );
    expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
    expect(valueOf('images')).toEqual(['one.jpg']);
  });
});

describe('the picker and the error summary pane', () => {
  const blockHero = () =>
    act(() => {
      view?.getState().block(['hero']);
    });
  const paneOpen = () => view?.getState().errorSummary.paneOpen;

  const openFromHero = async () =>
    userEvent.click(
      within(await group('Hero')).getByRole('button', {
        name: 'Choose from Media',
      })
    );

  it('tucks an open pane while it is open and brings it back', async () => {
    renderField();
    await group('Hero');
    blockHero();
    expect(paneOpen()).toBe(true);
    await openFromHero();
    expect(paneOpen()).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(paneOpen()).toBe(true);
  });

  it('leaves a pinned pane open', async () => {
    localStorage.setItem('tina.errorPane.pinned', 'true');
    renderField();
    await group('Hero');
    blockHero();
    await openFromHero();
    expect(paneOpen()).toBe(true);
  });

  it('keeps a pane the editor tucked tucked', async () => {
    renderField();
    await group('Hero');
    blockHero();
    act(() => view?.getState().tuckPane());
    await openFromHero();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(paneOpen()).toBe(false);
  });
});

describe('Escape inside the picker', () => {
  it('closes only the picker: a pinned error pane stays open and no outer Escape handler runs', async () => {
    localStorage.setItem('tina.errorPane.pinned', 'true');
    renderField();
    const hero = await group('Hero');
    act(() => {
      view?.getState().block(['hero']);
    });
    const outer = vi.fn();
    window.addEventListener('keydown', outer);
    await userEvent.click(
      within(hero).getByRole('button', { name: 'Choose from Media' })
    );
    await picker();
    await userEvent.keyboard('{Escape}');
    window.removeEventListener('keydown', outer);
    expect(screen.queryByRole('region', { name: /^Choose / })).toBeNull();
    expect(view?.getState().errorSummary.paneOpen).toBe(true);
    expect(outer).not.toHaveBeenCalled();
  });
});

describe('the picker for a missing image', () => {
  it('opens in the old folder with a card that names the old file', async () => {
    renderField({ hero: 'posts/gone.jpg' });
    const hero = await group('Hero');
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 4; attempt++) {
      fireEvent.error(within(hero).getByAltText('gone.jpg'));
      await act(() => vi.runOnlyPendingTimersAsync());
    }
    vi.useRealTimers();
    await userEvent.click(
      within(hero).getByRole('button', { name: 'Replace gone.jpg' })
    );
    const panel = await picker();
    expect(await within(panel).findByText('gone.jpg')).toBeVisible();
    expect(
      within(panel).getByText(/No longer in Media; it was here, in posts\./)
    ).toBeVisible();
    expect(await tile('a.jpg')).toBeVisible();
    await userEvent.click(await tile('a.jpg'));
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Choose image' })
    );
    expect(valueOf('hero')).toBe('posts/a.jpg');
    expect(within(hero).queryByText(/no longer in Media/i)).toBeNull();
  });
});

describe('the picker for an image inside a list item', () => {
  const authors: CollectionSchema = {
    name: 'post',
    format: 'mdx',
    fields: [
      t.array({
        name: 'authors',
        label: 'Authors',
        fields: [
          t.string({ name: 'name', label: 'Name' }),
          t.image({ name: 'avatar', label: 'Avatar' }),
        ],
      }),
    ],
  };

  const openItems = async () => {
    renderField(
      { authors: [{ name: 'Ivan' }, { name: 'Josh' }, { name: 'Brook' }] },
      [],
      authors
    );
    for (const head of await screen.findAllByRole('button', {
      name: /^Item \d:/,
    })) {
      await userEvent.click(head);
    }
  };

  it('says which item it is for', async () => {
    await openItems();
    const [, second] = await screen.findAllByRole('group', { name: 'Avatar' });
    await userEvent.click(
      within(second as HTMLElement).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    expect(
      within(await picker()).getByText(/^For Avatar in Item 2/)
    ).toBeVisible();
  });

  it('writes to the same item after the item moved', async () => {
    await openItems();
    const [, second] = await screen.findAllByRole('group', { name: 'Avatar' });
    await userEvent.click(
      within(second as HTMLElement).getByRole('button', {
        name: 'Choose from Media',
      })
    );
    const panel = await picker();
    await userEvent.click(
      screen.getByRole('button', { name: 'Actions for Item 2' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Move up/ })
    );
    await userEvent.click(await tile('photo.jpg'));
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Choose image' })
    );
    expect(valueOf('authors')).toEqual([
      { name: 'Josh', avatar: 'photo.jpg' },
      { name: 'Ivan', avatar: null },
      { name: 'Brook', avatar: null },
    ]);
  });
});
