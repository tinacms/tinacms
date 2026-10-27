import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { numberFieldStates } from './number-field.states';
import {
  NumberFieldView,
  type NumberFieldViewProps,
} from './number-field.view';

const states: { name: string; props: NumberFieldViewProps }[] =
  numberFieldStates;

describe('number field states', () => {
  it.each(states)('renders $name', ({ props }) => {
    render(<NumberFieldView {...props} />);
    const input = screen.getByRole('spinbutton', { name: /^Rating/ });
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(input.getAttribute('aria-invalid') === 'true').toBe(
      !!props.errors?.length
    );
    const inert = 'disabled' in props || 'readOnly' in props;
    expect(screen.queryByRole('button', { name: 'Increase' }) === null).toBe(
      inert
    );
    expect(screen.queryByRole('button', { name: 'Decrease' }) === null).toBe(
      inert
    );
  });

  it.each(
    states.filter(({ props }) => 'disabled' in props || 'readOnly' in props)
  )('ignores typing and arrows when $name', async ({ props }) => {
    const onChange = vi.fn();
    render(<NumberFieldView {...props} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '7{ArrowUp}{ArrowDown}');
    expect(onChange).not.toHaveBeenCalled();
  });
});
