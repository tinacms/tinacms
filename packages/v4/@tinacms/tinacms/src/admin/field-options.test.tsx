import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import '../plugins/fields/rich-text/rich-text-field.client';
import type { MediaProvider } from '../core/media/contract';
import { definePlugin } from '../core/plugin';
import { digestDocument, ingestDocument } from '../core/form/ingest';
import { seedItem } from '../plugins/fields/array/seed-item';
import { resolveFieldPlugins } from '../core/field/registry';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { FormProvider, type SaveHandler, TinaProvider } from '../editor';
import { corePlugins, required, t } from '../plugins/fields';
import { DocumentForm } from './document-form';

const NO_COLLECTIONS = { collections: [] };

const media: MediaProvider = {
  upload: async (file) => file.name,
  list: async () => ({ items: [] }),
  delete: async () => {},
  resolveUrl: (path) => `/uploads/${path}`,
};

const mediaPlugin = definePlugin({
  name: 'test:media:stub',
  provides: ['media'],
  client: async () => ({ default: { slice: () => ({ ...media }) } }),
});

const renderForm = (
  collection: CollectionSchema,
  document: TinaDocument = {},
  onSave: SaveHandler = vi.fn()
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [...corePlugins, mediaPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={collection}
        path='content/posts/test.json'
        document={document}
        onSave={onSave}
      >
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );

const collectionOf = (...fields: CollectionSchema['fields']) =>
  ({ name: 'post', format: 'json', fields }) satisfies CollectionSchema;

describe('field description', () => {
  it('shows under the label and describes the input', async () => {
    renderForm(
      collectionOf(
        t.string({
          name: 'slug',
          label: 'Slug',
          description: 'Used in the URL',
        }),
        t.object({
          name: 'seo',
          label: 'SEO',
          fields: [
            t.string({
              name: 'title',
              label: 'SEO title',
              description: 'Max 60',
            }),
          ],
        })
      )
    );
    expect(await screen.findByLabelText('Slug')).toHaveAccessibleDescription(
      'Used in the URL'
    );
    expect(screen.getByLabelText('SEO title')).toHaveAccessibleDescription(
      'Max 60'
    );
  });
});

describe('hidden field', () => {
  const collection = collectionOf(
    t.string({ name: 'title', label: 'Title' }),
    t.string({
      name: 'secret',
      label: 'Secret',
      description: 'Never shown',
      hidden: true,
      validators: [required()],
    }),
    t.object({
      name: 'meta',
      label: 'Meta',
      hidden: true,
      fields: [t.string({ name: 'k', label: 'K', validators: [required()] })],
    })
  );

  it('renders no label, description or editor', async () => {
    renderForm(collection);
    await screen.findByLabelText('Title');
    expect(screen.queryByText('Secret')).toBeNull();
    expect(screen.queryByText('Never shown')).toBeNull();
    expect(screen.queryByText('Meta')).toBeNull();
  });

  it('keeps its stored value on save and never blocks Save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(collection, { title: 'A', meta: { k: '' } }, onSave);
    await user.type(await screen.findByLabelText('Title'), 'b');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ab', meta: { k: '' } })
    );
  });
});

describe('field defaultValue', () => {
  const { fields } = collectionOf(
    t.string({ name: 'title', label: 'Title', defaultValue: 'Untitled' }),
    t.string({ name: 'plain' }),
    t.number({ name: 'price', defaultValue: 5 }),
    t.number({ name: 'zero', defaultValue: 0 }),
    t.boolean({ name: 'flag', defaultValue: true })
  );
  const contextOf = async () => ({
    registry: await resolveFieldPlugins(corePlugins),
  });

  it('fills a new item, keeps falsy defaults, and falls back to the plugin default', async () => {
    const values = seedItem(undefined, fields, await contextOf());
    expect(values).toMatchObject({
      title: 'Untitled',
      plain: '',
      price: '5',
      zero: '0',
      flag: true,
    });
  });

  it('lets defaultItem win over a field default', async () => {
    const values = seedItem({ title: 'Mine' }, fields, await contextOf());
    expect(values.title).toBe('Mine');
  });

  it('does not share an object default between items', async () => {
    const { fields: objectFields } = collectionOf(
      t.object({
        name: 'o',
        defaultValue: { a: 'x' },
        fields: [t.string({ name: 'a' })],
      })
    );
    const context = await contextOf();
    const a = seedItem(undefined, objectFields, context);
    const b = seedItem(undefined, objectFields, context);
    expect(a.o).toEqual({ a: 'x' });
    expect(a.o).not.toBe(b.o);
  });

  it('fills a field inside an object of a new item', async () => {
    const { fields: nestedFields } = collectionOf(
      t.object({
        name: 'seo',
        fields: [
          t.string({ name: 'title', defaultValue: 'x' }),
          t.string({ name: 'note' }),
        ],
      })
    );
    const context = await contextOf();
    expect(seedItem(undefined, nestedFields, context).seo).toEqual({
      title: 'x',
      note: '',
    });
    expect(seedItem({ seo: { note: 'n' } }, nestedFields, context).seo).toEqual(
      { title: 'x', note: 'n' }
    );
  });

  it('never fills a loaded document, so a cleared field stays cleared', async () => {
    const context = await contextOf();
    const values = ingestDocument({ title: 'A' }, fields, context);
    expect(values.price).toBe(null);
    expect(digestDocument(values, fields, context)).not.toHaveProperty('price');
  });

  it('leaves a loaded document alone in the editor', async () => {
    renderForm(collectionOf(fields[0]));
    expect(await screen.findByLabelText('Title')).toHaveValue('');
  });
});
