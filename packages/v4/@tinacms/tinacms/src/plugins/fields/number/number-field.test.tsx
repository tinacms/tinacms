import { act, fireEvent, render, screen } from '@testing-library/react';
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
import { max, min, required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { coreValidatorRegistry } from '../../../test/core-validators';
import { LabelledFields } from '../../../test/labelled-fields';
import numberFieldPlugin from './number-field.plugin';

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
    t.number({
      name: 'rating',
      label: 'Rating',
      validators: [required(), min(1), max(5)],
      step: 0.5,
    }),
    t.number({ name: 'count', label: 'Count', validators: [required()] }),
    t.number({ name: 'weight', label: 'Weight' }),
  ],
};

const [ratingNode, countNode, weightNode] = collection.fields;

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([numberFieldPlugin]);

const renderField = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [numberFieldPlugin, coreValidatorsPlugin],
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

describe('NumberField rendering', () => {
  it('renders a stored number as its string value', async () => {
    renderField({ weight: 3 });
    const input = (await screen.findByLabelText(
      /^Weight\b/
    )) as HTMLInputElement;
    expect(input.value).toBe('3');
  });

  it('renders empty when the field is absent (no default value)', async () => {
    renderField();
    const input = (await screen.findByLabelText(
      /^Weight\b/
    )) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('renders a stored zero rather than blanking it', async () => {
    renderField({ count: 0 });
    const input = (await screen.findByLabelText(
      /^Count\b/
    )) as HTMLInputElement;
    expect(input.value).toBe('0');
  });

  it('applies the schema step to the input', async () => {
    renderField({ rating: 3 });
    const input = (await screen.findByLabelText(
      /^Rating\b/
    )) as HTMLInputElement;
    expect(input.step).toBe('0.5');
  });

  it('accepts any step when the schema sets none', async () => {
    renderField({ weight: 3 });
    const input = (await screen.findByLabelText(
      /^Weight\b/
    )) as HTMLInputElement;
    expect(input.step).toBe('any');
  });
});

describe('NumberField value updates', () => {
  it('writes a decimal keystroke sequence back through the store', async () => {
    renderField();
    const input = (await screen.findByLabelText(
      /^Weight\b/
    )) as HTMLInputElement;
    await userEvent.type(input, '1.5');
    expect(input.value).toBe('1.5');
  });

  it('accepts a negative value', async () => {
    renderField();
    const input = (await screen.findByLabelText(
      /^Weight\b/
    )) as HTMLInputElement;
    await userEvent.type(input, '-5');
    expect(input.value).toBe('-5');
  });

  it('surfaces the shared min message once the editor leaves the field', async () => {
    renderField();
    const input = await screen.findByLabelText(/^Rating\b/);
    await userEvent.type(input, '0');
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Rating must be at least 1'
    );
  });

  // An empty input must clear the field. An empty string would serialize
  // through `Number('')` and write a 0 that the editor never typed.
  it('empties the field rather than storing an empty string', async () => {
    renderField({ weight: 3 });
    const input = await screen.findByLabelText(/^Weight\b/);
    await userEvent.clear(input);
    expect(valueOf('weight')).toBeNull();
  });

  it('keeps a typed value in the store', async () => {
    renderField();
    const input = await screen.findByLabelText(/^Weight\b/);
    await userEvent.type(input, '42');
    expect(valueOf('weight')).toBe('42');
  });
});

describe('NumberField stepping', () => {
  it('steps by the schema step with the buttons', async () => {
    renderField({ rating: 3, weight: 2.5 });
    await screen.findByLabelText(/^Rating\b/);
    const rows = screen.getAllByRole('button', { name: 'Increase' });
    await userEvent.click(rows[0]);
    expect(valueOf('rating')).toBe('3.5');
    await userEvent.click(rows[2]);
    expect(valueOf('weight')).toBe('3.5');
    expect(screen.getByLabelText(/^Weight\b/)).toHaveFocus();
  });

  it('steps once per arrow key and keeps the value a string', async () => {
    renderField({ rating: 3 });
    const input = await screen.findByLabelText(/^Rating\b/);
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(valueOf('rating')).toBe('3.5');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(valueOf('rating')).toBe('2.5');
  });

  it('stops at the limits and disables the button there', async () => {
    renderField({ rating: 5 });
    const input = await screen.findByLabelText(/^Rating\b/);
    expect(
      screen.getAllByRole('button', { name: 'Increase' })[0]
    ).toBeDisabled();
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(valueOf('rating')).toBe('5');
  });

  it('steps up from empty to the minimum', async () => {
    renderField();
    await screen.findByLabelText(/^Rating\b/);
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Increase' })[0]
    );
    expect(valueOf('rating')).toBe('1');
  });

  it('keeps a typed value past the limit and shows the error after blur', async () => {
    renderField();
    const input = (await screen.findByLabelText(
      /^Rating\b/
    )) as HTMLInputElement;
    await userEvent.type(input, '6');
    await userEvent.tab();
    expect(input.value).toBe('6');
    expect(valueOf('rating')).toBe('6');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Rating must be at most 5'
    );
  });

  it('skips the step buttons with Tab', async () => {
    renderField({ rating: 3 });
    const input = await screen.findByLabelText(/^Rating\b/);
    await userEvent.click(input);
    await userEvent.tab();
    expect(input).not.toHaveFocus();
    expect(document.activeElement?.tagName).not.toBe('BUTTON');
  });

  it('stores null and shows the required error after clearing a required field', async () => {
    renderField({ count: 5 });
    const input = await screen.findByLabelText(/^Count\b/);
    await userEvent.clear(input);
    await userEvent.tab();
    expect(valueOf('count')).toBeNull();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Count is required'
    );
  });
});

