import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import '../plugins/fields/rich-text/rich-text-field.client';
import type { MediaProvider } from '../core/media/contract';
import { definePlugin } from '../core/plugin';
import { formatAdapterFor } from '../plugins/content/local/adapters/format-adapters';
import { digestDocument, ingestDocument } from '../core/form/ingest';
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
  const collection = collectionOf(
    t.string({ name: 'title', defaultValue: 'Untitled' }),
    t.string({ name: 'plain' }),
    t.number({ name: 'price', defaultValue: 5 }),
    t.number({ name: 'zero', defaultValue: 0 }),
    t.boolean({ name: 'flag', defaultValue: true })
  );
  const ingest = async (document: TinaDocument) => {
    const registry = await resolveFieldPlugins(corePlugins);
    const context = { registry };
    const values = ingestDocument(document, collection.fields, context);
    return {
      values,
      digest: digestDocument(values, collection.fields, context),
    };
  };

  it('fills an absent key, keeps stored falsy values, and falls back to the plugin default', async () => {
    const { values } = await ingest({ title: '', flag: false });
    expect(values.title).toBe('');
    expect(values.flag).toBe(false);
    expect(values.price).toBe('5');
    expect(values.plain).toBe('');
    expect((await ingest({})).values.title).toBe('Untitled');
  });

  it('keeps a cleared defaulted field as null and bypasses serialize', async () => {
    const { values, digest } = await ingest({ price: null, zero: null });
    expect(values.price).toBe(null);
    expect(digest).toMatchObject({ price: null, zero: null });
    const again = await ingest(digest);
    expect(again.values.price).toBe(null);
    expect(again.digest.price).toBe(null);
  });

  it('still drops null for a field without a default', async () => {
    const { digest } = await ingest({ plain: null });
    expect(digest).not.toHaveProperty('plain');
  });

  it('does not share an object default between documents', async () => {
    const obj = collectionOf(
      t.object({
        name: 'o',
        defaultValue: { a: 'x' },
        fields: [t.string({ name: 'a' })],
      })
    );
    const registry = await resolveFieldPlugins(corePlugins);
    const a = ingestDocument({}, obj.fields, { registry });
    const b = ingestDocument({}, obj.fields, { registry });
    expect(a.o).toEqual({ a: 'x' });
    expect(a.o).not.toBe(b.o);
  });
});

describe('clearing a field that has a defaultValue', () => {
  const collection = collectionOf(
    t.number({ name: 'price', defaultValue: 5 }),
    t.select({
      name: 'size',
      options: [{ value: 's' }, { value: 'm' }],
      defaultValue: 'm',
    }),
    t.datetime({ name: 'when', defaultValue: '2026-01-01T00:00' }),
    t.reference({ name: 'author', collections: ['author'], defaultValue: 'a' }),
    t.image({ name: 'hero', defaultValue: 'a.png' })
  );
  const cleared = Object.fromEntries(
    collection.fields.map((field) => [field.name, null])
  );

  it.each(['json', 'md'] as const)(
    'survives save and reload in a %s collection',
    async (format) => {
      const registry = await resolveFieldPlugins([...corePlugins, mediaPlugin]);
      const context = { registry };
      const adapter = formatAdapterFor(format);
      const keys = collection.fields.map((field) => field.name);
      const saved = digestDocument(cleared, collection.fields, context);
      const raw = adapter.serialize(saved, undefined, undefined, keys);
      const reloaded = ingestDocument(
        adapter.parse(raw),
        collection.fields,
        context
      );
      expect(reloaded).toEqual(cleared);
      expect(digestDocument(reloaded, collection.fields, context)).toEqual(
        cleared
      );
    }
  );
});
