import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { FormProvider, TinaProvider, useFormSave } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { max } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../../../test/labelled-fields';
import booleanFieldPlugin from '../boolean/boolean-field.plugin';
import numberFieldPlugin from '../number/number-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';

const PATH = 'content/pages/home.mdx';
const PLUGINS = [
  arrayFieldPlugin,
  stringFieldPlugin,
  numberFieldPlugin,
  booleanFieldPlugin,
  coreValidatorsPlugin,
];

const collection: CollectionSchema = {
  name: 'page',
  format: 'mdx',
  fields: [
    t.array({
      name: 'links',
      label: 'Links',
      fields: [t.string({ name: 'label', label: 'Label' })],
    }),
    t.array({
      name: 'tags',
      label: 'Tags',
      of: t.string({ name: 'tag', label: 'Tag' }),
    }),
    t.array({
      name: 'scores',
      label: 'Scores',
      of: t.number({ name: 'score', label: 'Score' }),
    }),
    t.array({
      name: 'flags',
      label: 'Flags',
      of: t.boolean({ name: 'flag', label: 'Flag' }),
    }),
    t.array({
      name: 'capped',
      label: 'Capped',
      validators: [max(2)],
      fields: [t.string({ name: 'label', label: 'Label' })],
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
        {
          name: 'cta',
          label: 'Call to action',
          fields: [t.string({ name: 'text', label: 'Text' })],
        },
      ],
    }),
  ],
};

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(PATH)]?.values[toFieldAddress(name)];

function SaveButton() {
  const save = useFormSave();
  return (
    <button type='button' onClick={() => save().catch(() => {})}>
      save
    </button>
  );
}

const renderPage = (
  document: TinaDocument,
  onSave: (values: TinaDocument) => void = () => {}
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: PLUGINS,
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path={PATH}
        document={document}
        onSave={onSave}
      >
        <LabelledFields />
        <SaveButton />
      </FormProvider>
    </TinaProvider>
  );

const chooseAction = async (list: string, item: number, action: string) => {
  const group = await screen.findByRole('group', { name: list });
  const trigger = Array.from(
    group.querySelectorAll<HTMLElement>('[aria-label^="Actions for"]')
  )[item - 1];
  await userEvent.click(trigger);
  await userEvent.click(
    await screen.findByRole('menuitem', { name: new RegExp(`^${action}`) })
  );
};

const linkHeads = async () =>
  (await screen.findAllByRole('button', { name: /^Item \d+:/ })).map(
    (head) => head.textContent
  );

describe('ArrayField item actions', () => {
  it('inserts a seeded item above and below', async () => {
    renderPage({ links: [{ label: 'A' }, { label: 'B' }] });
    await chooseAction('Links', 1, 'Insert above');
    await waitFor(() => expect(valueOf('links')).toHaveLength(3));
    expect((valueOf('links') as TinaDocument[]).map((l) => l.label)).toEqual([
      '',
      'A',
      'B',
    ]);
    await chooseAction('Links', 3, 'Insert below');
    await waitFor(() => expect(valueOf('links')).toHaveLength(4));
    expect((valueOf('links') as TinaDocument[]).map((l) => l.label)).toEqual([
      '',
      'A',
      'B',
      '',
    ]);
  });

  it('opens a newly inserted item', async () => {
    renderPage({ links: [{ label: 'A' }] });
    await chooseAction('Links', 1, 'Insert below');
    expect(await screen.findAllByLabelText(/^Label\b/)).toHaveLength(1);
  });

  it('duplicates an item into an independent copy', async () => {
    renderPage({ links: [{ label: 'A' }] });
    await chooseAction('Links', 1, 'Duplicate');
    await waitFor(() => expect(valueOf('links')).toHaveLength(2));
    const copy = await screen.findByLabelText(/^Label\b/);
    await userEvent.type(copy, '!');
    expect((valueOf('links') as TinaDocument[]).map((l) => l.label)).toEqual([
      'A',
      'A!',
    ]);
  });

  it('keeps a duplicated block on its template', async () => {
    renderPage({ blocks: [{ _template: 'cta', text: 'Go' }] });
    await chooseAction('Blocks', 1, 'Duplicate');
    await waitFor(() => expect(valueOf('blocks')).toHaveLength(2));
    expect(
      (valueOf('blocks') as TinaDocument[]).map((block) => block._template)
    ).toEqual(['cta', 'cta']);
  });

  it('inserts a block of the template picked at that index', async () => {
    renderPage({ blocks: [{ _template: 'cta', text: 'Go' }] });
    await chooseAction('Blocks', 1, 'Insert above');
    const buttons = await screen.findAllByRole('button', { name: 'Add Hero' });
    await userEvent.click(buttons[0]);
    await waitFor(() => expect(valueOf('blocks')).toHaveLength(2));
    expect(
      (valueOf('blocks') as TinaDocument[]).map((block) => block._template)
    ).toEqual(['hero', 'cta']);
  });

  it('reorders with the arrow keys on the grip and keeps focus on the moved item', async () => {
    renderPage({ links: [{ label: 'A' }, { label: 'B' }] });
    const grip = await screen.findByRole('button', { name: 'Move Item 2' });
    grip.focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect((valueOf('links') as TinaDocument[]).map((l) => l.label)).toEqual([
        'B',
        'A',
      ])
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move Item 1' })).toHaveFocus()
    );
  });

  it('removes at once and focuses the next grip, then the previous, then Add', async () => {
    renderPage({ links: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] });
    await chooseAction('Links', 2, 'Remove');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(valueOf('links')).toHaveLength(2));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move Item 2' })).toHaveFocus()
    );
    await chooseAction('Links', 2, 'Remove');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move Item 1' })).toHaveFocus()
    );
    await chooseAction('Links', 1, 'Remove');
    const group = await screen.findByRole('group', { name: 'Links' });
    await waitFor(() =>
      expect(group.querySelector('[data-slot=add-button]')).toHaveFocus()
    );
  });

  it('disables adding and the three adding actions at the max, with the reason', async () => {
    renderPage({ capped: [{ label: 'A' }, { label: 'B' }] });
    const group = await screen.findByRole('group', { name: 'Capped' });
    const add = group.querySelector('[data-slot=add-button]');
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription(/This list is full/);
    await chooseAction('Capped', 1, 'Remove');
    await waitFor(() =>
      expect(group.querySelector('[data-slot=add-button]')).toBeEnabled()
    );
  });
});

