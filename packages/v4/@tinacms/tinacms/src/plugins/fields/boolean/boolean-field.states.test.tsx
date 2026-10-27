import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { booleanFieldState, booleanFieldStates } from './boolean-field.states';
import {
  BooleanFieldView,
  type BooleanFieldViewProps,
} from './boolean-field.view';

const states: { name: string; props: BooleanFieldViewProps }[] =
  booleanFieldStates;

const isInert = ({ props }: { props: BooleanFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

describe('boolean field states', () => {
  it.each(states)('renders $name', ({ props }) => {
    render(<BooleanFieldView {...props} />);
    const box = screen.getByRole('checkbox', { name: props.label as string });
    expect(box).toHaveAttribute('aria-checked', String(props.checked));
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByText('*')).toBeNull();
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(screen.queryByRole('status') !== null).toBe(
      !!props.warnings?.length
    );
    expect(box.getAttribute('aria-invalid') === 'true').toBe(
      !!props.errors?.length
    );
    if (props.help)
      expect(box).toHaveAccessibleDescription(props.help as string);
    else expect(box).not.toHaveAttribute('aria-describedby');
    expect(
      box.hasAttribute('disabled') || box.hasAttribute('data-disabled')
    ).toBe(!!props.disabled);
    if (props.readOnly) expect(box).toHaveAttribute('aria-readonly', 'true');
  });

  it.each(states.filter(isInert))(
    'ignores clicks and keys when $name',
    async ({ props }) => {
      const onChange = vi.fn();
      render(<BooleanFieldView {...props} onChange={onChange} />);
      const box = screen.getByRole('checkbox');
      await userEvent.click(box);
      await userEvent.click(screen.getByText(props.label as string));
      box.focus();
      await userEvent.keyboard(' {Enter}');
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it.each([
    { name: 'on' as const, flipped: false },
    { name: 'off' as const, flipped: true },
  ])('toggles once from $name', async ({ name, flipped }) => {
    const props = booleanFieldState(name);
    const label = props.label as string;

    const byLabel = vi.fn();
    const first = render(<BooleanFieldView {...props} onChange={byLabel} />);
    await userEvent.click(screen.getByText(label));
    expect(byLabel).toHaveBeenCalledTimes(1);
    expect(byLabel).toHaveBeenCalledWith(flipped);
    first.unmount();

    const bySpace = vi.fn();
    const second = render(<BooleanFieldView {...props} onChange={bySpace} />);
    screen.getByRole('checkbox').focus();
    await userEvent.keyboard(' ');
    expect(bySpace).toHaveBeenCalledTimes(1);
    expect(bySpace).toHaveBeenCalledWith(flipped);
    second.unmount();

    const byEnter = vi.fn();
    render(<BooleanFieldView {...props} onChange={byEnter} />);
    screen.getByRole('checkbox').focus();
    await userEvent.keyboard('{Enter}');
    expect(byEnter).toHaveBeenCalledTimes(1);
    expect(byEnter).toHaveBeenCalledWith(flipped);
  });

  it('does not re-toggle while Enter repeats', async () => {
    const onChange = vi.fn();
    render(
      <BooleanFieldView {...booleanFieldState('off')} onChange={onChange} />
    );
    screen.getByRole('checkbox').focus();
    const box = screen.getByRole('checkbox');
    fireEvent.keyDown(box, { key: 'Enter' });
    fireEvent.keyDown(box, { key: 'Enter', repeat: true });
    fireEvent.keyDown(box, { key: 'Enter', repeat: true });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
