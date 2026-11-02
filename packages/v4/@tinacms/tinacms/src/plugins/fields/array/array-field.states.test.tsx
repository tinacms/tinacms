import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { arrayFieldStates } from './array-field.states';
import {
  ArrayFieldView,
  type ArrayFieldViewProps,
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
      screen.getByRole('group', { name: /^(Authors|Tags)/ })
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
