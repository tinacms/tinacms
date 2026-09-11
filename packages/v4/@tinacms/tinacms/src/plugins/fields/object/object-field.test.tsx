import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { FormProvider, TinaProvider } from '../../../editor';
import { formStatus, toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import arrayFieldPlugin from '../array/array-field.plugin';
import numberFieldPlugin from '../number/number-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import objectFieldPlugin from './object-field.plugin';
import { asObjectFieldSchema } from './object-field.schema';

const NO_COLLECTIONS = { collections: [] };
const DOCUMENT_PATH = 'content/pages/home.mdx';
const PLUGINS = [
  objectFieldPlugin,
  arrayFieldPlugin,
  stringFieldPlugin,
  numberFieldPlugin,
];

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const status = () =>
  formStatus(useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]);

const collection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.object({
      name: 'seo',
      label: 'SEO',
      required: true,
      fields: [
        t.string({ name: 'title', label: 'Title', required: true }),
        t.number({ name: 'views', label: 'Views' }),
      ],
    }),
    t.object({
      name: 'meta',
      label: 'Meta',
      fields: [
        t.object({
          name: 'social',
          label: 'Social',
          fields: [
            t.string({ name: 'handle', label: 'Handle', required: true }),
          ],
        }),
      ],
    }),
    t.array({
      name: 'blocks',
      label: 'Blocks',
      fields: [
        t.object({
          name: 'hero',
          label: 'Hero',
          fields: [t.number({ name: 'height', label: 'Height' })],
        }),
      ],
    }),
    t.object({
      name: 'layout',
      label: 'Layout',
      fields: [
        t.array({
          name: 'rows',
          label: 'Rows',
          fields: [t.string({ name: 'label', label: 'Label', required: true })],
        }),
      ],
    }),
  ],
};

const [seoNode, metaNode] = collection.fields;
const layoutNode = collection.fields[3];

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins(PLUGINS);

const renderField = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({ plugins: PLUGINS, schema: NO_COLLECTIONS })}
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

describe('ObjectField rendering', () => {
  it('renders each nested field with its own label and value', async () => {
    renderField({ seo: { title: 'Home', views: 10 } });
    const title = (await screen.findByLabelText('Title')) as HTMLInputElement;
    const views = (await screen.findByLabelText('Views')) as HTMLInputElement;
    expect(title.value).toBe('Home');
    expect(views.value).toBe('10');
  });

  it('renders the nested fields even when the object is absent', async () => {
    renderField();
    const title = (await screen.findByLabelText('Title')) as HTMLInputElement;
    expect(title.value).toBe('');
  });

  it('renders an object nested inside an object', async () => {
    renderField({ meta: { social: { handle: '@tina' } } });
    const handle = (await screen.findByLabelText('Handle')) as HTMLInputElement;
    expect(handle.value).toBe('@tina');
  });
});

describe('ObjectField value updates', () => {
  it('writes a nested field edit back through the store', async () => {
    renderField({ seo: { title: 'Home' } });
    const title = await screen.findByLabelText('Title');
    await userEvent.clear(title);
    await userEvent.type(title, 'About');
    expect(valueOf('seo')).toEqual({ title: 'About' });
  });
});

describe('ObjectField dirty tracking', () => {
  it('goes dirty on a nested edit, then back to clean once it is undone', async () => {
    renderField({ seo: { title: 'Home' } });
    const title = await screen.findByLabelText('Title');
    expect(status()).toBe('pristine');

    await userEvent.type(title, '!');
    expect(status()).toBe('dirty');

    await userEvent.clear(title);
    await userEvent.type(title, 'Home');
    expect(valueOf('seo')).toEqual({ title: 'Home' });
    expect(status()).toBe('clean');
  });
});

describe('ObjectField validation', () => {
  it('rejects an empty value on a required object field', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('object');
    expect(validateField(seoNode, descriptor, { title: 'Home' })).toEqual([]);
    expect(validateField(seoNode, descriptor, {})).toEqual(['SEO is required']);
    expect(validateField(seoNode, descriptor, undefined)).toEqual([
      'SEO is required',
    ]);
  });

  it("validates each nested field and keys messages by the field's nested address", async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('object');
    const errors = descriptor?.validateChildren?.(
      { title: '', views: 10 },
      seoNode,
      'seo',
      registry
    );
    expect(errors).toEqual({ 'seo.title': ['Title is required'] });
  });

  it('recurses into an object nested inside an object', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('object');
    const errors = descriptor?.validateChildren?.(
      { social: { handle: '' } },
      metaNode,
      'meta',
      registry
    );
    expect(errors).toEqual({ 'meta.social.handle': ['Handle is required'] });
  });

  it('surfaces a nested field error at its own address, and rolls it up onto the object', async () => {
    renderField({ seo: { title: 'Home' } });
    const title = await screen.findByLabelText('Title');
    await userEvent.clear(title);
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    for (const alert of screen.getAllByRole('alert')) {
      expect(alert).toHaveTextContent('Title is required');
    }
  });
});

describe('ObjectField ingest and digest', () => {
  it('recurses into nested fields, including one with its own parse/serialize', async () => {
    const registry = await resolveRegistry();
    const stored = { seo: { title: 'Home', views: 10 } };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual({ seo: { title: 'Home', views: '10' } });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('leaves an absent object absent (no default seeding)', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({});
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
  });

  it('reads null as an empty object', async () => {
    const registry = await resolveRegistry();
    expect(
      ingestDocument({ meta: null }, collection.fields, { registry })
    ).toEqual({ meta: {} });
  });

  it('refuses stored content that is not an object', async () => {
    const registry = await resolveRegistry();
    for (const bad of ['oops', 42, true, ['Home']]) {
      expect(() =>
        ingestDocument({ seo: bad }, collection.fields, { registry })
      ).toThrow(/expected an object/);
    }
  });
});

describe('ObjectField composed with array', () => {
  it('round-trips an object nested inside an array', async () => {
    const registry = await resolveRegistry();
    const stored = { blocks: [{ hero: { height: 10 } }] };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual({ blocks: [{ hero: { height: '10' } }] });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('round-trips an array nested inside an object', async () => {
    const registry = await resolveRegistry();
    const stored = {
      layout: { rows: [{ label: 'top' }, { label: 'bottom' }] },
    };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual(stored);
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('recurses validation through an array nested inside an object', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('object');
    const errors = descriptor?.validateChildren?.(
      { rows: [{ label: 'ok' }, { label: '' }] },
      layoutNode,
      'layout',
      registry
    );
    expect(errors).toEqual({ 'layout.rows.1.label': ['Label is required'] });
  });
});

describe('asObjectFieldSchema', () => {
  it('throws on an object node with no fields rather than passing it through', () => {
    const node = { name: 'seo', type: 'object' } as FieldSchema;
    expect(() => asObjectFieldSchema(node)).toThrow(/needs a "fields" array/);
  });

  it('returns the narrowed node when fields is present', () => {
    const node = { name: 'seo', type: 'object', fields: [] } as FieldSchema;
    expect(asObjectFieldSchema(node).fields).toEqual([]);
  });
});

describe('ObjectField metadata', () => {
  it('registers the object descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('object');
    expect(descriptor?.metadata).toEqual({
      layout: 'block',
      labelable: false,
    });
    expect(descriptor?.defaultValue).toBeUndefined();
  });
});