describe('ArrayField scalar items', () => {
  it('keeps each row on its value through insert, duplicate and move', async () => {
    renderPage({ tags: ['a', 'b'] });
    await chooseAction('Tags', 1, 'Duplicate');
    await waitFor(() => expect(valueOf('tags')).toEqual(['a', 'a', 'b']));
    await chooseAction('Tags', 3, 'Move up');
    await waitFor(() => expect(valueOf('tags')).toEqual(['a', 'b', 'a']));
    const boxes = screen.getAllByRole('textbox', { name: /^Item \d/ });
    expect(boxes.map((box) => (box as HTMLInputElement).value)).toEqual([
      'a',
      'b',
      'a',
    ]);
    await userEvent.type(boxes[1], '!');
    await chooseAction('Tags', 1, 'Insert below');
    await waitFor(() => expect(valueOf('tags')).toEqual(['a', '', 'b!', 'a']));
  });

  it('adds a typed value on Enter and nothing on an empty Enter', async () => {
    renderPage({ tags: [] });
    const add = await screen.findByRole('textbox', { name: 'Add item' });
    await userEvent.type(add, '{Enter}');
    expect(valueOf('tags')).toEqual([]);
    await userEvent.type(add, 'news{Enter}');
    await waitFor(() => expect(valueOf('tags')).toEqual(['news']));
  });

  it('saves a number list as numbers', async () => {
    const onSave = vi.fn();
    renderPage({ scores: [3, 5] }, onSave);
    const add = await screen.findByRole('spinbutton', { name: 'Add item' });
    await userEvent.type(add, '7{Enter}');
    await waitFor(() => expect(valueOf('scores')).toEqual(['3', '5', '7']));
    await userEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].scores).toEqual([3, 5, 7]);
  });

  it('keeps the widget of a type that has no card box', async () => {
    renderPage({ flags: [true, false] });
    expect(
      await screen.findAllByRole('checkbox', { name: /^Flag\b/ })
    ).toHaveLength(2);
    expect(screen.queryAllByRole('textbox', { name: /^Item \d/ })).toHaveLength(
      0
    );
  });

  it('loads and saves a stored list unchanged', async () => {
    const onSave = vi.fn();
    renderPage({ tags: ['a', 'b'], links: [{ label: 'A' }] }, onSave);
    await screen.findByRole('textbox', { name: 'Item 1' });
    await userEvent.type(screen.getByRole('textbox', { name: 'Item 1' }), 'x');
    await userEvent.clear(screen.getByRole('textbox', { name: 'Item 1' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Item 1' }), 'a');
    await userEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const saved = onSave.mock.calls[0][0];
    expect(saved.tags).toEqual(['a', 'b']);
    expect(saved.links).toEqual([{ label: 'A' }]);
    expect(await linkHeads()).toBeTruthy();
  });
});
