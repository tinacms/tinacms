import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
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
import { Field, FormProvider, TinaProvider } from '../../../editor';
import { t } from '../../../index';
import numberFieldPlugin from './number-field.plugin';

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  fields: [
    t.number({
      name: 'rating',
      label: 'Rating',
      required: true,
      min: 1,
      max: 5,
      step: 0.5,
    }),
    // Required but unbounded — proves `0` is a present value, not empty.
    t.number({ name: 'count', label: 'Count', required: true }),
    // Optional — for negatives, decimals, and empty handling.
    t.number({ name: 'weight', label: 'Weight' }),
  ],
};

const [ratingNode, countNode] = collection.fields;

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([numberFieldPlugin]);

const renderField = (address: string, document?: TinaDocument) =>
  render(
    <TinaProvider plugins={[numberFieldPlugin]}>
      <FormProvider collection={collection} document={document}>
        <Field address={address} />
      </FormProvider>
    </TinaProvider>
  );

describe('NumberField rendering', () => {
  it('renders a stored number as its string value', async () => {
    renderField('weight', { weight: 3 });
    const input = (await screen.findByLabelText('weight')) as HTMLInputElement;
    expect(input.value).toBe('3');
  });

  it('renders empty when the field is absent (no default value)', async () => {
    renderField('weight');
    const input = (await screen.findByLabelText('weight')) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('renders a stored zero rather than blanking it', async () => {
    renderField('count', { count: 0 });
    const input = (await screen.findByLabelText('count')) as HTMLInputElement;
    expect(input.value).toBe('0');
  });

  it('applies the schema step to the input', async () => {
    renderField('rating', { rating: 3 });
    const input = (await screen.findByLabelText('rating')) as HTMLInputElement;
    expect(input.step).toBe('0.5');
  });
});

describe('NumberField value updates', () => {
  it('writes a decimal keystroke sequence back through the store', async () => {
    renderField('weight');
    const input = (await screen.findByLabelText('weight')) as HTMLInputElement;
    await userEvent.type(input, '1.5');
    expect(input.value).toBe('1.5');
  });

  it('accepts a negative value', async () => {
    renderField('weight');
    const input = (await screen.findByLabelText('weight')) as HTMLInputElement;
    await userEvent.type(input, '-5');
    expect(input.value).toBe('-5');
  });

  it('surfaces the shared min message while editing', async () => {
    renderField('rating');
    const input = await screen.findByLabelText('rating');
    await userEvent.type(input, '0');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Rating must be at least 1'
    );
  });
});

describe('NumberField validation', () => {
  it('coerces the editor string and applies min/max bounds', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateField(ratingNode, descriptor, '3')).toEqual([]);
    expect(validateField(ratingNode, descriptor, '0')).toEqual([
      'Rating must be at least 1',
    ]);
    expect(validateField(ratingNode, descriptor, '6')).toEqual([
      'Rating must be at most 5',
    ]);
  });

  it('treats zero as present, not empty, for a required field', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateField(countNode, descriptor, '0')).toEqual([]);
    expect(validateField(countNode, descriptor, '')).toEqual([
      'Count is required',
    ]);
  });

  it('rejects a non-numeric value', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateField(countNode, descriptor, 'abc')).toEqual([
      'Count must be a number',
    ]);
  });

  it('appends a descriptor-level custom validate error', () => {
    const descriptor = {
      type: 'number',
      Component: () => null,
      validate: (value: unknown) => (value === '13' ? 'Unlucky' : null),
    };
    expect(validateField(countNode, descriptor, '13')).toContain('Unlucky');
  });
});

describe('NumberField ingest and digest', () => {
  it('round-trips numbers through parse (ingest) and serialize (digest)', async () => {
    const registry = await resolveRegistry();
    const stored = { rating: 3, count: 0, weight: -1.5 };
    const ingested = ingestDocument(stored, collection.fields, registry);
    // parse: stored number -> editor string
    expect(ingested).toEqual({ rating: '3', count: '0', weight: '-1.5' });
    // serialize: editor string -> stored number (zero and decimal preserved)
    expect(digestDocument(ingested, collection.fields, registry)).toEqual(
      stored
    );
  });

  it('leaves an absent field absent (no default seeding)', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, registry)).toEqual({});
    expect(digestDocument({}, collection.fields, registry)).toEqual({});
  });

  it('drops an empty (undefined) field on digest', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ weight: undefined }, collection.fields, registry)
    ).toEqual({});
  });

  it('normalises a stored null to empty rather than "null"/NaN', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument(
      { weight: null },
      collection.fields,
      registry
    );
    expect(ingested.weight).toBeUndefined();
    expect(digestDocument(ingested, collection.fields, registry)).toEqual({});
  });
});

describe('NumberField metadata wrapping', () => {
  it('registers the number descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(descriptor?.metadata).toEqual({ layout: 'inline' });
    expect(descriptor?.defaultValue).toBeUndefined();
  });
});
