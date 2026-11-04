import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { arrayFieldStates } from './array-field.states';
import {
  ArrayDrillInView,
  ArrayFieldView,
  type ArrayFieldViewProps,
  moveOnDrop,
  FULL_HINT,
} from './array-field.view';

const states: { name: string; props: ArrayFieldViewProps }[] = arrayFieldStates;

const inert = ({ props }: { props: ArrayFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

const openMenu = async (item: number) =>
  userEvent.click(
    screen.getByRole('button', { name: `Actions for Item ${item}` })
  );

describe('array field states', () => {
  it.each(states)('renders $name without unsaved marks', ({ props }) => {
    render(<ArrayFieldView {...props} />);
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(
      screen.getByRole('group', { name: /^(Authors|Tags|Blocks)/ })
    ).toBeVisible();
    expect(screen.queryByText('(required)') !== null).toBe(!!props.required);
    expect(screen.queryAllByRole('alert').length > 0).toBe(
      !!props.errors?.length || props.items.some((item) => item.error)
    );
  });

  it.each(states.filter(inert))('is inert when $name', async ({ props }) => {
    const onMove = vi.fn();
    const onAdd = vi.fn();
    render(<ArrayFieldView {...props} onMove={onMove} onAdd={onAdd} />);
    expect(document.querySelector('[title]')).toBeNull();
    if (props.readOnly) {
      expect(screen.queryByRole('button', { name: /^Actions for/ })).toBeNull();
      expect(screen.queryByRole('button', { name: /^Move/ })).toBeNull();
      expect(screen.queryByRole('button', { name: /^Add/ })).toBeNull();
    } else {
      for (const control of screen.getAllByRole('button')) {
        expect(control).toBeDisabled();
      }
    }
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows the fields of an open card', () => {
    const props = states.find((state) => state.name === 'item open')?.props;
    if (!props) throw new Error('missing state');
    render(<ArrayFieldView {...props} />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ivan');
    expect(screen.getByRole('button', { name: /^Item 1:/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('shows the error of a card that holds a widget', () => {
    render(
      <ArrayFieldView
        label='Flags'
        labelId='flags-label'
        items={[
          {
            id: '1',
            name: 'Item 1',
            kind: 'group',
            alwaysOpen: true,
            summary: 'Item 1',
            error: 'Flag is required',
            children: <input aria-label='Flag' />,
          },
        ]}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Flag is required');
  });

  it('says so when a list is empty', () => {
    const [empty, readOnlyEmpty] = ['empty', 'read-only empty'].map(
      (name) => states.find((state) => state.name === name)?.props
    );
    if (!empty || !readOnlyEmpty) throw new Error('missing state');
    const { unmount } = render(<ArrayFieldView {...empty} />);
    expect(screen.getByText(/This list is empty\. Add/)).toBeVisible();
    unmount();
    render(<ArrayFieldView {...readOnlyEmpty} />);
    expect(screen.getByText('This list is empty.')).toBeVisible();
  });

  it('turns adding off in the full state and says why', async () => {
    const props = states.find((state) => state.name === 'full')?.props;
    if (!props) throw new Error('missing state');
    const onAdd = vi.fn();
    const onInsert = vi.fn();
    render(<ArrayFieldView {...props} onAdd={onAdd} onInsert={onInsert} />);
    const add = screen.getByRole('button', { name: 'Add item' });
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription(/This list is full/);
    await openMenu(2);
    for (const name of ['Insert above', 'Insert below', 'Duplicate']) {
      const row = screen.getByRole('menuitem', { name: new RegExp(name) });
      expect(row).toHaveAttribute('aria-disabled', 'true');
      expect(row).toHaveTextContent(FULL_HINT);
    }
    await userEvent.click(
      screen.getByRole('menuitem', { name: /^Insert above/ })
    );
    expect(onInsert).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: /^Remove/ })).toBeVisible();
  });

  it('lists exactly the six item actions, with the ends of the list greyed', async () => {
    const props = states.find((state) => state.name === 'filled')?.props;
    if (!props) throw new Error('missing state');
    render(<ArrayFieldView {...props} />);
    await openMenu(1);
    const menu = screen.getByRole('menu');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((row) => row.textContent)
    ).toEqual([
      'Move up',
      'Move down',
      'Insert above',
      'Insert below',
      'Duplicate',
      'Remove',
    ]);
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(
      screen.getByRole('menuitem', { name: 'Move down' })
    ).not.toHaveAttribute('aria-disabled');
  });

  it('moves an item with the arrow keys on its grip', async () => {
    const props = states.find((state) => state.name === 'filled')?.props;
    if (!props) throw new Error('missing state');
    const onMove = vi.fn();
    render(<ArrayFieldView {...props} onMove={onMove} />);
    screen.getByRole('button', { name: 'Move Item 2' }).focus();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowDown}');
    expect(onMove.mock.calls).toEqual([
      [1, 0],
      [1, 2],
    ]);
  });

  it('removes at once, with no dialog', async () => {
    const props = states.find((state) => state.name === 'filled')?.props;
    if (!props) throw new Error('missing state');
    const onRemove = vi.fn();
    render(<ArrayFieldView {...props} onRemove={onRemove} />);
    await openMenu(3);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('shows the count on a closed card and none on an open one', () => {
    const base = states.find((state) => state.name === 'invalid')?.props;
    if (!base) throw new Error('missing state');
    const { rerender } = render(<ArrayFieldView {...base} />);
    const head = () => screen.getByRole('button', { name: /^Item 1:/ });
    expect(head()).toHaveAccessibleName(/2 errors/);
    rerender(
      <ArrayFieldView
        {...base}
        items={base.items.map((item, index) =>
          index === 0
            ? { ...item, open: true, children: <input aria-label='Name' /> }
            : item
        )}
      />
    );
    expect(head()).not.toHaveAccessibleName(/error/);
  });
});

describe('array field view', () => {
  const filled = () => {
    const props = states.find((state) => state.name === 'filled')?.props;
    if (!props) throw new Error('missing state');
    return props;
  };

  it('calls the handler of each item action with the item index', async () => {
    const onMove = vi.fn();
    const onInsert = vi.fn();
    const onDuplicate = vi.fn();
    render(
      <ArrayFieldView
        {...filled()}
        onMove={onMove}
        onInsert={onInsert}
        onDuplicate={onDuplicate}
      />
    );
    for (const action of [
      'Move up',
      'Move down',
      'Insert above',
      'Insert below',
      'Duplicate',
    ]) {
      await openMenu(2);
      await userEvent.click(screen.getByRole('menuitem', { name: action }));
    }
    expect(onMove.mock.calls).toEqual([
      [1, 0],
      [1, 2],
    ]);
    expect(onInsert.mock.calls).toEqual([
      [1, 'above'],
      [1, 'below'],
    ]);
    expect(onDuplicate).toHaveBeenCalledWith(1);
  });

  it('adds a typed value on Enter', async () => {
    const onAdd = vi.fn();
    render(
      <ArrayFieldView
        label='Tags'
        labelId='tags-label'
        items={[]}
        add='input'
        addLabel='Add a tag'
        onAdd={onAdd}
      />
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Add a tag' }),
      ' news {Enter}'
    );
    expect(onAdd).toHaveBeenCalledWith('news');
  });

  it('draws the insert control before its item, or after the last one', () => {
    const props = filled();
    const { rerender } = render(
      <ArrayFieldView
        {...props}
        inserting={{ index: 1, content: <p>Picker</p> }}
      />
    );
    const picker = screen.getByText('Picker');
    const second = screen.getByRole('button', { name: 'Move Item 2' });
    expect(
      picker.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    rerender(
      <ArrayFieldView
        {...props}
        inserting={{ index: props.items.length, content: <p>Picker</p> }}
      />
    );
    const last = screen.getByRole('button', { name: 'Move Item 3' });
    expect(
      screen.getByText('Picker').compareDocumentPosition(last) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
  });
});

describe('array drill-in card', () => {
  it.each([
    [0, 'No items'],
    [1, '1 item'],
    [3, '3 items'],
  ])('summarises %i items as "%s" and opens the list', async (count, words) => {
    const onDrillIn = vi.fn();
    render(
      <ArrayDrillInView label='Profiles' count={count} onDrillIn={onDrillIn} />
    );
    const card = screen.getByRole('button', { name: /^Open Profiles/ });
    expect(card).toHaveTextContent(words);
    await userEvent.click(card);
    expect(onDrillIn).toHaveBeenCalledOnce();
  });

  it('names the card after the field when the label is not text', () => {
    render(
      <ArrayDrillInView
        label={<span>Profiles</span>}
        name='profiles'
        count={2}
      />
    );
    expect(
      screen.getByRole('button', { name: /^Open profiles/ })
    ).toBeVisible();
  });
});

describe('blocks states', () => {
  const state = (name: string) => {
    const found = states.find((entry) => entry.name === name)?.props;
    if (!found) throw new Error(`missing state ${name}`);
    return found;
  };

  it('says "No blocks." for an empty editable and an empty read-only list', () => {
    const { unmount } = render(<ArrayFieldView {...state('blocks empty')} />);
    expect(screen.getByText('No blocks.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add a block' })).toBeEnabled();
    unmount();
    render(<ArrayFieldView {...state('blocks read-only empty')} />);
    expect(screen.getByText('No blocks.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add a block' })).toBeNull();
  });

  it('keeps the picker shut in the disabled state and turns "Add a block" off', () => {
    render(<ArrayFieldView {...state('blocks disabled')} />);
    expect(screen.getByRole('button', { name: 'Add a block' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('turns "Add a block" off in the full state and says why', () => {
    render(<ArrayFieldView {...state('blocks full')} />);
    const add = screen.getByRole('button', { name: 'Add a block' });
    expect(add).toBeDisabled();
    expect(add).toHaveAccessibleDescription(/This list is full/);
  });

  it('lists the blocks in schema order in the open plain picker', () => {
    render(<ArrayFieldView {...state('blocks plain picker open')} />);
    const panel = screen.getByRole('dialog', { name: 'Choose a block' });
    expect(
      within(panel)
        .getAllByRole('button', { name: /^Add / })
        .map((option) => option.getAttribute('aria-label'))
    ).toEqual(['Add Hero', 'Add Columns', 'Add Quote', 'Add Call to action']);
    expect(panel.querySelector('img')).toBeNull();
  });

  it('shows a preview and a name in each option of the open visual picker', () => {
    render(<ArrayFieldView {...state('blocks visual picker open')} />);
    const panel = screen.getByRole('dialog', { name: 'Choose a block' });
    const options = within(panel).getAllByRole('button', { name: /^Add / });
    expect(options).toHaveLength(4);
    for (const option of options) {
      expect(option.querySelector('[data-preview]')).not.toBeNull();
    }
  });
});

describe('moveOnDrop', () => {
  const drop = (active: string, over?: string) => ({
    active: { id: active },
    over: over === undefined ? null : { id: over },
  });

  it('moves from the dragged item to the item it lands on', () => {
    const onMove = vi.fn();
    const onDrop = moveOnDrop(['a', 'b', 'c'], onMove);
    onDrop(drop('a', 'c'));
    onDrop(drop('c', 'b'));
    expect(onMove.mock.calls).toEqual([
      [0, 2],
      [2, 1],
    ]);
  });

  it('moves nothing without a target, onto itself, for an unknown id or without a handler', () => {
    const onMove = vi.fn();
    const onDrop = moveOnDrop(['a', 'b'], onMove);
    onDrop(drop('a'));
    onDrop(drop('b', 'b'));
    onDrop(drop('gone', 'a'));
    onDrop(drop('a', 'gone'));
    moveOnDrop(['a', 'b'])(drop('a', 'b'));
    expect(onMove).not.toHaveBeenCalled();
  });
});

describe('array field view rerendered', () => {
  it('shows each state in turn on one mounted view', () => {
    const [first, ...rest] = states;
    const { rerender } = render(<ArrayFieldView {...first.props} />);
    for (const { props } of [...rest, first]) {
      rerender(<ArrayFieldView {...props} />);
      expect(
        screen.getByRole('group', { name: /^(Authors|Tags|Blocks)/ })
      ).toBeVisible();
    }
  });

  it('follows new props on a drill-in card', () => {
    const { rerender } = render(
      <ArrayDrillInView label='Profiles' count={0} />
    );
    rerender(
      <ArrayDrillInView
        label='Links'
        count={2}
        required
        invalidCount={1}
        errors={['Links is required']}
        onDrillIn={vi.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: /^Open Links/ })
    ).toHaveTextContent('2 items');
  });

  it('follows new props while an item menu is open', async () => {
    const props = states.find((state) => state.name === 'filled')?.props;
    if (!props) throw new Error('missing state');
    const { rerender } = render(<ArrayFieldView {...props} />);
    await openMenu(2);
    rerender(<ArrayFieldView {...props} />);
    rerender(<ArrayFieldView {...props} full />);
    rerender(
      <ArrayFieldView
        {...props}
        full
        onMove={vi.fn()}
        onInsert={vi.fn()}
        onDuplicate={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(
      screen.getByRole('menuitem', { name: /^Duplicate/ })
    ).toHaveAttribute('aria-disabled', 'true');
    rerender(<ArrayFieldView {...props} items={props.items.slice(1)} />);
    expect(screen.getAllByRole('button', { name: /^Move Item/ })).toHaveLength(
      2
    );
  });
});

describe('array field view without handlers', () => {
  it('does nothing when an action has no handler', async () => {
    const props = states.find((state) => state.name === 'filled')?.props;
    if (!props) throw new Error('missing state');
    render(<ArrayFieldView {...props} label={<span>Authors</span>} />);
    expect(screen.getByRole('group', { name: 'Authors' })).toBeVisible();
    for (const action of [
      'Move up',
      'Move down',
      'Insert above',
      'Insert below',
      'Duplicate',
      'Remove',
    ]) {
      await openMenu(2);
      await userEvent.click(screen.getByRole('menuitem', { name: action }));
    }
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    screen.getByRole('button', { name: 'Move Item 2' }).focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getAllByRole('button', { name: /^Move Item/ })).toHaveLength(
      3
    );
  });

  it('opens nothing from a drill-in card without a handler or a text label', async () => {
    render(<ArrayDrillInView label={<span>Profiles</span>} count={1} />);
    const card = screen.getByRole('button', { name: /^Open/ });
    await userEvent.click(card);
    expect(card).toHaveTextContent('1 item');
  });
});