describe('NumberField sibling edits', () => {
  it('keeps its value while another field is edited', async () => {
    renderField({ rating: 3, weight: 2 });
    const rating = (await screen.findByLabelText(
      /^Rating\b/
    )) as HTMLInputElement;
    await userEvent.type(await screen.findByLabelText(/^Weight\b/), '5');
    expect(valueOf('weight')).toBe('25');
    expect(rating.value).toBe('3');
  });
});

describe('NumberField wheel guard', () => {
  // A wheel over a focused number input steps its value in a browser. The
  // field drops focus so a scroll past the form cannot edit the document.
  it('drops focus when the wheel scrolls over the input', async () => {
    renderField({ weight: 3 });
    const input = await screen.findByLabelText(/^Weight\b/);
    act(() => input.focus());
    expect(input).toHaveFocus();
    fireEvent.wheel(input);
    expect(input).not.toHaveFocus();
  });
});

describe('NumberField validation', () => {
  it('coerces the editor string and applies min/max bounds', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateFieldWithCore(ratingNode, descriptor, '3')).toEqual([]);
    expect(validateFieldWithCore(ratingNode, descriptor, '0')).toEqual([
      'Rating must be at least 1',
    ]);
    expect(validateFieldWithCore(ratingNode, descriptor, '6')).toEqual([
      'Rating must be at most 5',
    ]);
  });

  it('treats zero as present, not empty, for a required field', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateFieldWithCore(countNode, descriptor, '0')).toEqual([]);
    expect(validateFieldWithCore(countNode, descriptor, '')).toEqual([
      'Count is required',
    ]);
  });

  it('rejects a non-numeric value', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateFieldWithCore(countNode, descriptor, 'abc')).toEqual([
      'Count must be a number',
    ]);
  });

  it('rejects a non-finite value (Infinity)', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateFieldWithCore(countNode, descriptor, '1e999')).toEqual([
      'Count must be a finite number',
    ]);
  });

  it('treats a whitespace-only value as empty', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateFieldWithCore(countNode, descriptor, '   ')).toEqual([
      'Count is required',
    ]);
  });

  it('names an unlabelled field by its name in the error', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    const unlabelled = t.number({ name: 'width' });
    expect(validateFieldWithCore(unlabelled, descriptor, 'abc')).toEqual([
      'width must be a number',
    ]);
  });

  it('measures a finite number and nothing else', async () => {
    const registry = await resolveRegistry();
    const measure = registry.get('number')?.measure;
    expect(measure?.('3.5')).toEqual({ amount: 3.5 });
    expect(measure?.('abc')).toBeNull();
    expect(measure?.('1e999')).toBeNull();
  });

  it('passes an optional field left empty', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('number');
    expect(validateFieldWithCore(weightNode, descriptor, '')).toEqual([]);
    expect(validateFieldWithCore(weightNode, descriptor, undefined)).toEqual(
      []
    );
  });

  it('appends a descriptor-level custom validate error', () => {
    const descriptor = {
      type: 'number',
      Component: () => null,
      validate: (value: unknown) => (value === '13' ? 'Unlucky' : null),
    };
    expect(validateFieldWithCore(countNode, descriptor, '13')).toContain(
      'Unlucky'
    );
  });
});

describe('NumberField ingest and digest', () => {
  it('round-trips numbers through parse (ingest) and serialize (digest)', async () => {
    const registry = await resolveRegistry();
    const stored = { rating: 3, count: 0, weight: -1.5 };
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual({ rating: '3', count: '0', weight: '-1.5' });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('holds an absent field as null and digests it as absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({
      rating: null,
      count: null,
      weight: null,
    });
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
  });

  it('drops an empty (undefined) field on digest', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ weight: undefined }, collection.fields, { registry })
    ).toEqual({});
  });

  it('normalises a stored null to empty rather than "null"/NaN', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument({ weight: null }, collection.fields, {
      registry,
    });
    expect(ingested.weight).toBeNull();
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      {}
    );
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
