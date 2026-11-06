import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../config';
import type { ContentProvider } from '../../../core/content/contract';
import { toFieldAddress } from '../../../core/field/address';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import {
  MediaError,
  type MediaFeatures,
  type MediaProvider,
  type MediaUrlOptions,
} from '../../../core/media/contract';
import { type PluginManifest, definePlugin } from '../../../core/plugin';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { FormProvider, TinaProvider, useActiveField } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { coreValidatorRegistry } from '../../../test/core-validators';
import { LabelledFields } from '../../../test/labelled-fields';
import arrayFieldPlugin from '../array/array-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import imageFieldPlugin from './image-field.plugin';

const DOCUMENT_PATH = 'content/posts/hello.mdx';
const HERO = 'posts/hero.jpg';

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.image({ name: 'hero', label: 'Hero' }),
    t.image({ name: 'cover', label: 'Cover', validators: [required()] }),
  ],
};

const [heroNode, coverNode] = collection.fields;

const contentPlugin = (): PluginManifest => {
  const provider: ContentProvider = {
    list: vi.fn(async () => []),
    get: vi.fn(async () => null),
    update: vi.fn(async (_collection, path, value) => ({
      path,
      document: value,
    })),
  };
  return definePlugin({
    name: 'test:content:stub',
    provides: ['content'],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });
};

const createMedia = (overrides: Partial<MediaProvider> = {}) => ({
  upload: vi.fn(async (file: File) => `uploads-dir/${file.name}`),
  list: vi.fn(async () => ({
    items: [
      { path: 'posts', kind: 'directory' as const },
      { path: 'photo.jpg', kind: 'file' as const },
    ],
  })),
  delete: vi.fn(async () => {}),
  resolveUrl: vi.fn((path: string, options?: MediaUrlOptions) =>
    options
      ? `/uploads/${path}?w=${options.width}&h=${options.height}`
      : `/uploads/${path}`
  ),
  ...overrides,
});

const mediaPlugin = (provider: MediaProvider): PluginManifest =>
  definePlugin({
    name: 'test:media:stub',
    provides: ['media'],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([imageFieldPlugin]);

const renderField = (
  document?: TinaDocument,
  media: MediaProvider = createMedia(),
  schema: CollectionSchema = collection,
  extra?: ReactNode,
  morePlugins: PluginManifest[] = []
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          imageFieldPlugin,
          arrayFieldPlugin,
          stringFieldPlugin,
          contentPlugin(),
          mediaPlugin(media),
          coreValidatorsPlugin,
          ...morePlugins,
        ],
        schema: { collections: [schema] },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <FormProvider
        collection={schema}
        path={DOCUMENT_PATH}
        document={document}
      >
        <LabelledFields />
        {extra}
      </FormProvider>
    </TinaProvider>
  );

const fieldGroup = (name: string) =>
  screen.findByRole('group', { name: new RegExp(`^${name}\\b`) });

const imageFile = (name = 'new.png') =>
  new File(['image'], name, { type: 'image/png' });

const pickFromLibrary = async (group: HTMLElement, button: string) => {
  await userEvent.click(within(group).getByRole('button', { name: button }));
  const dialog = await screen.findByRole('dialog', { name: 'Choose an image' });
  await userEvent.click(
    await within(dialog).findByRole('button', { name: 'photo.jpg' })
  );
  await userEvent.click(
    await within(dialog).findByRole('button', { name: 'Insert' })
  );
};

describe('ImageField rendering', () => {
  it('previews a stored path through the media provider', async () => {
    const media = createMedia();
    renderField({ hero: HERO }, media);
    const group = await fieldGroup('Hero');
    expect(within(group).getByAltText('hero.jpg')).toHaveAttribute(
      'src',
      `/uploads/${HERO}?w=400&h=400`
    );
    expect(media.resolveUrl).toHaveBeenCalledWith(HERO, {
      width: 400,
      height: 400,
    });
  });

  it('hides the thumbnail until it loads', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    const image = within(group).getByAltText('hero.jpg');
    expect(image).not.toBeVisible();
    fireEvent.load(image);
    expect(image).toBeVisible();
  });

  it('shows the empty state when the field is absent', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
    expect(within(group).queryByRole('img')).not.toBeInTheDocument();
  });

  it('says uploads wait while a save runs', async () => {
    renderField({});
    const group = await fieldGroup('Hero');
    act(() =>
      useFormStore
        .getState()
        .setSavePhase(toFormId(DOCUMENT_PATH), { phase: 'saving' })
    );
    expect(
      within(group).getByText('Saving. You can upload once it finishes.')
    ).toBeVisible();
  });

  it('still offers Choose from Media when the media provider is read-only', async () => {
    renderField(undefined, createMedia({ features: { readOnly: true } }));
    const group = await fieldGroup('Hero');
    expect(
      within(group).getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
    expect(within(group).queryByText(/Drop an image/)).not.toBeInTheDocument();
  });
});

