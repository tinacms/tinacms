import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { FormProvider, TinaProvider } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { coreValidatorRegistry } from '../../../test/core-validators';
import { LabelledFields } from '../../../test/labelled-fields';
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
  media: MediaProvider = createMedia()
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          imageFieldPlugin,
          contentPlugin(),
          mediaPlugin(media),
          coreValidatorsPlugin,
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
      </FormProvider>
    </TinaProvider>
  );

const fieldGroup = (name: string) => screen.findByRole('group', { name });

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
    expect(
      within(group).getByRole('img', { name: 'hero.jpg' })
    ).toHaveAttribute('src', `/uploads/${HERO}?w=400&h=400`);
    expect(media.resolveUrl).toHaveBeenCalledWith(HERO, {
      width: 400,
      height: 400,
    });
  });

  it('shows the empty state when the field is absent', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    expect(
      within(group).getByRole('button', { name: 'Choose image' })
    ).toBeVisible();
    expect(within(group).queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('ImageField picking', () => {
  it('stores the media path of the picked image', async () => {
    renderField();
    await pickFromLibrary(await fieldGroup('Hero'), 'Choose image');
    expect(valueOf('hero')).toBe('photo.jpg');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('replaces a stored image with the picked one', async () => {
    renderField({ hero: HERO });
    await pickFromLibrary(await fieldGroup('Hero'), 'Replace');
    expect(valueOf('hero')).toBe('photo.jpg');
  });

  it('returns focus to the main button after a pick', async () => {
    renderField();
    const group = await fieldGroup('Hero');
    await pickFromLibrary(group, 'Choose image');
    expect(
      await within(group).findByRole('button', { name: 'Replace' })
    ).toHaveFocus();
  });
});

describe('ImageField uploading', () => {
  it('stores the path that the provider returns', async () => {
    const media = createMedia();
    renderField(undefined, media);
    const group = await fieldGroup('Hero');
    await userEvent.upload(within(group).getByLabelText('Upload'), imageFile());
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
    expect(valueOf('hero')).toBeUndefined();
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
    await userEvent.upload(within(group).getByLabelText('Upload'), imageFile());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That file is too large to upload.'
    );
    expect(valueOf('hero')).toBeUndefined();
  });

  it('offers no upload when the provider is read-only', async () => {
    const features: MediaFeatures = { readOnly: true };
    renderField(undefined, createMedia({ features }));
    const group = await fieldGroup('Hero');
    expect(within(group).queryByLabelText('Upload')).not.toBeInTheDocument();
  });
});

describe('ImageField clearing', () => {
  it('clears an optional image', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    await userEvent.click(within(group).getByRole('button', { name: 'Clear' }));
    expect(valueOf('hero')).toBeNull();
    expect(
      within(group).getByRole('button', { name: 'Choose image' })
    ).toBeVisible();
  });

  it('drops an upload error when the image is cleared', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    fireEvent.drop(group, {
      dataTransfer: { files: [new File(['%PDF'], 'notes.pdf')] },
    });
    expect(await screen.findByRole('alert')).toBeVisible();
    await userEvent.click(within(group).getByRole('button', { name: 'Clear' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('offers no clear button on a required image', async () => {
    renderField({ cover: HERO });
    const group = await fieldGroup('Cover');
    expect(
      within(group).queryByRole('button', { name: 'Clear' })
    ).not.toBeInTheDocument();
  });
});

describe('ImageField missing images', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const failToLoad = async (group: HTMLElement, name: string) => {
    fireEvent.error(within(group).getByRole('img', { name }));
    await act(() => vi.runOnlyPendingTimersAsync());
  };

  it('retries an image that fails to load with a new URL', async () => {
    renderField({ hero: HERO });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    await failToLoad(group, 'hero.jpg');
    const image = within(group).getByRole('img', { name: 'hero.jpg' });
    expect(image).toHaveAttribute(
      'src',
      `/uploads/${HERO}?w=400&h=400&retry=1`
    );
    fireEvent.load(image);
    expect(within(group).queryByText(/\(missing\)/)).not.toBeInTheDocument();
  });

  it('marks a stored path whose image never loads, and keeps it', async () => {
    renderField({ hero: 'posts/deleted.jpg' });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 3; attempt++) {
      await failToLoad(group, 'deleted.jpg');
      expect(within(group).queryByText(/\(missing\)/)).not.toBeInTheDocument();
    }
    fireEvent.error(within(group).getByRole('img', { name: 'deleted.jpg' }));
    expect(
      within(group).getByText('posts/deleted.jpg (missing)')
    ).toBeVisible();
    expect(valueOf('hero')).toBe('posts/deleted.jpg');
  });

  it('previews an image again once the same path is picked again', async () => {
    renderField({ hero: 'photo.jpg' });
    const group = await fieldGroup('Hero');
    vi.useFakeTimers();
    for (let attempt = 0; attempt < 3; attempt++) {
      await failToLoad(group, 'photo.jpg');
    }
    fireEvent.error(within(group).getByRole('img', { name: 'photo.jpg' }));
    expect(within(group).getByText('photo.jpg (missing)')).toBeVisible();
    vi.useRealTimers();
    await pickFromLibrary(group, 'Replace');
    expect(within(group).getByRole('img', { name: 'photo.jpg' })).toBeVisible();
    expect(within(group).queryByText(/\(missing\)/)).not.toBeInTheDocument();
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
