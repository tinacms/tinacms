import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup } from './radio-group';

const field = {
  name: 'alignment',
  component: 'radio-group',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
  ],
} as const;

describe('RadioGroup', () => {
  it('renders circular indicators and keeps unselected labels fully opaque', () => {
    render(
      <RadioGroup
        name='alignment'
        field={field}
        input={{
          name: 'alignment',
          value: 'center',
          onChange: vi.fn(),
        }}
      />
    );

    const checkedLabel = screen.getByText('Center').closest('label');
    if (!checkedLabel) {
      throw new Error('Expected the checked radio label to be rendered');
    }

    const checkedIndicator = checkedLabel.querySelector('span');
    const checkedDot = checkedIndicator?.querySelector('span');

    expect(checkedIndicator?.className).toContain('rounded-full');
    expect(checkedDot?.className).toContain('opacity-100');
    expect(screen.getByText('Left').className).not.toContain('opacity-70');
  });

  it('passes the selected value to input.onChange', () => {
    const onChange = vi.fn();

    render(
      <RadioGroup
        name='alignment'
        field={field}
        input={{
          name: 'alignment',
          value: 'left',
          onChange,
        }}
      />
    );

    fireEvent.click(screen.getByLabelText('Center'));

    expect(onChange).toHaveBeenCalledWith('center');
  });
});
