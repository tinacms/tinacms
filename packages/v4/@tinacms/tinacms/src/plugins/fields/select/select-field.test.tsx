import { render, screen } from '@testing-library/react';
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
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { FormProvider, TinaProvider } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import selectFieldPlugin from './select-field.plugin';

const NO_COLLECTIONS = { collections: [] };
const DOCUMENT_PATH = 'content/posts/featured.mdx';

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.select({
      name: 'status',
      label: 'Status',
      required: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
      ],
    }),
    t.select({
      name: 'priority',
      label: 'Priority',
      options: [{ value: 'low' }, { value: 'high' }],
    }),
  ],
};

const [statusNode, priorityNode] = collection.fields;

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([selectFieldPlugin]);

const renderField = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [selectFieldPlugin],
        schema: NO_COLLECTIONS,
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

describe('SelectField rendering', () => {
  it('renders the label of a stored option', async () => {
    renderField({ status: 'published' });
    const trigger = await screen.findByLabelText('Status');
    expect(trigger).toHaveTextContent('Published');
  });

  it('falls back to the raw value when an option has no label', async () => {
    renderField({ priority: 'low' });
    const trigger = await screen.findByLabelText('Priority');
    expect(trigger).toHaveTextContent('low');
  });

  it('shows the placeholder when the field is absent', async () => {
    renderField();
    const trigger = await screen.findByLabelText('Priority');
    expect(trigger).toHaveTextContent('Select...');
  });
});

describe('SelectField value updates', () => {
  it('writes the chosen option value back through the store', async () => {
    renderField();
    const trigger = await screen.findByLabelText('Status');
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Draft' }));
    expect(valueOf('status')).toBe('draft');
  });

  it('offers no clear option on a required field', async () => {
    renderField();
    const trigger = await screen.findByLabelText('Status');
    await userEvent.click(trigger);
    expect(
      screen.queryByRole('option', { name: 'None' })
    ).not.toBeInTheDocument();
  });

  it('clears an optional field back to absent through the None option', async () => {
    renderField({ priority: 'low' });
    const trigger = await screen.findByLabelText('Priority');
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'None' }));
    expect(valueOf('priority')).toBeNull();
    expect(trigger).toHaveTextContent('Select...');
  });
});

describe('SelectField validation', () => {
  it('requires a value to be chosen', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('select');
    expect(validateField(statusNode, descriptor, 'draft')).toEqual([]);
    expect(validateField(statusNode, descriptor, undefined)).toEqual([
      'Status is required',
    ]);
  });

  it('rejects a value outside the option list', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('select');
    expect(validateField(statusNode, descriptor, 'archived')).toEqual([
      'Status must be one of the listed options',
    ]);
  });

  it('passes an optional field left empty', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('select');
    expect(validateField(priorityNode, descriptor, '')).toEqual([]);
    expect(validateField(priorityNode, descriptor, undefined)).toEqual([]);
    expect(validateField(priorityNode, descriptor, null)).toEqual([]);
  });
});

describe('SelectField ingest and digest', () => {
  it('round-trips a stored value unchanged', async () => {
    const registry = await resolveRegistry();
    const stored = { status: 'published', priority: 'high' };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual(stored);
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('leaves an absent field absent (no default seeding)', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({});
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
  });

  it('digests a cleared (null) selection as absent, not literal null', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ priority: null }, collection.fields, { registry })
    ).toEqual({});
  });

  it('ingests a stored null as absent', async () => {
    const registry = await resolveRegistry();
    expect(
      ingestDocument({ priority: null }, collection.fields, { registry })
    ).toEqual({});
  });
});

describe('SelectField metadata wrapping', () => {
  it('registers the select descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('select');
    expect(descriptor?.metadata).toEqual({ layout: 'inline' });
    expect(descriptor?.defaultValue).toBeUndefined();
  });
});
