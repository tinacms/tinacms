import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../config';
import type {
  ContentProvider,
  DocumentSummary,
} from '../../../core/content/contract';
import { toFieldAddress } from '../../../core/field/address';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import { type PluginManifest, definePlugin } from '../../../core/plugin';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { FormProvider, TinaProvider } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import referenceFieldPlugin from './reference-field.plugin';

const DOCUMENT_PATH = 'content/posts/featured.mdx';
const ABOUT = 'content/pages/about.mdx';
const CONTACT = 'content/pages/contact.mdx';
const ADA = 'content/authors/ada.mdx';

const SUMMARIES: Record<string, DocumentSummary[]> = {
  page: [{ path: ABOUT }, { path: CONTACT }],
  author: [{ path: ADA }],
};

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.reference({
      name: 'author',
      label: 'Author',
      required: true,
      collections: ['author'],
    }),
    t.reference({ name: 'page', label: 'Page', collections: ['page'] }),
    t.reference({
      name: 'related',
      label: 'Related',
      collections: ['page', 'author'],
    }),
  ],
};

const [authorNode, pageNode] = collection.fields;

const contentPlugin = (
  overrides: Partial<ContentProvider> = {}
): PluginManifest => {
  const provider: ContentProvider = {
    list: vi.fn(async (name: string) => SUMMARIES[name] ?? []),
    get: vi.fn(async () => null),
    update: vi.fn(async (_collection, path, value) => ({
      path,
      document: value,
    })),
    ...overrides,
  };
  return definePlugin({
    name: 'test:content:stub',
    provides: ['content'],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });
};

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([referenceFieldPlugin]);

const renderField = (document?: TinaDocument, content = contentPlugin()) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [referenceFieldPlugin, content],
        schema: { collections: [collection] },
      })}
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

describe('ReferenceField rendering', () => {
  it('shows the path of the referenced document', async () => {
    renderField({ page: ABOUT });
    expect(await screen.findByLabelText('Page')).toHaveValue(ABOUT);
  });

  it('shows the placeholder when the field is absent', async () => {
    renderField();
    expect(await screen.findByLabelText('Page')).toHaveAttribute(
      'placeholder',
      'Search documents…'
    );
  });
});

describe('ReferenceField searching', () => {
  it('narrows the options to what was typed', async () => {
    renderField();
    await userEvent.type(await screen.findByLabelText('Page'), 'contact');
    expect(await screen.findByRole('option', { name: CONTACT })).toBeVisible();
    expect(
      screen.queryByRole('option', { name: ABOUT })
    ).not.toBeInTheDocument();
  });

  it('says so when nothing matches', async () => {
    renderField();
    await userEvent.type(await screen.findByLabelText('Page'), 'nothing');
    expect(await screen.findByText('No documents match.')).toBeVisible();
  });
});

describe('ReferenceField lookup', () => {
  it('offers every document of the collection it names', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText('Page'));
    expect(await screen.findByRole('option', { name: ABOUT })).toBeVisible();
    expect(await screen.findByRole('option', { name: CONTACT })).toBeVisible();
  });

  it('draws candidates from every collection a field names', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText('Related'));
    expect(await screen.findByRole('option', { name: ABOUT })).toBeVisible();
    expect(await screen.findByRole('option', { name: ADA })).toBeVisible();
  });

  it('asks the content capability for each collection a field names', async () => {
    const list = vi.fn(async (name: string) => SUMMARIES[name] ?? []);
    renderField(undefined, contentPlugin({ list }));
    await userEvent.click(await screen.findByLabelText('Related'));
    await screen.findByRole('option', { name: ADA });
    expect(list.mock.calls.map(([name]) => name).sort()).toEqual([
      'author',
      'page',
    ]);
  });
});

describe('ReferenceField value updates', () => {
  it('stores the path of the chosen document', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText('Page'));
    await userEvent.click(await screen.findByRole('option', { name: ABOUT }));
    expect(valueOf('page')).toBe(ABOUT);
  });

  it('clears an optional reference through the clear button', async () => {
    const { container } = renderField({ page: ABOUT });
    const input = await screen.findByLabelText('Page');
    const clear = container.querySelector('[data-slot="combobox-clear"]');
    expect(clear).not.toBeNull();
    await userEvent.click(clear as Element);
    expect(valueOf('page')).toBeNull();
    expect(input).toHaveValue('');
  });

  it('offers no clear button on a required reference', async () => {
    const { container } = renderField({ author: ADA });
    await screen.findByLabelText('Author');
    expect(
      container.querySelectorAll('[data-slot="combobox-clear"]')
    ).toHaveLength(0);
  });
});

describe('ReferenceField missing references', () => {
  it('marks a stored path that no document answers', async () => {
    renderField({ page: 'content/pages/deleted.mdx' });
    expect(await screen.findByLabelText('Page')).toHaveValue(
      'content/pages/deleted.mdx (missing)'
    );
  });

  it('keeps a missing reference selectable so it is not silently dropped', async () => {
    renderField({ page: 'content/pages/deleted.mdx' });
    await userEvent.click(await screen.findByLabelText('Page'));
    expect(
      await screen.findByRole('option', {
        name: 'content/pages/deleted.mdx (missing)',
      })
    ).toBeVisible();
    expect(valueOf('page')).toBe('content/pages/deleted.mdx');
  });
});

describe('ReferenceField validation', () => {
  it('requires a reference to be chosen', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('reference');
    expect(validateField(authorNode, descriptor, ADA)).toEqual([]);
    expect(validateField(authorNode, descriptor, undefined)).toEqual([
      'Author is required',
    ]);
    expect(validateField(authorNode, descriptor, '')).toEqual([
      'Author is required',
    ]);
  });

  it('passes an optional reference left empty', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('reference');
    expect(validateField(pageNode, descriptor, '')).toEqual([]);
    expect(validateField(pageNode, descriptor, undefined)).toEqual([]);
    expect(validateField(pageNode, descriptor, null)).toEqual([]);
  });
});

describe('ReferenceField ingest and digest', () => {
  it('round-trips a stored path unchanged', async () => {
    const registry = await resolveRegistry();
    const stored = { author: ADA, page: ABOUT };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual(stored);
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('leaves an absent reference absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({});
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
  });

  it('digests a cleared reference as absent, not literal null', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ page: null }, collection.fields, { registry })
    ).toEqual({});
  });
});

describe('ReferenceField metadata wrapping', () => {
  it('registers the reference descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('reference');
    expect(descriptor?.metadata).toEqual({ layout: 'inline' });
    expect(descriptor?.defaultValue).toBeUndefined();
  });
});
