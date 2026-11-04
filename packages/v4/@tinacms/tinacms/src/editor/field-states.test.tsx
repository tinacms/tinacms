import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { definePlugin, type PluginManifest } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../core/schema/types';
import { FormProvider, TinaProvider } from '../editor';
import { t } from '../index';
import booleanFieldPlugin from '../plugins/fields/boolean/boolean-field.plugin';
import datetimeFieldPlugin from '../plugins/fields/datetime/datetime-field.plugin';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import richTextFieldPlugin from '../plugins/fields/rich-text/rich-text-field.plugin';
import imageFieldPlugin from '../plugins/fields/image/image-field.plugin';
import numberFieldPlugin from '../plugins/fields/number/number-field.plugin';
import referenceFieldPlugin from '../plugins/fields/reference/reference-field.plugin';
import selectFieldPlugin from '../plugins/fields/select/select-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { LabelledFields } from '../test/labelled-fields';

const mediaStub = definePlugin({
  name: 'test:media:stub',
  provides: ['media'],
  client: async () => ({
    default: {
      slice: () => ({
        upload: async (file: File) => file.name,
        list: async () => ({ items: [] }),
        delete: async () => {},
        resolveUrl: (path: string) => `/uploads/${path}`,
      }),
    },
  }),
});

const contentStub = definePlugin({
  name: 'test:content:stub',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: async () => [{ path: 'content/pages/about.mdx' }],
        get: async () => null,
        update: async (
          _collection: string,
          path: string,
          value: TinaDocument
        ) => ({
          path,
          document: value,
        }),
      }),
    },
  }),
});

const PAGE: CollectionSchema = {
  name: 'page',
  format: 'mdx',
  fields: [],
};

type Case = {
  type: string;
  plugin: PluginManifest;
  /** Collections the field points at. */
  collections?: CollectionSchema[];
  /** Plugins the field's children need. */
  also?: PluginManifest[];
  /** The control that takes the edit. `null` means the field drew none. Defaults to the one labelled "Field". */
  control?: (expectEditable: boolean) => Promise<HTMLElement | null>;
  node: (state: Pick<FieldSchema, 'disabled' | 'readOnly'>) => FieldSchema;
  document: TinaDocument;
};

const CASES: Case[] = [
  {
    type: 'string',
    plugin: stringFieldPlugin,
    node: (state) => t.string({ name: 'f', label: 'Field', ...state }),
    document: { f: 'text' },
  },
  {
    type: 'number',
    plugin: numberFieldPlugin,
    node: (state) => t.number({ name: 'f', label: 'Field', ...state }),
    document: { f: 3 },
  },
  {
    type: 'boolean',
    plugin: booleanFieldPlugin,
    node: (state) => t.boolean({ name: 'f', label: 'Field', ...state }),
    document: { f: true },
  },
  {
    type: 'select',
    plugin: selectFieldPlugin,
    node: (state) =>
      t.select({
        name: 'f',
        label: 'Field',
        options: [{ value: 'a' }, { value: 'b' }],
        ...state,
      }),
    document: { f: 'a' },
  },
  {
    type: 'datetime',
    plugin: datetimeFieldPlugin,
    node: (state) => t.datetime({ name: 'f', label: 'Field', ...state }),
    document: { f: '2026-01-02T03:04' },
  },
  {
    type: 'rich-text',
    plugin: richTextFieldPlugin,
    control: async (expectEditable) => {
      await screen.findByText('Field');
      try {
        return await screen.findByRole(
          'textbox',
          {},
          { timeout: expectEditable ? 3000 : 250 }
        );
      } catch {
        return null;
      }
    },
    node: (state) => t.richText({ name: 'f', label: 'Field', ...state }),
    document: {},
  },
  {
    type: 'reference',
    plugin: referenceFieldPlugin,
    also: [contentStub],
    collections: [PAGE],
    node: (state) =>
      t.reference({
        name: 'f',
        label: 'Field',
        collections: ['page'],
        ...state,
      }),
    document: {},
    control: async () => {
      await screen.findByPlaceholderText('Search documents…');
      const [first] = await screen.findAllByLabelText(/^Field\b/);
      return first;
    },
  },
  {
    type: 'image',
    plugin: imageFieldPlugin,
    also: [mediaStub],
    node: (state) => t.image({ name: 'f', label: 'Field', ...state }),
    document: {},
    control: async () => {
      await screen.findByText('Field');
      return screen.queryByRole('button', { name: 'Choose image' });
    },
  },
  {
    type: 'object',
    plugin: objectFieldPlugin,
    also: [stringFieldPlugin],
    node: (state) =>
      t.object({
        name: 'f',
        label: 'Field',
        fields: [t.string({ name: 's', label: 'Inner' })],
        ...state,
      }),
    document: { f: { s: 'x' } },
    control: async () => {
      await screen.findByText('Field');
      return screen.queryByLabelText(/^Inner/);
    },
  },
  {
    type: 'array',
    plugin: arrayFieldPlugin,
    also: [stringFieldPlugin],
    control: async () => {
      await screen.findByText('Field');
      return screen.queryByRole('textbox', { name: 'Add item' });
    },
    node: (state) =>
      t.array({
        name: 'f',
        label: 'Field',
        of: t.string({ name: 'item', label: 'Item' }),
        ...state,
      }),
    document: { f: ['one'] },
  },
];

const renderField = (
  { plugin, also = [], collections = [], node, document }: Case,
  state: object
) => {
  const collection: CollectionSchema = {
    name: 'post',
    format: 'mdx',
    fields: [node(state)],
  };
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [plugin, ...also],
        schema: { collections },
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
};

const labelled = async (_expectEditable?: boolean) => {
  const [first] = await screen.findAllByLabelText(/^Field\b/);
  return first;
};

const blocksEditing = (el: HTMLElement | null) =>
  el === null ||
  el.getAttribute('contenteditable') === 'false' ||
  el.hasAttribute('readonly') ||
  el.getAttribute('aria-readonly') === 'true' ||
  el.hasAttribute('data-readonly') ||
  el.hasAttribute('disabled') ||
  el.getAttribute('aria-disabled') === 'true' ||
  el.hasAttribute('data-disabled');

describe('a real field in the form', () => {
  describe.each(CASES)('$type', (entry) => {
    it('can be edited by default', async () => {
      renderField(entry, {});
      expect(blocksEditing(await (entry.control ?? labelled)(true))).toBe(
        false
      );
    });

    it('is read-only when its schema says readOnly', async () => {
      renderField(entry, { readOnly: true });
      expect(blocksEditing(await (entry.control ?? labelled)(false))).toBe(
        true
      );
    });

    it('is disabled when its schema says disabled', async () => {
      renderField(entry, { disabled: true });
      const el = await (entry.control ?? labelled)(false);
      expect(
        el === null ||
          el.getAttribute('contenteditable') === 'false' ||
          el.hasAttribute('disabled') ||
          el.getAttribute('aria-disabled') === 'true' ||
          el.hasAttribute('data-disabled')
      ).toBe(true);
    });
  });
});

describe('a field frame warning', () => {
  it('shows an amber message for a reference to a document that is gone', async () => {
    const entry = CASES.find((candidate) => candidate.type === 'reference');
    if (!entry) throw new Error('missing reference case');
    renderField({ ...entry, document: { f: 'content/pages/gone.mdx' } }, {});
    expect(
      await screen.findByText('This document no longer exists.')
    ).toBeVisible();
  });
});
