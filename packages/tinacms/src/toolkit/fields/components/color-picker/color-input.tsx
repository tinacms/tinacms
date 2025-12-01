import * as React from 'react';
import { useCallback, useState } from 'react';
import { checkerboardStyle } from './color-utils';

export interface WidgetProps {
  presetColors: string[];
  color: string;
  onChange: (color: string | null) => void;
  width: string;
}

export const useHexInput = (
  color: string,
  onChange: (color: string | null) => void
) => {
  const [inputValue, setInputValue] = useState(color);
  React.useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) onChange(value);
  };

  const handleBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) setInputValue(color);
  };

  const handleSwatchClick = useCallback(
    (c: string) => onChange(c === 'transparent' ? null : c),
    [onChange]
  );

  return { inputValue, handleChange, handleBlur, handleSwatchClick };
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
        backgroundColor: color === 'transparent' ? '#fff' : color,
        ...(color === 'transparent' ? checkerboardStyle() : {}),
      }}
      aria-label={
        color === 'transparent' ? 'Clear color' : `Select color ${color}`
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
      backgroundColor: color || 'transparent',
      ...(!color ? checkerboardStyle(size === 'lg' ? 16 : 8) : {}),
    }}
    aria-label='Current color preview'
  />
);

export const HexInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  fullWidth?: boolean;
}> = ({ value, onChange, onBlur, fullWidth }) => (
  <input
    type='text'
    value={value || ''}
    onChange={onChange}
    onBlur={onBlur}
    placeholder='#000000'
    className={`shadow-inner px-2 py-1 text-sm border border-gray-200 rounded focus:shadow-outline focus:border-blue-500 focus:outline-none ${fullWidth ? 'w-full' : 'flex-1'}`}
    maxLength={7}
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
