import { get as getColor } from 'color-string';
import * as React from 'react';
import {
  TRANSPARENT,
  checkerboardStyle,
  hexToRgb,
  isValidHex,
  rgbToHex,
} from './color-utils';

export interface WidgetProps {
  presetColors: string[];
  color: string;
  onChange: (color: string | null) => void;
  width: string;
}

const normalizeColorValue = (value: string): string | null => {
  if (isValidHex(value)) {
    const rgb = hexToRgb(value);
    if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  const parsed = getColor(value.toLowerCase());
  if (parsed)
    return rgbToHex(parsed.value[0], parsed.value[1], parsed.value[2]);
  return null;
};

export const useHexInput = (
  color: string,
  onChange: (color: string | null) => void
) => {
  const [inputValue, setInputValue] = React.useState(color);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(color);
    }
  }, [color, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const normalized = normalizeColorValue(value);
    if (normalized) onChange(normalized);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const normalized = normalizeColorValue(inputValue);
    if (normalized) {
      setInputValue(normalized);
      onChange(normalized);
    } else {
      setInputValue(color);
    }
  };

  const handleSwatchClick = React.useCallback(
    (c: string) => {
      if (c === TRANSPARENT) {
        onChange(null);
      } else {
        const normalized = normalizeColorValue(c);
        onChange(normalized || c);
      }
    },
    [onChange]
  );

  return { inputValue, handleChange, handleFocus, handleBlur, handleSwatchClick };
};

export const SwatchButton: React.FC<{
  color: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ color, isSelected, onClick }) => (
  <div className='relative w-full' style={{ paddingBottom: '100%' }}>
    <button
      type='button'
      onClick={onClick}
      className={`absolute inset-0 rounded-sm border cursor-pointer transition-all ${isSelected ? 'border-blue-500 border-2 scale-110' : 'border-gray-200 hover:scale-105'}`}
      style={{
        backgroundColor: color === TRANSPARENT ? '#fff' : color,
        ...(color === TRANSPARENT ? checkerboardStyle() : {}),
      }}
      aria-label={
        color === TRANSPARENT ? 'Clear color' : `Select color ${color}`
      }
    />
  </div>
);

export const ColorPreview: React.FC<{ color: string; size?: 'sm' | 'lg' }> = ({
  color,
  size = 'sm',
}) => (
  <div
    className={
      size === 'lg'
        ? 'h-16 w-full rounded border border-gray-200 mb-2'
        : 'w-8 h-8 rounded border border-gray-200 flex-shrink-0'
    }
    style={{
      backgroundColor: color || TRANSPARENT,
      ...(!color ? checkerboardStyle(size === 'lg' ? 16 : 8) : {}),
    }}
    aria-label='Current color preview'
  />
);

export const HexInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  fullWidth?: boolean;
}> = ({ value, onChange, onFocus, onBlur, fullWidth }) => (
  <input
    type='text'
    value={value || ''}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder='#000000 or color name'
    className={`shadow-inner px-2 py-1 text-sm border border-gray-200 rounded focus:shadow-outline focus:border-blue-500 focus:outline-none ${fullWidth ? 'w-full' : 'flex-1'}`}
  />
);

export const SwatchGrid: React.FC<{
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}> = ({ colors, selectedColor, onSelect }) => (
  <div
    className='mt-2 grid gap-1.5'
    style={{
      gridTemplateColumns: 'repeat(8, 1fr)',
    }}
  >
    {colors.map((c) => (
      <SwatchButton
        key={c}
        color={c}
        isSelected={selectedColor?.toLowerCase() === c.toLowerCase()}
        onClick={() => onSelect(c)}
      />
    ))}
  </div>
);
