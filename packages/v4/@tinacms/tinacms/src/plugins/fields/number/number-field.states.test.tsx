import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { numberFieldState, numberFieldStates } from './number-field.states';
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

  it('looks a state up by name', () => {
    expect(numberFieldState('filled').value).toBe('3');
    expect(() => numberFieldState('missing' as never)).toThrow(
      'No number field state named missing'
    );
  });

  it('forwards the input to a callback ref and an object ref', () => {
    const callback = vi.fn();
    const { unmount } = render(
      <NumberFieldView {...numberFieldState('filled')} ref={callback} />
    );
    expect(callback).toHaveBeenCalledWith(screen.getByRole('spinbutton'));
    unmount();

    const object = createRef<HTMLInputElement>();
    render(<NumberFieldView {...numberFieldState('filled')} ref={object} />);
    expect(object.current).toBe(screen.getByRole('spinbutton'));
  });

  it('reports an emptied box as null and steps with the buttons', async () => {
    const onChange = vi.fn();
    render(
      <NumberFieldView {...numberFieldState('filled')} onChange={onChange} />
    );
    await userEvent.clear(screen.getByRole('spinbutton'));
    expect(onChange).toHaveBeenLastCalledWith(null);
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenLastCalledWith('2');
  });

  it('does not step past a limit with the arrow key', async () => {
    const onChange = vi.fn();
    render(
      <NumberFieldView
        {...numberFieldState('at the maximum')}
        onChange={onChange}
      />
    );
    screen.getByRole('spinbutton').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('links the input to its help text', () => {
    render(<NumberFieldView {...numberFieldState('help and warning')} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-describedby',
      'rating-help'
    );
  });

  it('keeps the same output when re-rendered with unchanged props', () => {
    const props = numberFieldState('filled');
    const { rerender } = render(<NumberFieldView {...props} />);
    const before = screen.getByRole('spinbutton');
    rerender(<NumberFieldView {...props} />);
    expect(screen.getByRole('spinbutton')).toBe(before);
    expect(screen.getByRole('spinbutton')).toHaveValue(3);
  });
});