describe('ImageField picking', () => {
  it('stores the media path of the picked image', async () => {
    renderField();
    await pickFromLibrary(await fieldGroup('Hero'), 'Choose from Media');
    expect(valueOf('hero')).toBe('photo.jpg');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('replaces a stored image with the picked one', async () => {
    renderField({ hero: HERO });
    await pickFromLibrary(await fieldGroup('Hero'), 'Replace hero.jpg');
    expect(valueOf('hero')).toBe('photo.jpg');
  });

  it('returns focus to the main button after a pick', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    await pickFromLibrary(group, 'Choose from Media');
    expect(
      await within(group).findByRole('button', { name: 'Replace photo.jpg' })
    ).toHaveFocus();
  });
});

describe('ImageField uploading', () => {
  it('stores the path that the provider returns', async () => {
    const media = createMedia();
    renderField(undefined, media);
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, { dataTransfer: { files: [imageFile()] } });
    await screen.findByRole('button', { name: 'Replace new.png' });
    expect(media.upload).toHaveBeenCalledOnce();
    expect(valueOf('hero')).toBe('uploads-dir/new.png');
  });

  it('rejects a file that is not an image', async () => {
    const media = createMedia();
    renderField(undefined, media);
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, {
      dataTransfer: {
        files: [new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' })],
      },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'notes.pdf: Invalid file type'
    );
    expect(media.upload).not.toHaveBeenCalled();
    expect(valueOf('hero')).toBeNull();
  });

  it('shows the message of a failed upload', async () => {
    renderField(
      undefined,
      createMedia({
        upload: vi.fn(async () => {
          throw new MediaError('too-large');
        }),
      })
    );
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, { dataTransfer: { files: [imageFile()] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That file is too large to upload.'
    );
    expect(valueOf('hero')).toBeNull();
  });

  it('ignores a dropped file when the provider is read-only, and still picks', async () => {
    const features: MediaFeatures = { readOnly: true };
    const media = createMedia({ features });
    renderField(undefined, media);
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, { dataTransfer: { files: [imageFile()] } });
    expect(media.upload).not.toHaveBeenCalled();
    expect(valueOf('hero')).toBeNull();
    await pickFromLibrary(group, 'Choose from Media');
    expect(valueOf('hero')).toBe('photo.jpg');
  });

  it('ignores a second drop while an upload runs', async () => {
    let finish: (path: string) => void = () => {};
    const media = createMedia({
      upload: vi.fn(
        () =>
          new Promise<string>((resolve) => {
            finish = resolve;
          })
      ),
    });
    renderField(undefined, media);
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, { dataTransfer: { files: [imageFile('one.png')] } });
    fireEvent.drop(group, { dataTransfer: { files: [imageFile('two.png')] } });
    expect(media.upload).toHaveBeenCalledOnce();
    await act(async () => finish('uploads-dir/one.png'));
    expect(valueOf('hero')).toBe('uploads-dir/one.png');
  });
});

