import { type ComponentType, Fragment, type ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { formatAdminRoute } from '../../../admin/routing';
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
import { QueryClient } from '@tanstack/react-query';
import { FormProvider, TinaProvider, contentKeys } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { coreValidatorRegistry } from '../../../test/core-validators';
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

// An option's name is its path followed by `<Collection> · <path>`.
const option = (path: string) => ({
  name: new RegExp(`^${path.replaceAll('.', '\\.')}\\s`),
});

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
      validators: [required()],
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

const renderField = (
  document?: TinaDocument,
  content = contentPlugin(),
  Wrapper: ComponentType<{ children: ReactNode }> = Fragment,
  queryClient?: QueryClient
) =>
  render(
    <Wrapper>
      <TinaProvider
        queryClient={queryClient}
        config={asResolvedConfig({
          plugins: [referenceFieldPlugin, content, coreValidatorsPlugin],
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
    </Wrapper>
  );

describe('ReferenceField rendering', () => {
  it('shows the path of the referenced document', async () => {
    renderField({ page: ABOUT });
    expect(await screen.findByLabelText(/^Page\b/)).toHaveValue(ABOUT);
  });

  it('shows the placeholder when the field is absent', async () => {
    renderField();
    expect(await screen.findByLabelText(/^Page\b/)).toHaveAttribute(
      'placeholder',
      'Search documents…'
    );
  });
});

describe('ReferenceField searching', () => {
  it('narrows the options to what was typed', async () => {
    renderField();
    await userEvent.type(await screen.findByLabelText(/^Page\b/), 'contact');
    expect(await screen.findByRole('option', option(CONTACT))).toBeVisible();
    expect(screen.queryByRole('option', option(ABOUT))).not.toBeInTheDocument();
  });

  it('says so when nothing matches', async () => {
    renderField();
    await userEvent.type(await screen.findByLabelText(/^Page\b/), 'nothing');
    expect(await screen.findByText('No documents match.')).toBeVisible();
  });
});

describe('ReferenceField lookup', () => {
  it('offers every document of the collection it names', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText(/^Page\b/));
    expect(await screen.findByRole('option', option(ABOUT))).toBeVisible();
    expect(await screen.findByRole('option', option(CONTACT))).toBeVisible();
  });

  it('draws candidates from every collection a field names', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText(/^Related\b/));
    expect(await screen.findByRole('option', option(ABOUT))).toBeVisible();
    expect(await screen.findByRole('option', option(ADA))).toBeVisible();
  });

  it('asks the content capability for each collection a field names', async () => {
    const list = vi.fn(async (name: string) => SUMMARIES[name] ?? []);
    renderField(undefined, contentPlugin({ list }));
    await userEvent.click(await screen.findByLabelText(/^Related\b/));
    await screen.findByRole('option', option(ADA));
    expect(list.mock.calls.map(([name]) => name).sort()).toEqual([
      'author',
      'page',
    ]);
  });
});

describe('ReferenceField value updates', () => {
  it('stores the path of the chosen document', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText(/^Page\b/));
    await userEvent.click(await screen.findByRole('option', option(ABOUT)));
    expect(valueOf('page')).toBe(ABOUT);
  });

  it('clears an optional reference through the clear button', async () => {
    renderField({ page: ABOUT });
    const input = await screen.findByLabelText(/^Page\b/);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(valueOf('page')).toBeNull();
    expect(input).toHaveValue('');
  });

  it('offers no clear button on a required reference', async () => {
    renderField({ author: ADA });
    await screen.findByLabelText(/^Author\b/);
    expect(
      screen.queryByRole('button', { name: 'Clear' })
    ).not.toBeInTheDocument();
  });
});

const DELETED = 'content/pages/deleted.mdx';

describe('ReferenceField missing references', () => {
  it('keeps the stored path in the box and warns without blocking', async () => {
    renderField({ page: DELETED });
    expect(await screen.findByLabelText(/^Page\b/)).toHaveValue(DELETED);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'This document no longer exists.'
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(valueOf('page')).toBe(DELETED);
  });

  it('does not offer the missing path as an option', async () => {
    renderField({ page: DELETED });
    await userEvent.click(await screen.findByLabelText(/^Page\b/));
    await screen.findByRole('option', option(ABOUT));
    expect(screen.queryByRole('option', option(DELETED))).toBeNull();
  });

  it('lets a required field clear a missing reference, then shows the required error', async () => {
    renderField({ author: 'content/authors/gone.mdx' });
    await screen.findByRole('status');
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(valueOf('author')).toBeNull();
    const input = screen.getByLabelText(/^Author\b/);
    await userEvent.click(input);
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Author is required'
    );
  });

  it('shows no warning while a list is still loading', async () => {
    renderField(
      { page: DELETED },
      contentPlugin({ list: () => new Promise(() => {}) })
    );
    const input = await screen.findByLabelText(/^Page\b/);
    expect(input).toHaveValue(DELETED);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', 'Loading documents…');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('keeps the warning and the box while a background refetch runs', async () => {
    let refetching = false;
    const refetchStarted = vi.fn();
    const queryClient = new QueryClient();
    renderField(
      { page: DELETED },
      contentPlugin({
        list: async (name: string) => {
          if (refetching) {
            refetchStarted();
            return new Promise(() => {});
          }
          return SUMMARIES[name] ?? [];
        },
      }),
      Fragment,
      queryClient
    );
    const input = await screen.findByLabelText(/^Page\b/);
    await screen.findByRole('status');
    refetching = true;
    void queryClient.refetchQueries({ queryKey: contentKeys.list('page') });
    await waitFor(() => expect(refetchStarted).toHaveBeenCalled());
    expect(screen.getByRole('status')).toHaveTextContent(
      'This document no longer exists.'
    );
    expect(input).toBeEnabled();
    expect(input).toHaveAttribute('placeholder', 'Search documents…');
  });

  it('treats a stored value that is not a path as no value', async () => {
    renderField({ page: 42 } as unknown as TinaDocument);
    const input = await screen.findByLabelText(/^Page\b/);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  });
});

