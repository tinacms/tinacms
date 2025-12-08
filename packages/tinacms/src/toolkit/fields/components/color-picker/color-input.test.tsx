import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHexInput } from './color-input';
import { TRANSPARENT } from './color-utils';

describe('useHexInput', () => {
  it('initializes with the provided color', () => {
    const { result } = renderHook(() => useHexInput('#FF0000', vi.fn()));
    expect(result.current.inputValue).toBe('#FF0000');
  });

  it('updates inputValue on valid hex input', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: '#00FF00' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('#00FF00');
    expect(onChange).toHaveBeenCalledWith('#00FF00');
  });

  it('updates inputValue but does not call onChange for invalid hex', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: '#invalid' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('#invalid');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts to original color on blur if invalid', () => {
    const { result } = renderHook(() => useHexInput('#FF0000', vi.fn()));

    act(() => {
      result.current.handleChange({
        target: { value: 'invalid' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.inputValue).toBe('#FF0000');
  });

  it('normalizes valid hex on blur', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: '#00FF00' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.inputValue).toBe('#00FF00');
    expect(onChange).toHaveBeenLastCalledWith('#00FF00');
  });

  it('handleSwatchClick calls onChange with color', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleSwatchClick('#0000FF');
    });

    expect(onChange).toHaveBeenCalledWith('#0000FF');
  });

  it('handleSwatchClick calls onChange with null for transparent', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleSwatchClick(TRANSPARENT);
    });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('syncs inputValue when color prop changes', () => {
    const { result, rerender } = renderHook(
      ({ color }) => useHexInput(color, vi.fn()),
      { initialProps: { color: '#FF0000' } }
    );

    expect(result.current.inputValue).toBe('#FF0000');

    rerender({ color: '#00FF00' });

    expect(result.current.inputValue).toBe('#00FF00');
  });

  it('keeps input value but sends normalized color on change', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: 'red' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('red');
    expect(onChange).toHaveBeenCalledWith('#FF0000');
  });

  it('normalizes CSS named colors for preview', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#000000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: 'tomato' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('tomato');
    expect(onChange).toHaveBeenCalledWith('#FF6347');
  });

  it('normalizes named colors in any case for preview', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#000000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: 'RED' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.inputValue).toBe('RED');
    expect(onChange).toHaveBeenCalledWith('#FF0000');

    act(() => {
      result.current.handleChange({
        target: { value: 'DarkBlue' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.inputValue).toBe('DarkBlue');
    expect(onChange).toHaveBeenCalledWith('#00008B');
  });

  it('normalizes named color to hex on blur', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#FF0000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: 'blue' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.inputValue).toBe('#0000FF');
    expect(onChange).toHaveBeenLastCalledWith('#0000FF');
  });

  it('normalizes shorthand hex on blur', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#000000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: '#F00' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('#F00');
    expect(onChange).toHaveBeenCalledWith('#FF0000');

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.inputValue).toBe('#FF0000');
    expect(onChange).toHaveBeenLastCalledWith('#FF0000');
  });

  it('normalizes hex case on blur', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useHexInput('#000000', onChange));

    act(() => {
      result.current.handleChange({
        target: { value: '#FF0000' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('#FF0000');
    expect(onChange).toHaveBeenCalledWith('#FF0000');

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.inputValue).toBe('#FF0000');
    expect(onChange).toHaveBeenLastCalledWith('#FF0000');
  });
});
