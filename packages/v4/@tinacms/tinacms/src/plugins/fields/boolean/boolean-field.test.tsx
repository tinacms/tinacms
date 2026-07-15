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
import booleanFieldPlugin from './boolean-field.plugin';

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  fields: [t.boolean({ name: 'featured', label: 'Featured', required: true })],
};

const featuredNode = collection.fields[0];

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([booleanFieldPlugin]);

const renderFeatured = (document?: TinaDocument) =>
  render(
    <TinaProvider plugins={[booleanFieldPlugin]}>
      <FormProvider
        collection={collection}
        path='content/posts/featured.mdx'
        document={document}
      >
        <Field address='featured' />
      </FormProvider>
    </TinaProvider>
  );

describe('BooleanField rendering', () => {
  it('renders a stored true value as a checked box', async () => {
    renderFeatured({ featured: true });
    const input = (await screen.findByLabelText(
      'featured'
    )) as HTMLInputElement;
    expect(input).toBeChecked();
  });

  it('renders a stored false value as an unchecked box', async () => {
    renderFeatured({ featured: false });
    const input = (await screen.findByLabelText(
      'featured'
    )) as HTMLInputElement;
    expect(input).not.toBeChecked();
  });

  it('falls back to the descriptor default (false) when absent', async () => {
    renderFeatured();
    const input = (await screen.findByLabelText(
      'featured'
    )) as HTMLInputElement;
    expect(input).not.toBeChecked();
  });
});

describe('BooleanField value updates', () => {
  it('toggles the value back through the form store', async () => {
    renderFeatured({ featured: false });
    const input = (await screen.findByLabelText(
      'featured'
    )) as HTMLInputElement;

    await userEvent.click(input);
    expect(input).toBeChecked();

    await userEvent.click(input);
    expect(input).not.toBeChecked();
  });
});

describe('BooleanField validation', () => {
  // `required` is a no-op for boolean by design: a checkbox has no empty state
  // and `false` is a first-class value, so neither true nor false is rejected.
  it('accepts both true and false even when the field is required', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('boolean');
    expect(validateField(featuredNode, descriptor, true)).toEqual([]);
    expect(validateField(featuredNode, descriptor, false)).toEqual([]);
  });

  it('accepts an absent value as optional', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('boolean');
    expect(validateField(featuredNode, descriptor, undefined)).toEqual([]);
    expect(validateField(featuredNode, descriptor, null)).toEqual([]);
  });

  it('rejects a non-boolean stored value', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('boolean');
    expect(validateField(featuredNode, descriptor, 'yes')).not.toEqual([]);
  });

  it('appends a descriptor-level custom validate error', () => {
    const descriptor = {
      type: 'boolean',
      Component: () => null,
      validate: (value: boolean) =>
        value === false ? 'Must be enabled' : null,
    };
    expect(validateField(featuredNode, descriptor, false)).toContain(
      'Must be enabled'
    );
  });
});

describe('BooleanField ingest and digest', () => {
  it('round-trips true and false through ingest and digest', async () => {
    const registry = await resolveRegistry();
    for (const featured of [true, false]) {
      const ingested = ingestDocument(
        { featured },
        collection.fields,
        registry
      );
      expect(ingested).toEqual({ featured });
      expect(digestDocument(ingested, collection.fields, registry)).toEqual({
        featured,
      });
    }
  });

  it('seeds the default value on ingest when the field is absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, registry)).toEqual({
      featured: false,
    });
  });
});

describe('BooleanField metadata wrapping', () => {
  it('registers the boolean descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('boolean');
    expect(descriptor?.metadata).toEqual({ layout: 'inline' });
    expect(descriptor?.defaultValue).toBe(false);
  });
});
