import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import {
  FormProvider,
  TinaProvider,
  useFormId,
  useFormSave,
  useFormStatus,
} from '../../../editor';
import {
  formStatus,
  isEdited,
  toFormId,
  useFormStore,
} from '../../../form/form-store';
import { t } from '../../../index';
import { max, min, required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { coreValidatorRegistry } from '../../../test/core-validators';
import { LabelledFields } from '../../../test/labelled-fields';
import booleanFieldPlugin from '../boolean/boolean-field.plugin';
import numberFieldPlugin from '../number/number-field.plugin';
import objectFieldPlugin from '../object/object-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';
import {
  asArrayFieldSchema,
  isScalarArray,
  isTemplatesArray,
} from './array-field.schema';

const NO_COLLECTIONS = { collections: [] };
const DOCUMENT_PATH = 'content/posts/featured.mdx';
const PLUGINS = [
  arrayFieldPlugin,
  stringFieldPlugin,
  numberFieldPlugin,
  coreValidatorsPlugin,
];

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values[
    toFieldAddress(name)
  ];

const status = () =>
  formStatus(useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]);

const errorKeys = () => {
  const scope = useFormStore.getState().forms[toFormId(DOCUMENT_PATH)];
  return Object.keys(isEdited(scope) ? scope.errors : {});
};

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.array({
      name: 'authors',
      label: 'Authors',
      validators: [required()],
      fields: [
        t.string({ name: 'name', label: 'Name', validators: [required()] }),
        t.number({ name: 'age', label: 'Age' }),
      ],
    }),
    t.array({
      name: 'tags',
      label: 'Tags',
      validators: [max(2)],
      fields: [t.string({ name: 'value', label: 'Value' })],
    }),
    t.array({
      name: 'groups',
      label: 'Groups',
      fields: [
        t.array({
          name: 'members',
          label: 'Members',
          fields: [
            t.string({ name: 'name', label: 'Name', validators: [required()] }),
          ],
        }),
      ],
    }),
  ],
};

const [authorsNode, tagsNode, groupsNode] = collection.fields;

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins(PLUGINS);

const renderField = (document?: TinaDocument, children?: ReactNode) =>
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
        {children}
      </FormProvider>
    </TinaProvider>
  );

function FormContextProbe({ ticks }: { ticks: { count: number } }) {
  useFormContext();
  ticks.count += 1;
  return null;
}

function SetNameError() {
  const { setError } = useFormContext();
  return (
    <button
      type='button'
      onClick={() =>
        setError('authors.0.name', {
          type: 'required',
          message: 'Name is required',
        })
      }
    >
      Set name error
    </button>
  );
}

