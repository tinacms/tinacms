import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { use } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider } from '../core/content/contract';
import type { MediaItem, MediaProvider } from '../core/media/contract';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import { required } from '../plugins/fields';
import imageFieldPlugin from '../plugins/fields/image/image-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { connectionOf } from '../test/connection';
import { LabelledFields } from '../test/labelled-fields';
import { FormScopeContext, type FormScope } from './context';
import {
  FormProvider,
  TinaProvider,
  useFormId,
  useFormSave,
  useFormStatus,
} from '.';

const PATH = 'content/posts/hello.mdx';
const FILES: MediaItem[] = [
  { path: 'photo.jpg', kind: 'file' },
  { path: 'sunset.jpg', kind: 'file' },
];

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.image({ name: 'hero', label: 'Hero' })],
};

const media: MediaProvider = {
  upload: async (file) => file.name,
  list: async () => ({ items: FILES }),
  delete: async () => {},
  resolveUrl: (path) => `/uploads/${path}`,
};
const stub = (name: string, provides: 'content' | 'media', slice: object) =>
  definePlugin({
    name,
    provides: [provides],
    client: async () => ({ default: { slice: () => ({ ...slice }) } }),
  });
const content: ContentProvider = {
  list: async () => connectionOf([]),
  get: async () => null,
  update: async (_c, path, value) => ({ path, document: value }),
};

let save: () => Promise<void>;
let scope: FormScope | null;
const writes: TinaDocument[] = [];
let release: (() => void) | undefined;

function Probes() {
  save = useFormSave();
  scope = use(FormScopeContext);
  const status = useFormStatus(useFormId());
  return <span data-testid='status'>{status}</span>;
}

const heldWrite = (value: TinaDocument) =>
  new Promise<{ path: string; document: TinaDocument }>((resolve) => {
    release = () => {
      writes.push(value);
      resolve({ path: PATH, document: value });
    };
  });

const renderForm = (schema: CollectionSchema = collection) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          imageFieldPlugin,
          stringFieldPlugin,
          stub('test:content', 'content', content),
          stub('test:media', 'media', media),
          coreValidatorsPlugin,
        ],
        schema: { collections: [schema] },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <FormProvider
        collection={schema}
        path={PATH}
        document={{ hero: 'photo.jpg' }}
        onSave={heldWrite}
      >
        <LabelledFields />
        <Probes />
      </FormProvider>
    </TinaProvider>
  );

const hero = () => screen.findByRole('group', { name: /^Hero\b/ });
const pickerOf = () =>
  screen.queryByRole('region', { name: /^Choose an image/ });
const heroValue = () =>
  useFormStore.getState().forms[toFormId(PATH)]?.values['hero' as keyof object];

const openAndPick = async (name = 'sunset.jpg') => {
  const opener = within(await hero()).getByRole('button', {
    name: 'Replace photo.jpg',
  });
  await userEvent.click(opener);
  const panel = await screen.findByRole('region', { name: 'Choose an image' });
  await userEvent.click(await within(panel).findByRole('button', { name }));
  return opener;
};

beforeEach(() => {
  writes.length = 0;
  release = undefined;
});

describe('saving with the media picker open, with no TinaAdmin', () => {
  it('closes the picker before the write, writes no pick, and leaves the form clean with focus on the opener (a)', async () => {
    renderForm();
    const opener = await openAndPick();
    let saved: Promise<void> = Promise.resolve();
    act(() => {
      saved = save();
    });
    expect(pickerOf()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Choose image' })).toBeNull();
    expect(heroValue()).toBe('photo.jpg');
    await vi.waitFor(() => expect(release).toBeDefined());
    await act(async () => {
      release?.();
      await saved;
    });
    expect(writes).toEqual([{ hero: 'photo.jpg' }]);
    expect(screen.getByTestId('status')).not.toHaveTextContent('dirty');
    expect(opener).toHaveFocus();
    expect(pickerOf()).toBeNull();
  });

  it('ignores a Choose that was held until after the save began (b)', async () => {
    renderForm();
    await openAndPick();
    const held = scope?.view.getState().picker?.choose;
    let saved: Promise<void> = Promise.resolve();
    act(() => {
      saved = save();
    });
    act(() => held?.(['sunset.jpg']));
    await vi.waitFor(() => expect(release).toBeDefined());
    await act(async () => {
      release?.();
      await saved;
    });
    expect(writes).toEqual([{ hero: 'photo.jpg' }]);
    expect(heroValue()).toBe('photo.jpg');
    expect(screen.getByTestId('status')).not.toHaveTextContent('dirty');
  });

  it('closes the picker for a save that validation blocks, and writes nothing', async () => {
    renderForm({
      ...collection,
      fields: [
        ...collection.fields,
        t.string({ name: 'title', label: 'Title', validators: [required()] }),
      ],
    });
    await openAndPick();
    let saved: Promise<unknown> = Promise.resolve();
    act(() => {
      saved = save().catch((cause: unknown) => cause);
    });
    expect(pickerOf()).toBeNull();
    await act(async () => {
      await saved;
    });
    expect(writes).toEqual([]);
    expect(heroValue()).toBe('photo.jpg');
  });
});
