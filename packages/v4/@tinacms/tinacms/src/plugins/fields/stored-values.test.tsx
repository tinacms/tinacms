import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../config';
import type { ContentProvider } from '../../core/content/contract';
import type { MediaProvider } from '../../core/media/contract';
import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { CollectionSchema, FieldSchema } from '../../core/schema/types';
import { FormProvider, TinaProvider } from '../../editor';
import { LabelledFields } from '../../test/labelled-fields';
import { corePlugins, t } from '.';

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
];

// A hand-edited content file can hold any YAML or JSON value in any field.
const STORED_VALUES: [string, unknown][] = [
  ['a number', 2024],
  ['a boolean', true],
  ['a string', 'hello'],
  ['a list', ['a', 'b']],
  ['an object', { a: 1 }],
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