describe('ImageField removing', () => {
  it('removes an optional image at once, never deleting the media file', async () => {
    const media = createMedia();
    renderField({ hero: HERO }, media);
    const group = await fieldGroup('Hero');
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove hero.jpg' })
    );
    expect(valueOf('hero')).toBeNull();
    const choose = within(group).getByRole('button', {
      name: 'Choose from Media',
    });
    expect(choose).toHaveFocus();
    expect(media.delete).not.toHaveBeenCalled();
  });

  it('keeps the old image when Replace is cancelled', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    await userEvent.click(
      within(group).getByRole('button', { name: 'Replace hero.jpg' })
    );
    await screen.findByRole('dialog', { name: 'Choose an image' });
    await userEvent.keyboard('{Escape}');
    expect(valueOf('hero')).toBe(HERO);
    expect(
      await within(group).findByRole('button', { name: 'Replace hero.jpg' })
    ).toHaveFocus();
  });

  it('drops an upload error when the image is cleared', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, {
      dataTransfer: { files: [new File(['%PDF'], 'notes.pdf')] },
    });
    expect(await screen.findByRole('alert')).toBeVisible();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove hero.jpg' })
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('offers no remove button on a required image', async () => {
    renderField({ cover: HERO });
    const group = await fieldGroup('Cover');
    expect(
      within(group).queryByRole('button', { name: /^Remove/ })
    ).not.toBeInTheDocument();
  });
});

