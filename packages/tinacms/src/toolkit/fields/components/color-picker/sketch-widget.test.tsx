import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SketchWidget } from './sketch-widget';

describe('SketchWidget', () => {
  const defaultProps = {
    presetColors: ['#FF0000', '#00FF00', '#0000FF', 'transparent'],
    color: '#FF0000',
    onChange: vi.fn(),
    width: '240px',
  };

  it('renders without crashing', () => {
    const { container } = render(<SketchWidget {...defaultProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('displays the hex input with current color', () => {
    const { getByDisplayValue } = render(<SketchWidget {...defaultProps} />);
    expect(getByDisplayValue('#FF0000')).toBeTruthy();
  });

  it('displays RGB inputs with correct values', () => {
    const { container } = render(<SketchWidget {...defaultProps} />);
    const numberInputs = container.querySelectorAll('input[type="number"]');

    expect(numberInputs).toHaveLength(3);
    expect((numberInputs[0] as HTMLInputElement).value).toBe('255'); // R
    expect((numberInputs[1] as HTMLInputElement).value).toBe('0'); // G
    expect((numberInputs[2] as HTMLInputElement).value).toBe('0'); // B
  });

  it('calls onChange when R input changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SketchWidget {...defaultProps} onChange={onChange} />
    );
    const rInput = container.querySelectorAll('input[type="number"]')[0];

    fireEvent.change(rInput, { target: { value: '128' } });

    expect(onChange).toHaveBeenCalledWith('#800000');
  });

  it('calls onChange when G input changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SketchWidget {...defaultProps} color='#000000' onChange={onChange} />
    );
    const gInput = container.querySelectorAll('input[type="number"]')[1];

    fireEvent.change(gInput, { target: { value: '255' } });

    expect(onChange).toHaveBeenCalledWith('#00FF00');
  });

  it('calls onChange when B input changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SketchWidget {...defaultProps} color='#000000' onChange={onChange} />
    );
    const bInput = container.querySelectorAll('input[type="number"]')[2];

    fireEvent.change(bInput, { target: { value: '255' } });

    expect(onChange).toHaveBeenCalledWith('#0000FF');
  });

  it('clamps RGB values to 0-255 range', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SketchWidget {...defaultProps} color='#000000' onChange={onChange} />
    );
    const rInput = container.querySelectorAll('input[type="number"]')[0];

    fireEvent.change(rInput, { target: { value: '300' } });

    expect(onChange).toHaveBeenCalledWith('#FF0000');
  });

  it('renders preset color swatches', () => {
    const { getAllByRole } = render(<SketchWidget {...defaultProps} />);
    const buttons = getAllByRole('button');

    expect(buttons.length).toBe(defaultProps.presetColors.length);
  });

  it('respects the provided width', () => {
    const { container } = render(
      <SketchWidget {...defaultProps} width='300px' />
    );
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.style.width).toBe('300px');
  });
});
