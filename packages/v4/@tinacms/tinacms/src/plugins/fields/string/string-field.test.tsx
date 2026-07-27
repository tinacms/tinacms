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
import stringFieldPlugin from './string-field.plugin';

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  fields: [t.string({ name: 'title', label: 'Title', required: true, min: 3 })],
};

const titleNode = collection.fields[0];

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([stringFieldPlugin]);

const renderTitle = (document?: TinaDocument) =>
  render(
    <TinaProvider plugins={[stringFieldPlugin]}>
      <FormProvider
        collection={collection}
        path='content/posts/test.mdx'
        document={document}
      >
        <Field address='title' />
      </FormProvider>
    </TinaProvider>
  );

describe('StringField rendering', () => {
  it('renders the ingested value into a text input', async () => {
    renderTitle({ title: 'Hello' });
    const input = (await screen.findByLabelText('title')) as HTMLInputElement;
    expect(input.value).toBe('Hello');
  });

  it('falls back to the descriptor default value when absent', async () => {
    renderTitle();
    const input = (await screen.findByLabelText('title')) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('StringField value updates', () => {
  it('writes keystrokes back through the form store', async () => {
    renderTitle({ title: '' });
    const input = (await screen.findByLabelText('title')) as HTMLInputElement;
    await userEvent.type(input, 'A new title');
    expect(input.value).toBe('A new title');
  });
});

describe('StringField validation', () => {
  it('surfaces the shared min-length message while editing', async () => {
    renderTitle({ title: '' });
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, 'ab');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title must be at least 3 characters'
    );
  });

  it('passes the shared validation path with a valid value', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('string');
    expect(validateField(titleNode, descriptor, 'abc')).toEqual([]);
    expect(validateField(titleNode, descriptor, '')).toEqual([
      'Title must be at least 3 characters',
    ]);
  });

  it('appends a descriptor-level custom validate error', () => {
    const descriptor = {
      type: 'string',
      Component: () => null,
      validate: (value: string) =>
        value === 'banned' ? 'Value is not allowed' : null,
    };
    expect(validateField(titleNode, descriptor, 'banned')).toContain(
      'Value is not allowed'
    );
  });
});

describe('StringField ingest and digest', () => {
  it('ingests a stored value and digests it back unchanged', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument(
      { title: 'Hi there' },
      collection.fields,
      registry
    );
    expect(ingested).toEqual({ title: 'Hi there' });
    expect(digestDocument(ingested, collection.fields, registry)).toEqual({
      title: 'Hi there',
    });
  });

  it('seeds the default value on ingest when the field is absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, registry)).toEqual({
      title: '',
    });
  });

  it('preserves null vs absent on digest', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ title: null }, collection.fields, registry)
    ).toEqual({ title: null });
    expect(digestDocument({}, collection.fields, registry)).toEqual({});
  });
});

describe('StringField metadata wrapping', () => {
  it('registers the string descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('string');
    expect(descriptor?.metadata).toEqual({ layout: 'inline' });
    expect(descriptor?.defaultValue).toBe('');
  });
});
