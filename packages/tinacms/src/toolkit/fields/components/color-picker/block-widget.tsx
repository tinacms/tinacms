import * as React from 'react';
import {
  ColorPreview,
  HexInput,
  SwatchGrid,
  WidgetProps,
  useHexInput,
} from './color-input';

export const BlockWidget: React.FC<WidgetProps> = ({
  presetColors,
  color,
  onChange,
  width,
}) => {
  const {
    inputValue,
    handleChange,
    handleFocus,
    handleBlur,
    handleSwatchClick,
  } = useHexInput(color, onChange);

  return (
    <div
      className='bg-white rounded-lg shadow-lg overflow-hidden'
      style={{ width }}
    >
      <div className='p-3'>
        <ColorPreview color={color} size='lg' />
        <HexInput
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          fullWidth
        />
        <SwatchGrid
          colors={presetColors}
          selectedColor={color}
          onSelect={handleSwatchClick}
        />
      </div>
    </div>
  );
};
