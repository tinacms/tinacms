import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BlockWidget } from './block-widget';

describe('BlockWidget', () => {
  const defaultProps = {
    presetColors: ['#FF0000', '#00FF00', '#0000FF', 'transparent'],
    color: '#FF0000',
    onChange: vi.fn(),
    width: '240px',
  };

  it('renders without crashing', () => {
    const { container } = render(<BlockWidget {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('displays the hex input with current color', () => {
    const { getByDisplayValue } = render(<BlockWidget {...defaultProps} />);
    expect(getByDisplayValue('#FF0000')).toBeTruthy();
  });

  it('displays color preview', () => {
    const { getByLabelText } = render(<BlockWidget {...defaultProps} />);
    expect(getByLabelText('Current color preview')).toBeTruthy();
  });

  it('renders preset color swatches', () => {
    const { getAllByRole } = render(<BlockWidget {...defaultProps} />);
    const buttons = getAllByRole('button');

    expect(buttons.length).toBe(defaultProps.presetColors.length);
  });

  it('calls onChange when swatch is clicked', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <BlockWidget {...defaultProps} onChange={onChange} />
    );

    fireEvent.click(getByLabelText('Select color #00FF00'));

    expect(onChange).toHaveBeenCalledWith('#00FF00');
  });

  it('calls onChange with null when transparent swatch is clicked', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <BlockWidget {...defaultProps} onChange={onChange} />
    );

    fireEvent.click(getByLabelText('Clear color'));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('updates color when valid hex is entered', () => {
    const onChange = vi.fn();
    const { getByDisplayValue } = render(
      <BlockWidget {...defaultProps} onChange={onChange} />
    );

    const input = getByDisplayValue('#FF0000');
    fireEvent.change(input, { target: { value: '#00FF00' } });

    expect(onChange).toHaveBeenCalledWith('#00FF00');
  });

  it('accepts named colors in input', () => {
    const onChange = vi.fn();
    const { getByDisplayValue } = render(
      <BlockWidget {...defaultProps} onChange={onChange} />
    );

    const input = getByDisplayValue('#FF0000');
    fireEvent.change(input, { target: { value: 'blue' } });

    expect(onChange).toHaveBeenCalledWith('#0000FF');
  });

  it('respects the provided width', () => {
    const { container } = render(
      <BlockWidget {...defaultProps} width='300px' />
    );
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.style.width).toBe('300px');
  });
});