describe('ImageField missing images', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const failToLoad = async (group: HTMLElement, name: string) => {
    fireEvent.error(within(group).getByAltText(name));
    await act(() => vi.runOnlyPendingTimersAsync());
  };

  it('retries an image that fails to load with a new URL', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    await failToLoad(group, 'hero.jpg');
    const image = within(group).getByAltText('hero.jpg');
    expect(image).toHaveAttribute(
      'src',
      `/uploads/${HERO}?w=400&h=400&retry=1`
    );
    fireEvent.load(image);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('captions a missing image "File not found", not its name', async () => {
    renderField({ hero: 'posts/deleted.jpg' });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 3; attempt++) {
      await failToLoad(group, 'deleted.jpg');
    }
    fireEvent.error(within(group).getByAltText('deleted.jpg'));
    expect(within(group).getByText('File not found')).toBeVisible();
  });

  it('marks a stored path whose image never loads, and keeps it', async () => {
    renderField({ hero: 'posts/deleted.jpg' });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 3; attempt++) {
      await failToLoad(group, 'deleted.jpg');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    }
    fireEvent.error(within(group).getByAltText('deleted.jpg'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'This image is no longer in Media'
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      within(group).getByRole('button', { name: 'Replace deleted.jpg' })
    ).toBeVisible();
    expect(
      within(group).getByRole('button', { name: 'Remove deleted.jpg' })
    ).toBeVisible();
    expect(valueOf('hero')).toBe('posts/deleted.jpg');
  });

  it('shows a stored value that is not a string as not a media path', async () => {
    renderField({ hero: 2024 });
    const group = await fieldGroup('Hero');
    expect(within(group).getByText('Not a media path')).toBeVisible();
    await pickFromLibrary(group, 'Replace this value');
    expect(valueOf('hero')).toBe('photo.jpg');
  });

  it('previews an image again once the same path is picked again', async () => {
    renderField({ hero: 'photo.jpg' });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 3; attempt++) {
      await failToLoad(group, 'photo.jpg');
    }
    fireEvent.error(within(group).getByAltText('photo.jpg'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'This image is no longer in Media'
    );
    vi.useRealTimers();
    await pickFromLibrary(group, 'Replace photo.jpg');
    const image = within(group).getByAltText('photo.jpg');
    fireEvent.load(image);
    expect(image).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('ImageField inside an array', () => {
  it("keeps a removed item's image off the item that takes its place", async () => {
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
    renderField(
      {
        authors: [
          { name: 'Ivan' },
          { name: 'Josh', avatar: HERO },
          { name: 'Brook' },
        ],
      },
      createMedia(),
      authors
    );
    for (const head of await screen.findAllByRole('button', {
      name: /^Item \d:/,
    })) {
      await userEvent.click(head);
    }
    await screen.findAllByRole('group', { name: 'Avatar' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Actions for Item 2' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Remove' })
    );
    expect(valueOf('authors')).toEqual([
      { name: 'Ivan', avatar: null },
      { name: 'Brook', avatar: null },
    ]);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('ImageField cover', () => {
  const coverCollection = (cover: 'wide' | 'tall'): CollectionSchema => ({
    name: 'post',
    format: 'mdx',
    fields: [t.image({ name: 'hero', label: 'Hero', cover })],
  });

  it.each([
    { cover: 'wide' as const, shape: 'aspect-video' },
    { cover: 'tall' as const, shape: 'aspect-4/3' },
  ])(
    'keeps the $cover shape from the empty area to the picture',
    async ({ cover, shape }) => {
      const empty = renderField(
        undefined,
        createMedia(),
        coverCollection(cover)
      );
      const emptyGroup = await fieldGroup('Hero');
      expect(emptyGroup.querySelector(`.${CSS.escape(shape)}`)).not.toBeNull();
      empty.unmount();
      renderField({ hero: HERO }, createMedia(), coverCollection(cover));
      const filledGroup = await fieldGroup('Hero');
      expect(filledGroup.querySelector(`.${CSS.escape(shape)}`)).not.toBeNull();
    }
  );

  it('rejects a cover that is not wide or tall', async () => {
    const field = t.image({ name: 'hero' });
    const descriptor = (await resolveRegistry()).get('image');
    expect(() =>
      descriptor?.schema?.({ ...field, cover: 'square' } as never)
    ).toThrow(/"cover" to be "wide" or "tall"/);
  });

  it('is a type error on a field that is not an image', () => {
    t.string({
      name: 'x',
      // @ts-expect-error cover only exists on image fields
      cover: 'wide',
    });
  });
});

describe('ImageField gallery', () => {
  const galleryCollection: CollectionSchema = {
    name: 'post',
    format: 'mdx',
    fields: [
      t.array({
        name: 'images',
        label: 'Images',
        of: t.image({ name: 'image' }),
      }),
    ],
  };

  const renderGallery = (images?: unknown[], media = createMedia()) =>
    renderField(images ? { images } : undefined, media, galleryCollection);

  const gallery = () => fieldGroup('Images');

  it('draws the list view of an overriding image plugin', async () => {
    const override = definePlugin({
      name: 'custom:image',
      provides: ['field'],
      overrides: [{ capability: 'field', key: 'image' }],
      field: { type: 'image', contractVersion: 1 },
      client: async () => ({
        default: {
          field: {
            Component: () => null,
            ListView: () => <p>Custom image list</p>,
          },
        },
      }),
    });
    renderField(
      { images: ['a/one.jpg'] },
      createMedia(),
      galleryCollection,
      undefined,
      [override]
    );
    expect(await screen.findByText('Custom image list')).toBeVisible();
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
  });

  it('shows a tile for each image and an Add images tile', async () => {
    renderGallery(['a/one.jpg', 'b/two.jpg']);
    const group = await gallery();
    expect(within(group).getAllByRole('figure')).toHaveLength(2);
    expect(
      within(group).getByRole('button', { name: 'Add images' })
    ).toBeVisible();
  });

  it('appends an image only after a pick', async () => {
    renderGallery(['a/one.jpg']);
    const group = await gallery();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Add images' })
    );
    await screen.findByRole('dialog', { name: 'Choose an image' });
    await userEvent.keyboard('{Escape}');
    expect(valueOf('images')).toEqual(['a/one.jpg']);
    await pickFromLibrary(group, 'Add images');
    expect(valueOf('images')).toEqual(['a/one.jpg', 'photo.jpg']);
  });

  it('replaces one tile and keeps the rest', async () => {
    renderGallery(['a/one.jpg', 'b/two.jpg']);
    await pickFromLibrary(await gallery(), 'Replace one.jpg');
    expect(valueOf('images')).toEqual(['photo.jpg', 'b/two.jpg']);
  });

  it('removes a tile without leaving a hole', async () => {
    const media = createMedia();
    renderGallery(['a/one.jpg', 'b/two.jpg', 'c/three.jpg'], media);
    const group = await gallery();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove two.jpg' })
    );
    expect(valueOf('images')).toEqual(['a/one.jpg', 'c/three.jpg']);
    expect(
      within(group).getByRole('button', { name: 'Replace three.jpg' })
    ).toHaveFocus();
    expect(media.delete).not.toHaveBeenCalled();
  });

  it('sends focus to Add images after the last tile is removed', async () => {
    renderGallery(['a/one.jpg']);
    const group = await gallery();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove one.jpg' })
    );
    expect(valueOf('images')).toEqual([]);
    expect(
      within(group).getByRole('button', { name: 'Add images' })
    ).toHaveFocus();
  });

  it('allows the same image twice', async () => {
    renderGallery(['a/one.jpg']);
    const group = await gallery();
    await pickFromLibrary(group, 'Add images');
    await pickFromLibrary(group, 'Replace one.jpg');
    expect(valueOf('images')).toEqual(['photo.jpg', 'photo.jpg']);
    expect(within(group).getAllByRole('figure')).toHaveLength(2);
  });

  it('moves a tile by arrow key, keeps focus on it and announces it', async () => {
    renderGallery(['a/one.jpg', 'b/two.jpg', 'c/three.jpg']);
    const group = await gallery();
    within(group)
      .getByRole('button', { name: 'Move Image 3: three.jpg' })
      .focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(valueOf('images')).toEqual([
      'a/one.jpg',
      'c/three.jpg',
      'b/two.jpg',
    ]);
    expect(
      within(group).getByRole('button', { name: 'Move Image 2: three.jpg' })
    ).toHaveFocus();
    expect(
      within(group).getByText('Moved three.jpg to position 2 of 3')
    ).toBeInTheDocument();
  });

  describe('dragging a tile', () => {
    const placeTiles = (group: HTMLElement) => {
      const tiles = [
        ...group.querySelectorAll<HTMLElement>('[data-tile-index]'),
      ];
      tiles.forEach((tile, index) => {
        tile.getBoundingClientRect = () =>
          ({
            left: index * 100,
            right: index * 100 + 90,
            top: 0,
            bottom: 90,
          }) as DOMRect;
      });
      return tiles;
    };
    const at = (x: number) => ({
      clientX: x,
      clientY: 10,
      button: 0,
      pointerId: 1,
    });

    it('moves a tile to the tile it is released over', async () => {
      renderGallery(['a/one.jpg', 'b/two.jpg', 'c/three.jpg']);
      const [first] = placeTiles(await gallery());
      fireEvent.pointerDown(first, at(10));
      fireEvent.pointerMove(first, at(210));
      fireEvent.pointerUp(first, at(210));
      expect(valueOf('images')).toEqual([
        'b/two.jpg',
        'c/three.jpg',
        'a/one.jpg',
      ]);
    });

    it('ignores a press that moves less than the drag distance', async () => {
      renderGallery(['a/one.jpg', 'b/two.jpg']);
      const [first] = placeTiles(await gallery());
      fireEvent.pointerDown(first, at(10));
      fireEvent.pointerMove(first, at(12));
      fireEvent.pointerUp(first, at(112));
      expect(valueOf('images')).toEqual(['a/one.jpg', 'b/two.jpg']);
    });

    it('cancels on Escape', async () => {
      renderGallery(['a/one.jpg', 'b/two.jpg']);
      const [first] = placeTiles(await gallery());
      fireEvent.pointerDown(first, at(10));
      fireEvent.pointerMove(first, at(110));
      await userEvent.keyboard('{Escape}');
      fireEvent.pointerUp(first, at(110));
      expect(valueOf('images')).toEqual(['a/one.jpg', 'b/two.jpg']);
    });

    it('cancels when released outside every tile', async () => {
      renderGallery(['a/one.jpg', 'b/two.jpg']);
      const [first] = placeTiles(await gallery());
      fireEvent.pointerDown(first, at(10));
      fireEvent.pointerMove(first, at(500));
      fireEvent.pointerUp(first, at(500));
      expect(valueOf('images')).toEqual(['a/one.jpg', 'b/two.jpg']);
    });
  });

  it('gives a stored value that is not a path a tile that can be removed', async () => {
    renderGallery(['a/one.jpg', 2024, null]);
    const group = await gallery();
    expect(within(group).getByText('Not a media path')).toBeVisible();
    expect(within(group).getByText('Empty image')).toBeVisible();
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove Image 3' })
    );
    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove Image 2' })
    );
    expect(valueOf('images')).toEqual(['a/one.jpg']);
  });

  it('focuses a tile when the preview activates its address', async () => {
    function Activate() {
      const { setActive } = useActiveField();
      return (
        <button
          type='button'
          onClick={() => setActive(toFieldAddress('images.1'))}
        >
          activate images.1
        </button>
      );
    }
    renderField(
      { images: ['a/one.jpg', 'b/two.jpg'] },
      createMedia(),
      galleryCollection,
      <Activate />
    );
    const group = await gallery();
    await userEvent.click(screen.getByText('activate images.1'));
    expect(
      within(group).getByRole('button', { name: 'Replace two.jpg' })
    ).toHaveFocus();
  });

  it('still offers Add images when the media provider is read-only', async () => {
    renderGallery(['a/one.jpg'], createMedia({ features: { readOnly: true } }));
    const group = await gallery();
    expect(
      within(group).getByRole('button', { name: 'Add images' })
    ).toBeVisible();
  });
});

describe('ImageField validation', () => {
  it('requires an image to be chosen', async () => {
    const descriptor = (await resolveRegistry()).get('image');
    expect(validateFieldWithCore(coverNode, descriptor, HERO)).toEqual([]);
    expect(validateFieldWithCore(coverNode, descriptor, undefined)).toEqual([
      'Cover is required',
    ]);
    expect(validateFieldWithCore(coverNode, descriptor, '')).toEqual([
      'Cover is required',
    ]);
  });

  it('passes an optional image left empty', async () => {
    const descriptor = (await resolveRegistry()).get('image');
    expect(validateFieldWithCore(heroNode, descriptor, '')).toEqual([]);
    expect(validateFieldWithCore(heroNode, descriptor, undefined)).toEqual([]);
    expect(validateFieldWithCore(heroNode, descriptor, null)).toEqual([]);
  });

  it('rejects a value that is not a path', async () => {
    const descriptor = (await resolveRegistry()).get('image');
    expect(validateFieldWithCore(heroNode, descriptor, 42)).not.toEqual([]);
  });

  it('rejects a URL, a path outside the media root, or a non-string', async () => {
    const descriptor = (await resolveRegistry()).get('image');
    for (const value of [
      'https://example.com/hero.jpg',
      '//example.com/hero.jpg',
      '/uploads/posts/hero.jpg',
      'data:image/png;base64,AAAA',
      'posts/../../hero.jpg',
      2024,
      ['posts/hero.jpg'],
    ]) {
      expect(validateFieldWithCore(heroNode, descriptor, value)).toEqual([
        'Hero must be a media path, like posts/hero.jpg',
      ]);
    }
    expect(
      validateFieldWithCore(heroNode, descriptor, 'posts/my photo é.avif')
    ).toEqual([]);
  });
});

describe('ImageField ingest and digest', () => {
  it('round-trips a stored path unchanged', async () => {
    const registry = await resolveRegistry();
    const stored = { hero: HERO, cover: 'posts/cover.png' };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual(stored);
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('digests a cleared image as absent, not literal null', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ hero: null }, collection.fields, { registry })
    ).toEqual({});
  });
});

describe('ImageField metadata wrapping', () => {
  it('registers the image descriptor with its declared metadata', async () => {
    const descriptor = (await resolveRegistry()).get('image');
    expect(descriptor?.metadata).toEqual({
      layout: 'inline',
      labelable: false,
    });
    expect(descriptor?.defaultValue).toBeUndefined();
  });

  it('depends on a media capability', () => {
    expect(imageFieldPlugin.dependsOn).toEqual(['media']);
  });
});

const validateFieldWithCore: typeof validateField = (
  node,
  descriptor,
  value,
  options
) =>
  validateField(node, descriptor, value, {
    validators: coreValidatorRegistry,
    ...options,
  });
