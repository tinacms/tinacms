import { render, screen, waitFor } from '@testing-library/react';
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
import { formStatus, toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import numberFieldPlugin from '../number/number-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';

const NO_COLLECTIONS = { collections: [] };
const DOCUMENT_PATH = 'content/posts/featured.mdx';
const PLUGINS = [arrayFieldPlugin, stringFieldPlugin, numberFieldPlugin];

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const status = () =>
  formStatus(useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]);

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.array({
      name: 'authors',
      label: 'Authors',
      required: true,
      fields: [
        t.string({ name: 'name', label: 'Name', required: true }),
        t.number({ name: 'age', label: 'Age' }),
      ],
    }),
    t.array({
      name: 'tags',
      label: 'Tags',
      max: 2,
      fields: [t.string({ name: 'value', label: 'Value' })],
    }),
    t.array({
      name: 'groups',
      label: 'Groups',
      fields: [
        t.array({
          name: 'members',
          label: 'Members',
          fields: [t.string({ name: 'name', label: 'Name', required: true })],
        }),
      ],
    }),
  ],
};

const [authorsNode, tagsNode, groupsNode] = collection.fields;

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins(PLUGINS);

const renderField = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({ plugins: PLUGINS, schema: NO_COLLECTIONS })}
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

describe('ArrayField rendering', () => {
  it("renders each item's own fields with their own labels and values", async () => {
    renderField({ authors: [{ name: 'Ivan', age: 30 }] });
    const name = (await screen.findByLabelText('Name')) as HTMLInputElement;
    const age = (await screen.findByLabelText('Age')) as HTMLInputElement;
    expect(name.value).toBe('Ivan');
    expect(age.value).toBe('30');
  });

  it('renders one row per item', async () => {
    renderField({ authors: [{ name: 'Ivan' }, { name: 'Brook' }] });
    const names = (await screen.findAllByLabelText(
      'Name'
    )) as HTMLInputElement[];
    expect(names.map((input) => input.value)).toEqual(['Ivan', 'Brook']);
  });

  it('renders no rows when the field is absent', async () => {
    renderField();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });
});

describe('ArrayField add, remove, and reorder', () => {
  it('adds an item', async () => {
    renderField({ authors: [] });
    const [addAuthor] = await screen.findAllByRole('button', {
      name: 'Add item',
    });
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    await userEvent.click(addAuthor);
    expect(await screen.findByLabelText('Name')).toBeInTheDocument();
  });

  it('removes an item', async () => {
    renderField({ authors: [{ name: 'Ivan' }] });
    await screen.findByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('reorders items', async () => {
    renderField({ authors: [{ name: 'Ivan' }, { name: 'Brook' }] });
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 2 up' })
    );
    const names = screen.getAllByLabelText('Name') as HTMLInputElement[];
    expect(names.map((input) => input.value)).toEqual(['Brook', 'Ivan']);
  });
});

describe('ArrayField dirty tracking', () => {
  it('goes dirty on a reorder, then back to clean once edits restore the original values', async () => {
    renderField({ authors: [{ name: 'Ivan' }, { name: 'Brook' }] });
    await screen.findAllByLabelText('Name');
    expect(status()).toBe('pristine');

    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 2 up' })
    );
    expect(
      screen
        .getAllByLabelText('Name')
        .map((input) => (input as HTMLInputElement).value)
    ).toEqual(['Brook', 'Ivan']);
    expect(status()).toBe('dirty');

    // Edit the swapped items back to what they were before the reorder.
    const [first, second] = screen.getAllByLabelText('Name');
    await userEvent.clear(first);
    await userEvent.type(first, 'Ivan');
    await userEvent.clear(second);
    await userEvent.type(second, 'Brook');

    expect(valueOf('authors')).toEqual([{ name: 'Ivan' }, { name: 'Brook' }]);
    expect(status()).toBe('clean');
  });
});

describe('ArrayField value updates', () => {
  it('writes an item field edit back through the store', async () => {
    renderField({ authors: [{ name: 'Ivan' }] });
    const name = await screen.findByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Brook');
    expect(valueOf('authors')).toEqual([{ name: 'Brook' }]);
  });
});

describe('ArrayField validation', () => {
  it('requires at least one item', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    expect(validateField(authorsNode, descriptor, [{ name: 'Ivan' }])).toEqual(
      []
    );
    expect(validateField(authorsNode, descriptor, [])).toEqual([
      'Authors needs at least 1 item',
    ]);
    expect(validateField(authorsNode, descriptor, undefined)).toEqual([
      'Authors needs at least 1 item',
    ]);
  });

  it('rejects more items than max', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    expect(
      validateField(tagsNode, descriptor, [{ value: 'a' }, { value: 'b' }])
    ).toEqual([]);
    expect(
      validateField(tagsNode, descriptor, [
        { value: 'a' },
        { value: 'b' },
        { value: 'c' },
      ])
    ).toEqual(['Tags allows at most 2 items']);
  });

  it("validates each item field and keys messages by the item's nested address", async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    const errors = descriptor?.validateChildren?.(
      [{ name: '', age: 30 }, { name: 'Brook' }],
      authorsNode,
      'authors',
      registry
    );
    expect(errors).toEqual({ 'authors.0.name': ['Name is required'] });
  });

  it('surfaces an item field error at its own address, and rolls it up onto the array itself', async () => {
    renderField({ authors: [{ name: 'Ivan' }] });
    const name = await screen.findByLabelText('Name');
    await userEvent.clear(name);
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    for (const alert of screen.getAllByRole('alert')) {
      expect(alert).toHaveTextContent('Name is required');
    }
  });

  it('recurses into an array nested inside an array', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    const errors = descriptor?.validateChildren?.(
      [{ members: [{ name: '' }] }],
      groupsNode,
      'groups',
      registry
    );
    expect(errors).toEqual({ 'groups.0.members.0.name': ['Name is required'] });
  });

  it('rolls a doubly-nested item field error up through every ancestor array', async () => {
    renderField({ groups: [{ members: [{ name: 'Ivan' }] }] });
    const name = await screen.findByLabelText('Name');
    await userEvent.clear(name);
    // The leaf field, the `members` array, and the `groups` array each show it.
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(3));
    for (const alert of screen.getAllByRole('alert')) {
      expect(alert).toHaveTextContent('Name is required');
    }
  });
});

describe('ArrayField ingest and digest', () => {
  it('recurses into item fields, including one with its own parse/serialize', async () => {
    const registry = await resolveRegistry();
    const stored = { authors: [{ name: 'Ivan', age: 30 }] };
    const ingested = ingestDocument(stored, collection.fields, registry, {
      registry,
    });
    expect(ingested).toEqual({ authors: [{ name: 'Ivan', age: '30' }] });
    expect(
      digestDocument(ingested, collection.fields, registry, { registry })
    ).toEqual(stored);
  });

  it('leaves an absent field absent (no default seeding)', async () => {
    const registry = await resolveRegistry();
    expect(
      ingestDocument({}, collection.fields, registry, { registry })
    ).toEqual({});
    expect(
      digestDocument({}, collection.fields, registry, { registry })
    ).toEqual({});
  });
});

describe('ArrayField metadata wrapping', () => {
  it('registers the array descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    expect(descriptor?.metadata).toEqual({
      layout: 'block',
      labelable: false,
    });
    expect(descriptor?.defaultValue).toBeUndefined();
  });
});