function SaveProbe() {
  const save = useFormSave();
  const currentStatus = useFormStatus(useFormId());
  return (
    <div>
      <button type='button' onClick={() => save().catch(() => {})}>
        save
      </button>
      <span data-testid='form-status'>{currentStatus}</span>
    </div>
  );
}

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

  it('shows a stored value that is not a list read-only, and clears it', async () => {
    renderField({ authors: 'Ivan' });
    expect(await screen.findByText(/not a list of items/)).toBeInTheDocument();
    expect(screen.getByText('"Ivan"')).toBeInTheDocument();
    expect(valueOf('authors')).toBe('Ivan');
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear' })[0]);
    expect(valueOf('authors')).toEqual([]);
    await waitFor(() =>
      expect(
        screen.queryByText(/must be a list of items/)
      ).not.toBeInTheDocument()
    );
    expect(
      screen.getAllByRole('button', { name: 'Add item' }).length
    ).toBeGreaterThan(0);
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

  it('goes dirty when an item is added to an absent list', async () => {
    renderField({});
    const [addAuthor] = await screen.findAllByRole('button', {
      name: 'Add item',
    });
    await userEvent.click(addAuthor);
    await waitFor(() => expect(status()).toBe('dirty'));
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

  it("keeps a removed item's value off the item that takes its place", async () => {
    renderField({
      authors: [{ name: 'Ivan' }, { name: 'Josh', age: 30 }, { name: 'Brook' }],
    });
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 2' })
    );
    expect(valueOf('authors')).toEqual([
      { name: 'Ivan', age: null },
      { name: 'Brook', age: null },
    ]);
    expect(
      screen
        .getAllByLabelText('Age')
        .map((input) => (input as HTMLInputElement).value)
    ).toEqual(['', '']);
  });

  it("keeps a removed item's value off an item whose value was cleared", async () => {
    renderField({
      authors: [
        { name: 'Ivan', age: 5 },
        { name: 'Brook', age: 3 },
      ],
    });
    const ages = await screen.findAllByLabelText('Age');
    await userEvent.clear(ages[1]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    expect(valueOf('authors')).toEqual([{ name: 'Brook', age: null }]);
    expect((screen.getByLabelText('Age') as HTMLInputElement).value).toBe('');
  });

  it('keeps focus on the move button and leaves other rows mounted', async () => {
    renderField({
      authors: [{ name: 'Ivan' }, { name: 'Brook' }, { name: 'Ada' }],
      tags: [{ value: 'one' }, { value: 'two' }],
    });
    const authors = await screen.findByRole('group', { name: 'Authors' });
    const tags = screen.getByRole('group', { name: 'Tags' });
    const moveDown = within(authors).getByRole('button', {
      name: 'Move item 1 down',
    });
    const brookRemove = within(authors).getByRole('button', {
      name: 'Remove item 2',
    });
    const tagRemove = within(tags).getByRole('button', {
      name: 'Remove item 1',
    });
    await userEvent.click(moveDown);
    await waitFor(() => {
      expect(
        within(authors)
          .getAllByLabelText('Name')
          .map((input) => (input as HTMLInputElement).value)
      ).toEqual(['Brook', 'Ivan', 'Ada']);
    });
    expect(moveDown.isConnected).toBe(true);
    expect(document.activeElement).toBe(moveDown);
    expect(brookRemove.isConnected).toBe(true);
    expect(tagRemove.isConnected).toBe(true);
  });

  it('keeps surviving rows mounted when an item is removed', async () => {
    renderField({
      authors: [{ name: 'Ivan' }, { name: 'Brook' }, { name: 'Ada' }],
      tags: [{ value: 'one' }],
    });
    const authors = await screen.findByRole('group', { name: 'Authors' });
    const tags = screen.getByRole('group', { name: 'Tags' });
    const removeIvan = within(authors).getByRole('button', {
      name: 'Remove item 1',
    });
    const removeBrook = within(authors).getByRole('button', {
      name: 'Remove item 2',
    });
    const removeAda = within(authors).getByRole('button', {
      name: 'Remove item 3',
    });
    const tagRemove = within(tags).getByRole('button', {
      name: 'Remove item 1',
    });
    await userEvent.click(removeBrook);
    await waitFor(() => {
      expect(
        within(authors)
          .getAllByLabelText('Name')
          .map((input) => (input as HTMLInputElement).value)
      ).toEqual(['Ivan', 'Ada']);
    });
    expect(removeBrook.isConnected).toBe(false);
    expect(removeIvan.isConnected).toBe(true);
    expect(removeAda.isConnected).toBe(true);
    expect(tagRemove.isConnected).toBe(true);
  });

  it("keeps a moved item's value with that item", async () => {
    renderField({ authors: [{ name: 'Ivan', age: 30 }, { name: 'Brook' }] });
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 2 up' })
    );
    expect(valueOf('authors')).toEqual([
      { name: 'Brook', age: null },
      { name: 'Ivan', age: '30' },
    ]);
  });
});

describe('ArrayField remove with stored objects', () => {
  const OBJECT_PLUGINS = [...PLUGINS, objectFieldPlugin];
  const peopleCollection = (profileRequired = false): CollectionSchema => ({
    name: 'person',
    label: 'People',
    format: 'mdx',
    fields: [
      t.array({
        name: 'people',
        label: 'People',
        fields: [
          t.string({ name: 'name', label: 'Name' }),
          t.object({
            name: 'profile',
            label: 'Profile',
            fields: [
              t.string({
                name: 'bio',
                label: 'Bio',
                validators: profileRequired ? [required()] : [],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const renderPeople = (
    document: TinaDocument,
    onSave: (saved: TinaDocument) => void,
    profileRequired = false
  ) =>
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: OBJECT_PLUGINS,
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={peopleCollection(profileRequired)}
          path={DOCUMENT_PATH}
          document={document}
          onSave={onSave}
        >
          <LabelledFields />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );

  const saved = async (onSave: ReturnType<typeof vi.fn>) => {
    await userEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), {
      timeout: 5000,
    });
    return onSave.mock.calls[0][0] as TinaDocument;
  };

  it('keeps a list item that is not an object unchanged when another item is removed', async () => {
    const onSave = vi.fn();
    renderPeople({ people: ['oops', { name: 'A' }, { name: 'B' }] }, onSave);
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 3' })
    );
    await waitFor(() => expect(valueOf('people')).toHaveLength(2));
    const people = valueOf('people') as unknown[];
    expect(people[0]).toBe('oops');
    expect(people[1]).toMatchObject({ name: 'A' });
    expect(screen.getByText('"oops"')).toBeInTheDocument();
  });

  it('leaves an object the document does not have out of the saved document', async () => {
    const onSave = vi.fn();
    renderPeople(
      { people: [{ name: 'A', profile: { bio: 'x' } }, { name: 'B' }] },
      onSave
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    const document = await saved(onSave);
    expect(document).toEqual({ people: [{ name: 'B' }] });
    expect('profile' in (document.people as TinaDocument[])[0]).toBe(false);
  });

  it('keeps an object the document states, with default values, through a save', async () => {
    const onSave = vi.fn();
    renderPeople(
      { people: [{ name: 'A' }, { name: 'Brook', profile: { bio: '' } }] },
      onSave
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    expect(await saved(onSave)).toEqual({
      people: [{ name: 'Brook', profile: { bio: '' } }],
    });
  });

  it('keeps a stated object with no field defaults through a save', async () => {
    const onSave = vi.fn();
    const statsCollection: CollectionSchema = {
      name: 'person',
      label: 'People',
      format: 'mdx',
      fields: [
        t.array({
          name: 'people',
          label: 'People',
          fields: [
            t.string({ name: 'name', label: 'Name' }),
            t.object({
              name: 'stats',
              label: 'Stats',
              fields: [t.number({ name: 'score', label: 'Score' })],
            }),
          ],
        }),
      ],
    };
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: OBJECT_PLUGINS,
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={statsCollection}
          path={DOCUMENT_PATH}
          document={{
            people: [{ name: 'A' }, { name: 'Brook', stats: {} }],
          }}
          onSave={onSave}
        >
          <LabelledFields />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    expect(await saved(onSave)).toEqual({
      people: [{ name: 'Brook', stats: {} }],
    });
  });

  it('keeps a stated object with the item that moves', async () => {
    const onSave = vi.fn();
    renderPeople(
      {
        people: [
          { name: 'Josh', profile: { bio: 'Editor' } },
          { name: 'Brook' },
        ],
      },
      onSave
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 2 up' })
    );
    const bios = screen.getAllByLabelText('Bio') as HTMLInputElement[];
    expect(bios.map((input) => input.value)).toEqual(['', 'Editor']);
    expect(await saved(onSave)).toEqual({
      people: [{ name: 'Brook' }, { name: 'Josh', profile: { bio: 'Editor' } }],
    });
  });

  it('keeps an empty object the document states, with its field defaults', async () => {
    const onSave = vi.fn();
    renderPeople(
      { people: [{ name: 'A' }, { name: 'Brook', profile: {} }] },
      onSave
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    expect(await saved(onSave)).toEqual({
      people: [{ name: 'Brook', profile: { bio: '' } }],
    });
  });

  it('leaves an absent object with a boolean subfield out of the saved document', async () => {
    const onSave = vi.fn();
    const flagsCollection: CollectionSchema = {
      name: 'person',
      label: 'People',
      format: 'mdx',
      fields: [
        t.array({
          name: 'people',
          label: 'People',
          fields: [
            t.string({ name: 'name', label: 'Name' }),
            t.object({
              name: 'profile',
              label: 'Profile',
              fields: [t.boolean({ name: 'active', label: 'Active' })],
            }),
          ],
        }),
      ],
    };
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [...OBJECT_PLUGINS, booleanFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={flagsCollection}
          path={DOCUMENT_PATH}
          document={{
            people: [{ name: 'A', profile: { active: true } }, { name: 'B' }],
          }}
          onSave={onSave}
        >
          <LabelledFields />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    const document = await saved(onSave);
    expect(document).toEqual({ people: [{ name: 'B' }] });
  });

  it('still fails validation when a required object is absent after a removal', async () => {
    const onSave = vi.fn();
    renderPeople(
      { people: [{ name: 'A', profile: { bio: 'x' } }, { name: 'B' }] },
      onSave,
      true
    );
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await userEvent.click(screen.getByText('save'));
    const alerts = await screen.findAllByRole('alert', {}, { timeout: 5000 });
    expect(
      alerts.some((alert) => alert.textContent?.includes('Bio is required'))
    ).toBe(true);
    expect(onSave).not.toHaveBeenCalled();
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

    expect(valueOf('authors')).toEqual([
      { name: 'Ivan', age: null },
      { name: 'Brook', age: null },
    ]);
    expect(status()).toBe('clean');
  });
});

describe('ArrayField value updates', () => {
  it('writes an item field edit back through the store', async () => {
    renderField({ authors: [{ name: 'Ivan' }] });
    const name = await screen.findByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Brook');
    expect(valueOf('authors')).toEqual([{ name: 'Brook', age: null }]);
  });

  it('goes dirty again when an item field is edited after a save', async () => {
    const onSave = vi.fn();
    const oneArray: CollectionSchema = {
      name: 'post',
      format: 'mdx',
      fields: [
        t.array({
          name: 'authors',
          label: 'Authors',
          fields: [t.string({ name: 'name', label: 'Name' })],
        }),
      ],
    };
    render(
      <TinaProvider
        config={asResolvedConfig({ plugins: PLUGINS, schema: NO_COLLECTIONS })}
      >
        <FormProvider
          collection={oneArray}
          path={DOCUMENT_PATH}
          document={{ authors: [{ name: 'Ivan' }] }}
          onSave={onSave}
        >
          <LabelledFields />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );

    const name = await screen.findByLabelText('Name');

    await userEvent.type(name, 'a');
    expect(screen.getByTestId('form-status')).toHaveTextContent('dirty');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ authors: [{ name: 'Ivana' }] });
    expect(await screen.findByTestId('form-status')).toHaveTextContent('clean');

    await userEvent.type(name, 'b');
    expect(screen.getByTestId('form-status')).toHaveTextContent('dirty');
  });

  it('goes clean after saving a document with no list values', async () => {
    const absentLists: CollectionSchema = {
      name: 'post',
      format: 'mdx',
      fields: [
        t.string({ name: 'title', label: 'Title' }),
        t.array({
          name: 'authors',
          label: 'Authors',
          fields: [t.string({ name: 'name', label: 'Name' })],
        }),
        t.array({
          name: 'blocks',
          label: 'Blocks',
          templates: [
            {
              name: 'hero',
              label: 'Hero',
              fields: [t.string({ name: 'headline', label: 'Headline' })],
            },
          ],
        }),
      ],
    };
    render(
      <TinaProvider
        config={asResolvedConfig({ plugins: PLUGINS, schema: NO_COLLECTIONS })}
      >
        <FormProvider
          collection={absentLists}
          path={DOCUMENT_PATH}
          document={{ title: 'Hello' }}
          onSave={vi.fn()}
        >
          <LabelledFields />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );

    await userEvent.type(await screen.findByLabelText('Title'), '!');
    await userEvent.click(screen.getByText('save'));

    expect(await screen.findByTestId('form-status')).toHaveTextContent('clean');
  });
});

describe('ArrayField with a stored value of the wrong shape', () => {
  it('blocks a save until the value is cleared, then saves without it', async () => {
    const onSave = vi.fn(async () => {});
    const oneArray: CollectionSchema = {
      name: 'post',
      label: 'Posts',
      format: 'mdx',
      fields: [
        t.array({
          name: 'authors',
          label: 'Authors',
          fields: [t.string({ name: 'name', label: 'Name' })],
        }),
      ],
    };
    render(
      <TinaProvider
        config={asResolvedConfig({ plugins: PLUGINS, schema: NO_COLLECTIONS })}
      >
        <FormProvider
          collection={oneArray}
          path={DOCUMENT_PATH}
          document={{ authors: 'Ivan' }}
          onSave={onSave}
        >
          <LabelledFields />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );
    await userEvent.click(await screen.findByText('save'));
    expect(
      await screen.findByText('Authors must be a list of items')
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear' })[0]);
    await waitFor(() =>
      expect(
        screen.queryByText('Authors must be a list of items')
      ).not.toBeInTheDocument()
    );
    await userEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  });
});

describe('ArrayField validation', () => {
  it('rejects a value that is not a list of items', async () => {
    const descriptor = (await resolveRegistry()).get('array');
    for (const bad of ['Ivan', 42, { name: 'Ivan' }, ['Ivan']]) {
      expect(validateFieldWithCore(authorsNode, descriptor, bad)).toEqual([
        'Authors must be a list of items',
      ]);
    }
  });

  it('requires at least one item', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    expect(
      validateFieldWithCore(authorsNode, descriptor, [{ name: 'Ivan' }])
    ).toEqual([]);
    expect(validateFieldWithCore(authorsNode, descriptor, [])).toEqual([
      'Authors is required',
    ]);
    expect(validateFieldWithCore(authorsNode, descriptor, undefined)).toEqual([
      'Authors is required',
    ]);
  });

  it('keeps the required floor of one item when min is 0', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    const node = t.array({
      name: 'authors',
      label: 'Authors',
      validators: [required(), min(0)],
      fields: [t.string({ name: 'name' })],
    });
    expect(validateFieldWithCore(node, descriptor, [])).toEqual([
      'Authors is required',
    ]);
    expect(validateFieldWithCore(node, descriptor, [{ name: 'Ivan' }])).toEqual(
      []
    );
  });

  it('rejects more items than max', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    expect(
      validateFieldWithCore(tagsNode, descriptor, [
        { value: 'a' },
        { value: 'b' },
      ])
    ).toEqual([]);
    expect(
      validateFieldWithCore(tagsNode, descriptor, [
        { value: 'a' },
        { value: 'b' },
        { value: 'c' },
      ])
    ).toEqual(['Tags must be at most 2 items']);
  });

  it("validates each item field and keys messages by the item's nested address", async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('array');
    const errors = descriptor?.validateChildren?.(
      [{ name: '', age: 30 }, { name: 'Brook' }],
      authorsNode,
      'authors',
      registry,
      { validators: coreValidatorRegistry }
    );
    expect(errors).toEqual({ 'authors.0.name': ['Name is required'] });
  });

  it('does not re-render the form when an error changes on one field', async () => {
    const ticks = { count: 0 };
    renderField(
      { authors: [{ name: 'Ivan' }] },
      <>
        <FormContextProbe ticks={ticks} />
        <SetNameError />
      </>
    );
    await screen.findByLabelText('Name');
    const settled = ticks.count;
    expect(settled).toBeGreaterThan(0);
    await userEvent.click(
      screen.getByRole('button', { name: 'Set name error' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Name is required'
    );
    expect(ticks.count).toBe(settled);
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

  it('drops a validation error when the invalid item is removed', async () => {
    renderField({ authors: [{ name: 'Ivan' }, { name: 'Brook' }] });
    const names = await screen.findAllByLabelText('Name');
    await userEvent.clear(names[0]);
    await waitFor(() =>
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    );
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
      'Brook'
    );
  });

  it('moves a later item error down with that item', async () => {
    renderField({
      authors: [{ name: 'Ivan' }, { name: 'Brook' }, { name: 'Ada' }],
    });
    const names = await screen.findAllByLabelText('Name');
    await userEvent.clear(names[1]);
    await waitFor(() =>
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() => {
      const remaining = screen.getAllByLabelText('Name') as HTMLInputElement[];
      expect(remaining.map((input) => input.value)).toEqual(['', 'Ada']);
      const wrapperOf = (input: HTMLElement) =>
        input.closest('[data-slot="field-wrapper"]');
      expect(wrapperOf(remaining[0])?.textContent).toContain(
        'Name is required'
      );
      expect(wrapperOf(remaining[1])?.textContent ?? '').not.toContain(
        'Name is required'
      );
    });
    const keys = errorKeys();
    expect(keys).toContain('authors.0.name');
    expect(keys).not.toContain('authors.1.name');
    expect(keys).not.toContain('authors.2.name');
  });

  it('moves a later item error to the index that item takes', async () => {
    renderField({
      authors: [{ name: 'Ivan' }, { name: 'Brook' }, { name: 'Cara' }],
    });
    const names = await screen.findAllByLabelText('Name');
    await userEvent.clear(names[2]);
    await waitFor(() =>
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() =>
      expect(screen.getAllByLabelText('Name')).toHaveLength(2)
    );
    const keys = errorKeys();
    expect(keys).toContain('authors.1.name');
    expect(keys).not.toContain('authors.0.name');
    expect(keys).not.toContain('authors.2.name');
  });

  it('does not surface an error on an untouched item when another is removed', async () => {
    renderField({
      authors: [{ name: 'Ivan' }, { name: 'Brook' }, { name: '' }],
    });
    await screen.findAllByLabelText('Name');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() =>
      expect(screen.getAllByLabelText('Name')).toHaveLength(2)
    );
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('removes an item from a list nested in another list', async () => {
    renderField({
      groups: [{ members: [{ name: 'Ivan' }, { name: 'Brook' }] }],
    });
    await screen.findAllByLabelText('Name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 2' })
    );
    await waitFor(() =>
      expect(valueOf('groups')).toEqual([{ members: [{ name: 'Ivan' }] }])
    );
    expect(
      Object.keys(
        useFormStore.getState().forms[toFormId(DOCUMENT_PATH)]?.values ?? {}
      )
    ).not.toContain('groups.0.members');
  });

  it('keeps an existing validation error when another item is removed', async () => {
    renderField({ authors: [{ name: 'Ivan' }, { name: 'Brook' }] });
    const names = await screen.findAllByLabelText('Name');
    await userEvent.clear(names[0]);
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 2' })
    );
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
      registry,
      { validators: coreValidatorRegistry }
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
    const ingested = ingestDocument(stored, collection.fields, { registry });
    expect(ingested).toEqual({
      authors: [{ name: 'Ivan', age: '30' }],
      tags: null,
      groups: null,
    });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual(
      stored
    );
  });

  it('holds an absent field as null and digests it as absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({
      authors: null,
      tags: null,
      groups: null,
    });
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
  });

  it('reads null as an empty list', async () => {
    const registry = await resolveRegistry();
    expect(
      ingestDocument({ authors: null }, collection.fields, { registry })
    ).toEqual({ authors: [], tags: null, groups: null });
  });

  it('keeps stored content that is not an array of objects unchanged', async () => {
    const registry = await resolveRegistry();
    for (const bad of ['oops', 42, { name: 'Ivan' }, ['Ivan'], [null]]) {
      const ingested = ingestDocument({ authors: bad }, collection.fields, {
        registry,
      });
      expect(ingested.authors).toEqual(bad);
      expect(
        digestDocument(ingested, collection.fields, { registry }).authors
      ).toEqual(bad);
    }
  });
});

describe('asArrayFieldSchema', () => {
  it('throws on an array node that declares none of fields, templates or of', () => {
    const node = { name: 'authors', type: 'array' } as FieldSchema;
    expect(() => asArrayFieldSchema(node)).toThrow(
      /needs one of "fields", "templates" or "of"/
    );
  });

  it('throws on an array node that declares more than one item shape', () => {
    const node = {
      name: 'blocks',
      type: 'array',
      fields: [],
      templates: [],
    } as FieldSchema;
    expect(() => asArrayFieldSchema(node)).toThrow(
      /declares "fields" and "templates"; use exactly one/
    );
  });

  it.each([
    ['fields', { fields: [] }],
    ['templates', { templates: [{ name: 'hero', fields: [] }] }],
    ['of', { of: { name: 'tag', type: 'string' } }],
  ])('accepts an array node that declares only %s', (_key, shape) => {
    const node = { name: 'items', type: 'array', ...shape } as FieldSchema;
    expect(asArrayFieldSchema(node)).toBe(node);
  });

  it('throws on templates with no template, and on an of with no type', () => {
    const noTemplates = {
      name: 'blocks',
      type: 'array',
      templates: [],
    } as FieldSchema;
    expect(() => asArrayFieldSchema(noTemplates)).toThrow(
      /at least one template/
    );
    const badOf = { name: 'tags', type: 'array', of: 'string' } as FieldSchema;
    expect(() => asArrayFieldSchema(badOf)).toThrow(/a field with a "type"/);
  });

  it('throws on two templates with the same name', () => {
    const node = {
      name: 'blocks',
      type: 'array',
      templates: [
        { name: 'hero', fields: [] },
        { name: 'hero', fields: [] },
      ],
    } as FieldSchema;
    expect(() => asArrayFieldSchema(node)).toThrow(/same name/);
  });

  it('throws when of is not a single-value field', () => {
    const objectOf = {
      name: 'people',
      type: 'array',
      of: { name: 'person', type: 'object', fields: [] },
    } as FieldSchema;
    const arrayOf = {
      name: 'grid',
      type: 'array',
      of: { name: 'row', type: 'array', of: { name: 'cell', type: 'number' } },
    } as FieldSchema;
    const bareObjectOf = {
      name: 'people',
      type: 'array',
      of: { name: 'person', type: 'object' },
    } as FieldSchema;
    const bareArrayOf = {
      name: 'grid',
      type: 'array',
      of: { name: 'row', type: 'array' },
    } as FieldSchema;
    for (const node of [objectOf, arrayOf, bareObjectOf, bareArrayOf]) {
      expect(() => asArrayFieldSchema(node)).toThrow(
        /needs "of" to be a single-value field, but it is .*Use "fields" for a list of objects/
      );
    }
  });

  it('throws when fields is not an array', () => {
    const node = { name: 'authors', type: 'array', fields: {} } as FieldSchema;
    expect(() => asArrayFieldSchema(node)).toThrow(/to be an array/);
  });
});

describe('t.array', () => {
  it('narrows to the item shape it is given', () => {
    const blocks = t.array({
      name: 'blocks',
      templates: [{ name: 'hero', fields: [t.string({ name: 'headline' })] }],
    });
    const tags = t.array({ name: 'tags', of: t.string({ name: 'tag' }) });

    expect(isTemplatesArray(blocks)).toBe(true);
    expect(isScalarArray(tags)).toBe(true);
    expect(blocks.templates[0].name).toBe('hero');
    expect(tags.of.type).toBe('string');
  });

  it('rejects more than one item shape at the type level', () => {
    // @ts-expect-error fields and templates are mutually exclusive
    t.array({ name: 'blocks', fields: [], templates: [] });
    // @ts-expect-error one of fields, templates or of is required
    t.array({ name: 'blocks' });
  });

  it('rejects an object or array as `of` at the type level', () => {
    t.array({
      name: 'people',
      // @ts-expect-error `of` takes a single-value field
      of: t.object({ name: 'person', fields: [] }),
    });
    t.array({
      name: 'grid',
      // @ts-expect-error `of` takes a single-value field
      of: t.array({ name: 'row', of: t.number({ name: 'cell' }) }),
    });
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

const blocksCollection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.array({
      name: 'blocks',
      label: 'Blocks',
      templates: [
        {
          name: 'hero',
          label: 'Hero',
          defaultItem: { headline: 'Welcome' },
          fields: [t.string({ name: 'headline', label: 'Headline' })],
        },
        {
          name: 'cta',
          label: 'Call to action',
          fields: [
            t.string({ name: 'link', label: 'Link', validators: [required()] }),
            t.number({ name: 'weight', label: 'Weight' }),
          ],
        },
      ],
    }),
    t.array({
      name: 'scores',
      label: 'Scores',
      of: t.number({ name: 'score', label: 'Score', validators: [required()] }),
    }),
  ],
};

const [blocksNode, scoresNode] = blocksCollection.fields;
const PAGE_PATH = 'content/pages/home.mdx';

const pageValueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(PAGE_PATH)]?.values[
    toFieldAddress(name)
  ];

const renderPage = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({ plugins: PLUGINS, schema: NO_COLLECTIONS })}
    >
      <FormProvider
        collection={blocksCollection}
        path={PAGE_PATH}
        document={document}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

describe('ArrayField templates', () => {
  it("keeps each item's template through ingest and digest", async () => {
    const registry = await resolveRegistry();
    const stored = {
      blocks: [
        { _template: 'hero', headline: 'Hi' },
        { _template: 'cta', link: '/docs', weight: 2 },
      ],
    };
    const ingested = ingestDocument(stored, blocksCollection.fields, {
      registry,
    });
    expect(ingested).toEqual({
      blocks: [
        { _template: 'hero', headline: 'Hi' },
        { _template: 'cta', link: '/docs', weight: '2' },
      ],
      scores: null,
    });
    expect(
      digestDocument(ingested, blocksCollection.fields, { registry })
    ).toEqual(stored);
  });

  it('keeps an item with a missing or unknown template unchanged', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const registry = await resolveRegistry();
    const stored = {
      blocks: [
        { _template: 'gallery', images: ['a.png'] },
        { headline: 'No template' },
        { _template: 'cta', link: '/docs', weight: 2 },
      ],
    };
    const ingested = ingestDocument(stored, blocksCollection.fields, {
      registry,
    });
    expect(ingested).toEqual({
      blocks: [
        { _template: 'gallery', images: ['a.png'] },
        { headline: 'No template' },
        { _template: 'cta', link: '/docs', weight: '2' },
      ],
      scores: null,
    });
    expect(
      digestDocument(ingested, blocksCollection.fields, { registry })
    ).toEqual(stored);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('the unknown template "gallery"')
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no "_template"')
    );
    warn.mockRestore();
  });

  it('shows an unknown block that can be removed, beside working blocks', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderPage({
      blocks: [
        { _template: 'gallery', images: ['a.png'] },
        { _template: 'cta', link: '/docs' },
      ],
    });
    expect(
      await screen.findByText('Unknown block "gallery"')
    ).toBeInTheDocument();
    expect(screen.getByText(/"images"/)).toBeInTheDocument();
    expect(
      (screen.getByRole('textbox', { name: 'Link' }) as HTMLInputElement).value
    ).toBe('/docs');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { _template: 'cta', link: '/docs', weight: null },
      ])
    );
    warn.mockRestore();
  });

  it("renders each item with its template's label and fields", async () => {
    renderPage({
      blocks: [
        { _template: 'hero', headline: 'Hi' },
        { _template: 'cta', link: '/docs' },
      ],
    });
    expect(
      (
        (await screen.findByRole('textbox', {
          name: 'Headline',
        })) as HTMLInputElement
      ).value
    ).toBe('Hi');
    expect(
      (screen.getByRole('textbox', { name: 'Link' }) as HTMLInputElement).value
    ).toBe('/docs');
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Call to action')).toBeInTheDocument();
  });

  it('adds an item of the chosen template, seeded from its defaultItem', async () => {
    renderPage({ blocks: [] });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Hero' })
    );
    expect(
      (
        (await screen.findByRole('textbox', {
          name: 'Headline',
        })) as HTMLInputElement
      ).value
    ).toBe('Welcome');
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { _template: 'hero', headline: 'Welcome' },
      ])
    );
  });

  it('keeps each template with its item on a reorder', async () => {
    renderPage({
      blocks: [
        { _template: 'hero', headline: 'Hi' },
        { _template: 'cta', link: '/docs' },
      ],
    });
    await screen.findByRole('textbox', { name: 'Headline' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 2 up' })
    );
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { _template: 'cta', link: '/docs', weight: null },
        { _template: 'hero', headline: 'Hi' },
      ])
    );
  });

  it('edits a field of a template item and writes it back', async () => {
    renderPage({ blocks: [{ _template: 'cta', link: '/docs' }] });
    const link = await screen.findByRole('textbox', { name: 'Link' });
    await userEvent.type(link, '/v4');
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { _template: 'cta', link: '/docs/v4', weight: null },
      ])
    );
  });

  it('removes a template item and keeps the others', async () => {
    renderPage({
      blocks: [
        { _template: 'hero', headline: 'Hi' },
        { _template: 'cta', link: '/docs' },
      ],
    });
    await screen.findByRole('textbox', { name: 'Headline' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { _template: 'cta', link: '/docs', weight: null },
      ])
    );
    expect(
      screen.queryByRole('textbox', { name: 'Headline' })
    ).not.toBeInTheDocument();
    expect(
      (screen.getByRole('textbox', { name: 'Link' }) as HTMLInputElement).value
    ).toBe('/docs');
  });

  it("validates each item against its own template's fields", async () => {
    const registry = await resolveRegistry();
    const errors = registry.get('array')?.validateChildren?.(
      [
        { _template: 'hero', headline: '' },
        { _template: 'cta', link: '' },
      ],
      blocksNode,
      'blocks',
      registry,
      { validators: coreValidatorRegistry }
    );
    expect(errors).toEqual({ 'blocks.1.link': ['Link is required'] });
  });

  it('skips an item whose template is unknown when validating', async () => {
    const registry = await resolveRegistry();
    const errors = registry
      .get('array')
      ?.validateChildren?.(
        [{ _template: 'gallery', link: '' }],
        blocksNode,
        'blocks',
        registry,
        { validators: coreValidatorRegistry }
      );
    expect(errors).toEqual({});
  });

  it('shows an item that is not an object read-only, beside working blocks', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const registry = await resolveRegistry();
    const stored = { blocks: ['hello', { _template: 'cta', link: '/docs' }] };
    expect(
      digestDocument(
        ingestDocument(stored, blocksCollection.fields, { registry }),
        blocksCollection.fields,
        { registry }
      )
    ).toEqual(stored);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('an item that is not an object')
    );
    expect(
      validateFieldWithCore(blocksNode, registry.get('array'), stored.blocks)
    ).toEqual(['Blocks must be a list of items']);
    renderPage(stored);
    expect(
      await screen.findByText('Item 1 is not an object')
    ).toBeInTheDocument();
    expect(screen.getByText('"hello"')).toBeInTheDocument();
    expect(
      (screen.getByRole('textbox', { name: 'Link' }) as HTMLInputElement).value
    ).toBe('/docs');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { _template: 'cta', link: '/docs', weight: null },
      ])
    );
    warn.mockRestore();
  });

  it('skips a non-object item when validating the items of a fields array', async () => {
    const registry = await resolveRegistry();
    const people = t.array({
      name: 'people',
      label: 'People',
      fields: [
        t.string({ name: 'name', label: 'Name', validators: [required()] }),
      ],
    });
    expect(
      registry
        .get('array')
        ?.validateChildren?.(
          ['hello', { name: '' }],
          people,
          'people',
          registry,
          {
            validators: coreValidatorRegistry,
          }
        )
    ).toEqual({ 'people.1.name': ['Name is required'] });
  });

  it('shows an item with no template and moves it like any other', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderPage({
      blocks: [{ _template: 'cta', link: '/docs' }, { headline: 'Orphan' }],
    });
    expect(
      await screen.findByText('Block with no template')
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 2 up' })
    );
    await waitFor(() =>
      expect(pageValueOf('blocks')).toEqual([
        { headline: 'Orphan' },
        { _template: 'cta', link: '/docs', weight: null },
      ])
    );
    warn.mockRestore();
  });
});

