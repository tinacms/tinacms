import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
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
import { t } from '../../../index';
import { max, min, pattern, required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { coreValidatorRegistry } from '../../../test/core-validators';
import { LabelledFields } from '../../../test/labelled-fields';
import stringFieldPlugin from './string-field.plugin';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      validators: [required(), min(3)],
    }),
  ],
};

const titleNode = collection.fields[0];

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([stringFieldPlugin]);

const renderTitle = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin, coreValidatorsPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={collection}
        path='content/posts/test.mdx'
        document={document}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

describe('StringField rendering', () => {
  it('renders the ingested value into a text input', async () => {
    renderTitle({ title: 'Hello' });
    const input = (await screen.findByLabelText('Title')) as HTMLInputElement;
    expect(input.value).toBe('Hello');
  });

  it('falls back to the descriptor default value when absent', async () => {
    renderTitle();
    const input = (await screen.findByLabelText('Title')) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('StringField value updates', () => {
  it('writes keystrokes back through the form store', async () => {
    renderTitle({ title: '' });
    const input = (await screen.findByLabelText('Title')) as HTMLInputElement;
    await userEvent.type(input, 'A new title');
    expect(input.value).toBe('A new title');
  });
});

describe('StringField validation', () => {
  it('surfaces the shared min-length message while editing', async () => {
    renderTitle({ title: '' });
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, 'ab');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title must be at least 3 characters'
    );
  });

  it('passes the shared validation path with a valid value', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('string');
    expect(validateFieldWithCore(titleNode, descriptor, 'abc')).toEqual([]);
    expect(validateFieldWithCore(titleNode, descriptor, '')).toEqual([
      'Title is required',
    ]);
  });

  it('appends a descriptor-level custom validate error', () => {
    const descriptor = {
      type: 'string',
      Component: () => null,
      validate: (value: string) =>
        value === 'banned' ? 'Value is not allowed' : null,
    };
    expect(validateFieldWithCore(titleNode, descriptor, 'banned')).toContain(
      'Value is not allowed'
    );
  });
});

const errorsFor = async (
  config: Parameters<typeof t.string>[0],
  value: unknown
): Promise<string[]> => {
  const registry = await resolveRegistry();
  return validateFieldWithCore(t.string(config), registry.get('string'), value);
};

describe('StringField schema length bounds', () => {
  it('reports a value that is longer than the maximum', async () => {
    expect(
      await errorsFor(
        { name: 'title', label: 'Title', validators: [max(5)] },
        'abcdef'
      )
    ).toEqual(['Title must be at most 5 characters']);
  });

  it('accepts a value that sits on the maximum', async () => {
    expect(
      await errorsFor(
        { name: 'title', label: 'Title', validators: [max(5)] },
        'abcde'
      )
    ).toEqual([]);
  });
});

describe('StringField schema pattern', () => {
  it('accepts a value that matches the pattern', async () => {
    expect(
      await errorsFor(
        { name: 'slug', label: 'Slug', validators: [pattern('^[a-z-]+$')] },
        'a-slug'
      )
    ).toEqual([]);
  });

  it('rejects a value that does not match the pattern', async () => {
    expect(
      await errorsFor(
        { name: 'slug', label: 'Slug', validators: [pattern('^[a-z-]+$')] },
        'Not A Slug'
      )
    ).toEqual(['Slug is invalid']);
  });

  // A pattern comes from a schema that an author writes. A broken pattern
  // leaves the field without the rule, and never stops the editor working.
  it('ignores a pattern that is not a valid expression', async () => {
    expect(
      await errorsFor(
        { name: 'slug', label: 'Slug', validators: [pattern('[')] },
        'anything'
      )
    ).toEqual([]);
  });
});

describe('StringField schema required', () => {
  it('reports an empty required field', async () => {
    expect(
      await errorsFor(
        { name: 'title', label: 'Title', validators: [required()] },
        ''
      )
    ).toEqual(['Title is required']);
  });

  it('reports a missing required field', async () => {
    expect(
      await errorsFor(
        { name: 'title', label: 'Title', validators: [required()] },
        undefined
      )
    ).toEqual(['Title is required']);
  });

  // `min` measures content, so it passes an empty value and lets `required`
  // report it. A field with both rules reports one message, not two.
  it('reports only the required message when the field is empty', async () => {
    expect(
      await errorsFor(
        {
          name: 'title',
          label: 'Title',
          validators: [required(), min(3)],
        },
        ''
      )
    ).toEqual(['Title is required']);
  });

  it('reports the required message when the minimum is zero', async () => {
    expect(
      await errorsFor(
        {
          name: 'title',
          label: 'Title',
          validators: [required(), min(0)],
        },
        ''
      )
    ).toEqual(['Title is required']);
  });

  it('names a field without a label by its name', async () => {
    expect(
      await errorsFor({ name: 'slug', validators: [required()] }, '')
    ).toEqual(['slug is required']);
  });
});

describe('StringField schema optional', () => {
  it('accepts an empty optional field', async () => {
    expect(await errorsFor({ name: 'title', label: 'Title' }, '')).toEqual([]);
  });

  it('accepts a missing optional field', async () => {
    expect(await errorsFor({ name: 'title', label: 'Title' }, null)).toEqual(
      []
    );
  });

  // An empty optional field becomes undefined, so a length rule never sees it.
  it('skips the length rules of an empty optional field', async () => {
    expect(
      await errorsFor(
        { name: 'title', label: 'Title', validators: [min(3)] },
        ''
      )
    ).toEqual([]);
  });
});

describe('StringField ingest and digest', () => {
  it('ingests a stored value and digests it back unchanged', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument({ title: 'Hi there' }, collection.fields, {
      registry,
    });
    expect(ingested).toEqual({ title: 'Hi there' });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual({
      title: 'Hi there',
    });
  });

  it('seeds the default value on ingest when the field is absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({
      title: '',
    });
  });

  it('preserves null vs absent on digest', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ title: null }, collection.fields, { registry })
    ).toEqual({ title: null });
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
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
