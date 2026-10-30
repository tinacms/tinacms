import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  datetimeFieldState,
  datetimeFieldStates,
} from './datetime-field.states';
import {
  DatetimeFieldView,
  type DatetimeFieldViewProps,
} from './datetime-field.view';

const states: { name: string; props: DatetimeFieldViewProps }[] =
  datetimeFieldStates;

const isInert = ({ props }: { props: DatetimeFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

describe('datetime field states', () => {
  it.each(states)('renders $name', ({ props }) => {
    render(<DatetimeFieldView {...props} />);
    const input = screen.getByLabelText(
      new RegExp(`^${props.label as string}`)
    );
    expect(input).toHaveAttribute('type', 'datetime-local');
    expect(input).not.toHaveAttribute('title');
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByText('*') !== null).toBe(!!props.required);
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(screen.queryByRole('status') !== null).toBe(
      !!props.warnings?.length
    );
    expect(input.getAttribute('aria-invalid') === 'true').toBe(
      !!props.errors?.length
    );
    if (props.help)
      expect(input).toHaveAccessibleDescription(props.help as string);
    else expect(input).not.toHaveAttribute('aria-describedby');
    expect(input.hasAttribute('disabled')).toBe(!!props.disabled);
    expect(input.hasAttribute('data-empty')).toBe(props.value === '');
    if (props.value !== '') expect(input).toHaveValue(props.value);
  });

  it.each(states.filter(isInert))('never changes when $name', ({ props }) => {
    const onChange = vi.fn();
    render(<DatetimeFieldView {...props} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/^Published/), {
      target: { value: '2025-01-02T03:04' },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports a picked value as the input string', () => {
    const onChange = vi.fn();
    render(
      <DatetimeFieldView {...datetimeFieldState('empty')} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText(/^Published/), {
      target: { value: '2025-01-02T03:04' },
    });
    expect(onChange).toHaveBeenCalledWith('2025-01-02T03:04');
  });

  it('looks a state up by name', () => {
    expect(datetimeFieldState('filled').value).toBe('2024-05-01T09:30');
    expect(() => datetimeFieldState('missing' as never)).toThrow(
      'No datetime field state named missing'
    );
  });
});
