import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../config';
import { resolveFieldPlugins } from '../../core/field/registry';
import { digestDocument, ingestDocument } from '../../core/form/ingest';
import type { ContentProvider } from '../../core/content/contract';
import type { MediaProvider } from '../../core/media/contract';
import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { CollectionSchema, FieldSchema } from '../../core/schema/types';
import { FormProvider, TinaProvider } from '../../editor';
import { LabelledFields } from '../../test/labelled-fields';
import { corePlugins, t } from '.';
import { numberSchema } from './number/number-field.schema';
import arrayFieldPlugin from './array/array-field.plugin';
import objectFieldPlugin from './object/object-field.plugin';
import stringFieldPlugin from './string/string-field.plugin';

const stubPlugin = (
  capability: 'content' | 'media',
  provider: ContentProvider | MediaProvider
): PluginManifest =>
  definePlugin({
    name: `test:${capability}:stub`,
    provides: [capability],
    client: async () => ({ default: { slice: () => ({ ...provider }) } }),
  });

const content: ContentProvider = {
  list: vi.fn(async () => []),
  get: vi.fn(async () => null),
  update: vi.fn(async (_collection, path, value) => ({
    path,
    document: value,
  })),
};

const media: MediaProvider = {
  upload: vi.fn(async (file: File) => file.name),
  list: vi.fn(async () => ({ items: [] })),
  delete: vi.fn(async () => {}),
  resolveUrl: (path: string) => `/uploads/${path}`,
};

const FIELDS: FieldSchema[] = [
  t.string({ name: 'field', label: 'Field' }),
  t.boolean({ name: 'field', label: 'Field' }),
  t.number({ name: 'field', label: 'Field' }),
  t.datetime({ name: 'field', label: 'Field' }),
  t.select({ name: 'field', label: 'Field', options: [{ value: 'a' }] }),
  t.reference({ name: 'field', label: 'Field', collections: ['post'] }),
  t.image({ name: 'field', label: 'Field' }),
  t.array({
    name: 'field',
    label: 'Field',
    fields: [t.string({ name: 'name', label: 'Name' })],
  }),
  t.object({
    name: 'field',
    label: 'Field',
    fields: [t.string({ name: 'name', label: 'Name' })],
  }),
];

// A hand-edited content file can hold any YAML or JSON value in any field.
const STORED_VALUES: [string, unknown][] = [
  ['a number', 2024],
  ['a boolean', true],
  ['a string', 'hello'],
  ['a list', ['a', 'b']],
  ['an object', { a: 1 }],
  ['a number list', [1, 2]],
  ['false', false],
  ['infinity', Number.POSITIVE_INFINITY],
];

const CASES = FIELDS.flatMap((field) =>
  STORED_VALUES.map(([kind, value]) => ({
    type: field.type,
    field,
    kind,
    value,
  }))
);

describe('field plugins with a stored value of the wrong type', () => {
  it.each(CASES)('$type renders $kind', async ({ field, value }) => {
    const collection: CollectionSchema = {
      name: 'post',
      label: 'Posts',
      format: 'mdx',
      fields: [field],
    };
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [
            ...corePlugins,
            stubPlugin('content', content),
            stubPlugin('media', media),
          ],
          schema: { collections: [collection] },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <FormProvider
          collection={collection}
          path='content/posts/hello.mdx'
          document={{ field: value }}
        >
          <LabelledFields />
        </FormProvider>
      </TinaProvider>
    );
    expect(await screen.findByText('Field')).toBeInTheDocument();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});

describe('Clear on a stored value of the wrong shape', () => {
  const list = (state: object) =>
    t.array({
      name: 'field',
      label: 'Field',
      fields: [t.string({ name: 'name', label: 'Name' })],
      ...state,
    });
  const group = (state: object) =>
    t.object({
      name: 'field',
      label: 'Field',
      fields: [t.string({ name: 'name', label: 'Name' })],
      ...state,
    });
  const inside = (child: FieldSchema, state: object) =>
    t.object({
      name: 'field',
      label: 'Field',
      fields: [{ ...child, name: 'inner' }],
      ...state,
    });

  const CLEAR_CASES: [string, FieldSchema, unknown][] = [
    ['an array', list({}), 'bad'],
    ['an object', group({}), 'bad'],
    ['a read-only array', list({ readOnly: true }), 'bad'],
    ['a disabled array', list({ disabled: true }), 'bad'],
    ['a read-only object', group({ readOnly: true }), 'bad'],
    ['a disabled object', group({ disabled: true }), 'bad'],
    [
      'an array in a read-only object',
      inside(list({}), { readOnly: true }),
      { inner: 'bad' },
    ],
    [
      'an object in a disabled object',
      inside(group({}), { disabled: true }),
      { inner: 'bad' },
    ],
  ];

  it.each(CLEAR_CASES)('%s', async (kind, field, value) => {
    const collection: CollectionSchema = {
      name: 'post',
      label: 'Posts',
      format: 'mdx',
      fields: [field],
    };
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [arrayFieldPlugin, objectFieldPlugin, stringFieldPlugin],
          schema: { collections: [collection] },
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/hello.mdx'
          document={{ field: value }}
        >
          <LabelledFields />
        </FormProvider>
      </TinaProvider>
    );
    const clear = await screen.findByRole('button', { name: 'Clear' });
    if (/read-only|disabled/.test(kind)) expect(clear).toBeDisabled();
    else expect(clear).toBeEnabled();
  });
});

describe('Save on a number or datetime field holding a value of the wrong type', () => {
  const LOCKED = ['number', 'datetime'].flatMap((type) =>
    (['readOnly', 'disabled'] as const).map((state) => ({
      type,
      state,
      field:
        type === 'number'
          ? t.number({ name: 'field', label: 'Field', [state]: true })
          : t.datetime({ name: 'field', label: 'Field', [state]: true }),
    }))
  );
  const WRONG_TYPE = STORED_VALUES.filter(
    ([, value]) => typeof value !== 'string' || Number.isNaN(Number(value))
  );

  it.each(
    LOCKED.flatMap((entry) =>
      WRONG_TYPE.map(([kind, value]) => ({ ...entry, kind, value }))
    )
  )('$state $type keeps $kind as it was stored', async ({ field, value }) => {
    const registry = await resolveFieldPlugins(corePlugins);
    const ingested = ingestDocument({ field: value }, [field], { registry });
    expect(digestDocument(ingested, [field], { registry })).toEqual({
      field: value,
    });
  });
});

describe('Validation of an editable number field holding a non-number', () => {
  it.each([
    ['true', true],
    ['false', false],
    ['a Date', new Date('2026-01-01')],
    ['a list', [5]],
  ])('rejects %s', (_kind, value) => {
    const schema = numberSchema(t.number({ name: 'rating', label: 'Rating' }));
    expect(schema.safeParse(value).success).toBe(false);
  });
});
