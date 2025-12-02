import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  ColorPreview,
  HexInput,
  SwatchGrid,
  WidgetProps,
  useHexInput,
} from './color-input';
import { hexToRgb, rgbToHex } from './color-utils';

export const SketchWidget: React.FC<WidgetProps> = ({
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
  const currentRgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const num = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
    const updated = { ...currentRgb, [channel]: num };
    onChange(rgbToHex(updated.r, updated.g, updated.b));
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-3' style={{ width }}>
      <HexColorPicker
        color={color || '#000000'}
        onChange={onChange}
        style={{ width: '100%', height: '150px' }}
      />
      <div className='mt-2 flex gap-2 items-center'>
        <ColorPreview color={color} />
        <HexInput
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      <div className='mt-2 flex gap-2'>
        {(['r', 'g', 'b'] as const).map((channel) => (
          <div key={channel} className='flex-1'>
            <label className='block text-xs text-gray-500 mb-0.5'>
              {channel.toUpperCase()}
            </label>
            <input
              type='number'
              min={0}
              max={255}
              value={currentRgb[channel]}
              onChange={(e) => handleRgbChange(channel, e.target.value)}
              className='shadow-inner w-full px-2 py-1 text-sm border border-gray-200 rounded focus:shadow-outline focus:border-blue-500 focus:outline-none'
            />
          </div>
        ))}
      </div>
      <SwatchGrid
        colors={presetColors}
        selectedColor={color}
        onSelect={handleSwatchClick}
      />
    </div>
  );
};
