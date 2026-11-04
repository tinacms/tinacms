import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import {
  FormProvider,
  TinaProvider,
  useActiveField,
  useFormSave,
} from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { max, min } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../../../test/labelled-fields';
import { openBlockPicker } from '../../../test/open-block-picker';
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
      name: 'groups',
      label: 'Groups',
      fields: [
        t.string({ name: 'label', label: 'Label' }),
        t.array({
          name: 'steps',
          label: 'Steps',
          fields: [t.string({ name: 'text', label: 'Text' })],
        }),
      ],
    }),
    t.array({
      name: 'tiles',
      label: 'Tiles',
      picker: 'grid',
      templates: [
        {
          name: 'hero',
          label: 'Hero',
          previewImage: 'https://example.com/hero.png',
          fields: [t.string({ name: 'headline', label: 'Headline' })],
        },
      ],
    }),
    t.array({
      name: 'notes',
      label: 'Notes',
      of: t.string({
        name: 'note',
        label: 'Note',
        multiline: true,
        validators: [min(3)],
      }),
    }),
    t.array({
      name: 'cappedBlocks',
      label: 'Capped blocks',
      validators: [max(2)],
      templates: [
        {
          name: 'hero',
          label: 'Hero',
          fields: [t.string({ name: 'headline', label: 'Headline' })],
        },
      ],
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

// The cards that belong to the list itself, not to a list nested in a card.
const ownCards = (group: HTMLElement) =>
  Array.from(group.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute('data-array-item')
  );

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
    expect(
      await screen.findAllByRole('textbox', { name: /^Label\b/ })
    ).toHaveLength(1);
  });

  it('duplicates an item into an independent copy', async () => {
    renderPage({ links: [{ label: 'A' }] });
    await chooseAction('Links', 1, 'Duplicate');
    await waitFor(() => expect(valueOf('links')).toHaveLength(2));
    const copy = await screen.findByRole('textbox', { name: /^Label\b/ });
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
    const blocks = await screen.findByRole('group', { name: 'Blocks' });
    const buttons = await within(blocks).findAllByRole('button', {
      name: 'Add Hero',
    });
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

  it('moves nothing past either end of the list', async () => {
    renderPage({ links: [{ label: 'A' }, { label: 'B' }] });
    (await screen.findByRole('button', { name: 'Move Item 1' })).focus();
    await userEvent.keyboard('{ArrowUp}');
    screen.getByRole('button', { name: 'Move Item 2' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect((valueOf('links') as TinaDocument[]).map((l) => l.label)).toEqual([
      'A',
      'B',
    ]);
  });

  it('closes an open card when its head is clicked again', async () => {
    renderPage({ links: [{ label: 'A' }] });
    const head = await screen.findByRole('button', { name: /^Item 1:/ });
    await userEvent.click(head);
    expect(
      await screen.findByRole('textbox', { name: /^Label\b/ })
    ).toHaveValue('A');
    await userEvent.click(screen.getByRole('button', { name: /^Item 1:/ }));
    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: /^Label\b/ })).toBeNull()
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

  it('moves no value past either end, and shows an empty value as an empty box', async () => {
    renderPage({ tags: ['a', null] });
    (await screen.findByRole('button', { name: 'Move Item 1' })).focus();
    await userEvent.keyboard('{ArrowUp}');
    screen.getByRole('button', { name: 'Move Item 2' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(valueOf('tags')).toEqual(['a', null]);
    expect(screen.getByRole('textbox', { name: /^Item 2/ })).toHaveValue('');
  });

  it('focuses the Add box once the last value is removed', async () => {
    renderPage({ tags: ['a'] });
    await chooseAction('Tags', 1, 'Remove');
    await waitFor(() => expect(valueOf('tags')).toEqual([]));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Add item' })).toHaveFocus()
    );
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

function Activate({ address }: { address: string }) {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress(address))}>
      activate
    </button>
  );
}

describe('ArrayField focus and activation', () => {
  it('keeps focus in the list that changed when a card holds a nested list', async () => {
    renderPage({
      groups: [
        { label: 'A', steps: [{ text: 'x' }, { text: 'y' }] },
        { label: 'B', steps: [] },
        { label: 'C', steps: [] },
      ],
    });
    const groups = await screen.findByRole('group', { name: 'Groups' });
    await userEvent.click(
      await screen.findByRole('button', { name: /^Item 1: A/ })
    );
    await screen.findByRole('group', { name: 'Steps' });
    const menu = ownCards(groups)[1]?.querySelector(
      '[aria-label^="Actions for"]'
    );
    if (!menu) throw new Error('no menu');
    await userEvent.click(menu);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Remove' })
    );
    await waitFor(() => expect(valueOf('groups')).toHaveLength(2));
    await waitFor(() => {
      const focused = document.activeElement;
      expect(focused).toHaveAttribute('data-grip');
      expect(focused?.closest('[data-array-item]')?.parentElement).toBe(groups);
      expect(ownCards(groups)[1]).toContainElement(focused as HTMLElement);
    });
  });

  it('focuses "Add a block" after the last block is removed', async () => {
    renderPage({ tiles: [{ _template: 'hero', headline: 'Hi' }] });
    await chooseAction('Tiles', 1, 'Remove');
    const tiles = await screen.findByRole('group', { name: 'Tiles' });
    const add = await within(tiles).findByRole('button', {
      name: 'Add a block',
    });
    await waitFor(() => expect(add).toHaveFocus());
  });

  it('focuses a list box when its field is activated', async () => {
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
          document={{ tags: ['a', 'b'] }}
        >
          <LabelledFields />
          <Activate address='tags.1' />
        </FormProvider>
      </TinaProvider>
    );
    await screen.findByRole('textbox', { name: 'Item 2' });
    await userEvent.click(screen.getByText('activate'));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Item 2' })).toHaveFocus()
    );
  });

  it('adds nothing from an insertion picker left open after the list fills', async () => {
    renderPage({ cappedBlocks: [{ _template: 'hero', headline: 'One' }] });
    await chooseAction('Capped blocks', 1, 'Insert above');
    const group = await screen.findByRole('group', { name: 'Capped blocks' });
    const inline = await within(group).findByRole('button', {
      name: 'Add Hero',
    });
    await chooseAction('Capped blocks', 1, 'Duplicate');
    await waitFor(() => expect(valueOf('cappedBlocks')).toHaveLength(2));
    await userEvent.click(inline);
    expect(valueOf('cappedBlocks')).toHaveLength(2);
  });

  it('a pick refused at max closes the insert picker and returns focus to the opener grip', async () => {
    renderPage({ cappedBlocks: [{ _template: 'hero', headline: 'One' }] });
    await chooseAction('Capped blocks', 1, 'Insert above');
    const group = await screen.findByRole('group', { name: 'Capped blocks' });
    const inline = await within(group).findByRole('button', {
      name: 'Add Hero',
    });
    await chooseAction('Capped blocks', 1, 'Duplicate');
    await waitFor(() => expect(valueOf('cappedBlocks')).toHaveLength(2));
    await userEvent.click(inline);
    expect(valueOf('cappedBlocks')).toHaveLength(2);
    await waitFor(() =>
      expect(
        within(group).getByRole('button', { name: 'Move Item 1' })
      ).toHaveFocus()
    );
    expect(within(group).queryByRole('region')).toBeNull();
  });

  it('turns the add button off with a reason when the list is full', async () => {
    renderPage({
      cappedBlocks: [
        { _template: 'hero', headline: 'One' },
        { _template: 'hero', headline: 'Two' },
      ],
    });
    const group = await screen.findByRole('group', { name: 'Capped blocks' });
    const add = await within(group).findByRole('button', {
      name: 'Add a block',
    });
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription(/This list is full/);
  });

  it('shows the error of a list item that keeps its widget once', async () => {
    renderPage({ notes: ['ok!'] });
    const note = await screen.findByRole('textbox', { name: /^Note\b/ });
    await userEvent.clear(note);
    await userEvent.type(note, 'no');
    await userEvent.tab();
    // The list itself still shows the rolled-up message; the card adds none.
    const group = await screen.findByRole('group', { name: 'Notes' });
    await waitFor(() =>
      expect(within(ownCards(group)[0]).getAllByRole('alert')).toHaveLength(1)
    );
  });
});
