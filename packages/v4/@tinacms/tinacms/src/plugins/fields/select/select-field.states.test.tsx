import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { selectFieldState, selectFieldStates } from './select-field.states';
import {
  SelectFieldView,
  type SelectFieldViewProps,
} from './select-field.view';

const states: { name: string; props: SelectFieldViewProps }[] =
  selectFieldStates;

const isInert = ({ props }: { props: SelectFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

describe('select field states', () => {
  it.each(states)('renders $name', ({ props }) => {
    render(<SelectFieldView {...props} />);
    const trigger = screen.getByRole('combobox', {
      name: new RegExp(`^${props.label as string}\\b`),
    });
    expect(trigger).not.toHaveAttribute('aria-label');
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByText('*') !== null).toBe(!!props.required);
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(screen.queryByRole('status') !== null).toBe(
      !!props.warnings?.length
    );
    expect(trigger.getAttribute('aria-invalid') === 'true').toBe(
      !!props.errors?.length
    );
    if (props.help)
      expect(trigger).toHaveAccessibleDescription(props.help as string);
    else expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(
      trigger.hasAttribute('disabled') || trigger.hasAttribute('data-disabled')
    ).toBe(!!props.disabled);
    if (props.readOnly)
      expect(trigger).toHaveAttribute('aria-readonly', 'true');
  });

  it.each(states.filter(isInert))(
    'never opens or changes when $name',
    async ({ props }) => {
      const onChange = vi.fn();
      render(<SelectFieldView {...props} onChange={onChange} />);
      const trigger = screen.getByRole('combobox');
      await userEvent.click(trigger);
      trigger.focus();
      await userEvent.keyboard('{ArrowDown}{Enter} ');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it('shows a muted placeholder when empty', () => {
    render(<SelectFieldView {...selectFieldState('empty')} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Select...');
  });

  it('shows an unknown stored value as it is', () => {
    render(<SelectFieldView {...selectFieldState('unknown stored value')} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('scheduled');
  });

  it('opens by keyboard, picks with arrows and Enter', async () => {
    const onChange = vi.fn();
    render(
      <SelectFieldView {...selectFieldState('empty')} onChange={onChange} />
    );
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('draft');
  });

  it('closes on Escape without changing the value', async () => {
    const onChange = vi.fn();
    render(
      <SelectFieldView {...selectFieldState('filled')} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('offers None only when optional, and None clears to null', async () => {
    const onChange = vi.fn();
    const optional = render(
      <SelectFieldView {...selectFieldState('filled')} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith(null);
    optional.unmount();

    render(<SelectFieldView {...selectFieldState('required')} />);
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(screen.queryByRole('option', { name: 'None' })).toBeNull();
  });

  it('cannot pick a disabled option', async () => {
    const onChange = vi.fn();
    render(
      <SelectFieldView
        {...selectFieldState('disabled option')}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'Published' });
    expect(option).toHaveAttribute('aria-disabled', 'true');
    expect(option).toHaveAttribute('title', 'Needs an approver');
    await userEvent.click(option);
    expect(onChange).not.toHaveBeenCalled();
  });
});