describe('ArrayField of', () => {
  it("runs the of field's parse and serialize on each item", async () => {
    const registry = await resolveRegistry();
    const stored = { scores: [3, 5] };
    const ingested = ingestDocument(stored, blocksCollection.fields, {
      registry,
    });
    expect(ingested).toEqual({ blocks: null, scores: ['3', '5'] });
    expect(
      digestDocument(ingested, blocksCollection.fields, { registry })
    ).toEqual(stored);
  });

  it('shows a stored value that is not a list read-only, for templates and of', async () => {
    renderPage({ blocks: 'oops', scores: { a: 1 } });
    expect(await screen.findAllByText(/not a list of items/)).toHaveLength(2);
    expect(pageValueOf('blocks')).toBe('oops');
    expect(pageValueOf('scores')).toEqual({ a: 1 });
  });

  it('rejects a value that is not a list of items', async () => {
    const descriptor = (await resolveRegistry()).get('array');
    expect(validateFieldWithCore(scoresNode, descriptor, 'oops')).toEqual([
      'Scores must be a list of items',
    ]);
    expect(validateFieldWithCore(scoresNode, descriptor, [1, 2])).toEqual([]);
  });

  it('keeps stored content that is not an array unchanged', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument({ scores: 3 }, blocksCollection.fields, {
      registry,
    });
    expect(ingested.scores).toBe(3);
    expect(
      digestDocument(ingested, blocksCollection.fields, { registry }).scores
    ).toBe(3);
  });

  it('renders, edits, adds, reorders and removes scalar items', async () => {
    renderPage({ scores: [3, 5, 7] });
    const shown = () =>
      (
        screen.getAllByRole('spinbutton', {
          name: 'Score',
        }) as HTMLInputElement[]
      ).map((input) => input.value);
    await screen.findAllByRole('spinbutton', { name: 'Score' });
    expect(shown()).toEqual(['3', '5', '7']);

    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 3 up' })
    );
    await waitFor(() => expect(shown()).toEqual(['3', '7', '5']));

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove item 1' })
    );
    await waitFor(() => expect(shown()).toEqual(['7', '5']));

    await userEvent.type(
      screen.getAllByRole('spinbutton', { name: 'Score' })[0],
      '1'
    );
    await waitFor(() => expect(pageValueOf('scores')).toEqual(['71', '5']));
    expect(shown()).toEqual(['71', '5']);

    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(
      await screen.findAllByRole('spinbutton', { name: 'Score' })
    ).toHaveLength(3);
  });

  it('keeps a value typed into a new item when the item moves', async () => {
    renderPage({ scores: [3, 5] });
    await screen.findAllByRole('spinbutton', { name: 'Score' });
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    const inputs = (await screen.findAllByRole('spinbutton', {
      name: 'Score',
    })) as HTMLInputElement[];
    await userEvent.type(inputs[2], '9');
    await userEvent.click(
      screen.getByRole('button', { name: 'Move item 3 up' })
    );
    await waitFor(() => expect(pageValueOf('scores')).toEqual(['3', '9', '5']));
    expect(
      (
        screen.getAllByRole('spinbutton', {
          name: 'Score',
        }) as HTMLInputElement[]
      ).map((input) => input.value)
    ).toEqual(['3', '9', '5']);
  });

  it('keeps an empty item empty through ingest and digest', async () => {
    const registry = await resolveRegistry();
    const fields = [
      t.array({ name: 'scores', of: t.number({ name: 'score' }) }),
    ];
    const ingested = ingestDocument({ scores: [1, null] }, fields, {
      registry,
    });
    expect(ingested).toEqual({ scores: ['1', null] });
    expect(digestDocument(ingested, fields, { registry })).toEqual({
      scores: [1, null],
    });
    expect(
      digestDocument({ scores: ['1', undefined] }, fields, { registry })
    ).toEqual({ scores: [1, null] });
  });

  it('validates each item at its index address', async () => {
    const registry = await resolveRegistry();
    const errors = registry
      .get('array')
      ?.validateChildren?.(['3', ''], scoresNode, 'scores', registry, {
        validators: coreValidatorRegistry,
      });
    expect(errors).toEqual({ 'scores.1': ['Score is required'] });
  });
});