describe('ReferenceField failed lists', () => {
  it('disables the field and reports the load error', async () => {
    renderField(
      { page: ABOUT },
      contentPlugin({
        list: async () => {
          throw new Error('Network down');
        },
      })
    );
    const input = await screen.findByLabelText(/^Page\b/);
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    for (const alert of alerts) expect(alert).toHaveTextContent('Network down');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', 'Could not load documents');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('disables the whole field when one of several lists fails', async () => {
    renderField(
      undefined,
      contentPlugin({
        list: async (name: string) => {
          if (name === 'author') throw new Error('Authors failed');
          return SUMMARIES[name] ?? [];
        },
      })
    );
    const input = await screen.findByLabelText(/^Related\b/);
    await screen.findAllByText('Authors failed');
    expect(input).toBeDisabled();
    await userEvent.click(input);
    expect(screen.queryByRole('option')).toBeNull();
  });
});

describe('ReferenceField document labels', () => {
  it('puts the collection under each path, falling back to its name', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText(/^Page\b/));
    const row = await screen.findByRole('option', option(ABOUT));
    expect(row).toHaveTextContent(`page · ${ABOUT}`);
  });

  it('groups by collection in the order the field names them', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText(/^Related\b/));
    await screen.findByRole('option', option(ADA));
    const headings = screen
      .getAllByRole('group')
      .filter((group) => group.dataset.slot === 'combobox-group')
      .map(
        (group) => within(group).getAllByText(/^(page|author)$/)[0]?.textContent
      );
    expect(headings).toEqual(['page', 'author']);
  });

  it('shows no group heading for a single collection', async () => {
    renderField();
    await userEvent.click(await screen.findByLabelText(/^Page\b/));
    await screen.findByRole('option', option(ABOUT));
    expect(
      screen
        .queryAllByRole('group')
        .filter((group) => group.dataset.slot === 'combobox-group')
    ).toHaveLength(0);
  });

  it('lists a path named by two collections once, under the first', async () => {
    const shared = contentPlugin({
      list: async () => [{ path: ABOUT }],
    });
    renderField(undefined, shared);
    await userEvent.click(await screen.findByLabelText(/^Related\b/));
    const rows = await screen.findAllByRole('option', option(ABOUT));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent(`page · ${ABOUT}`);
  });
});

describe('ReferenceField opening a document', () => {
  const Location = () => (
    <output data-testid='location'>{useLocation().pathname}</output>
  );
  const InRouter = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      {children}
      <Location />
    </MemoryRouter>
  );

  it('navigates to the document in the collection that listed it', async () => {
    renderField({ page: ABOUT }, contentPlugin(), InRouter);
    await userEvent.click(
      await screen.findByRole('button', { name: `Open ${ABOUT}` })
    );
    expect(screen.getByTestId('location')).toHaveTextContent(
      formatAdminRoute({
        view: 'document',
        collection: 'page',
        path: ABOUT,
      }).slice(1)
    );
  });

  it('hides Open for a missing document', async () => {
    renderField({ page: DELETED }, contentPlugin(), InRouter);
    await screen.findByRole('status');
    expect(screen.queryByRole('button', { name: /^Open/ })).toBeNull();
  });

  it('still renders without a Router, with no Open button', async () => {
    renderField({ page: ABOUT });
    expect(await screen.findByLabelText(/^Page\b/)).toHaveValue(ABOUT);
    expect(screen.queryByRole('button', { name: /^Open/ })).toBeNull();
  });
});

describe('ReferenceField validation', () => {
  it('requires a reference to be chosen', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('reference');
    expect(validateFieldWithCore(authorNode, descriptor, ADA)).toEqual([]);
    expect(validateFieldWithCore(authorNode, descriptor, undefined)).toEqual([
      'Author is required',
    ]);
    expect(validateFieldWithCore(authorNode, descriptor, '')).toEqual([
      'Author is required',
    ]);
  });

  it('passes an optional reference left empty', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('reference');
    expect(validateFieldWithCore(pageNode, descriptor, '')).toEqual([]);
    expect(validateFieldWithCore(pageNode, descriptor, undefined)).toEqual([]);
    expect(validateFieldWithCore(pageNode, descriptor, null)).toEqual([]);
  });
});

describe('ReferenceField ingest and digest', () => {
  it('round-trips a stored path unchanged', async () => {
    const registry = await resolveRegistry();
    const stored = { author: ADA, page: ABOUT };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual({ ...stored, related: null });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('holds an absent reference as null and digests it as absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({
      author: null,
      page: null,
      related: null,
    });
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
