import React from 'react';
// `wrapFieldsWithMeta` is re-exported via tinacms's toolkit barrel using
// internal path aliases that the package doesn't resolve outside its own
// source tree. The runtime export works, but TS doesn't see it without
// the matching paths config — same pattern used in `uploadDir` below and
// in every other kitchen-sink that consumes this helper.
// @ts-ignore
import { wrapFieldsWithMeta } from 'tinacms';
import { cn } from '../../src/lib/utils';

const colorOptions = [
  'blue',
  'teal',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'white',
];

export const ColorPickerInput = wrapFieldsWithMeta(({ input }: any) => {
  const inputClasses = {
    blue: 'bg-blue-500 border-blue-600',
    teal: 'bg-teal-500 border-teal-600',
    green: 'bg-green-500 border-green-600',
    yellow: 'bg-yellow-500 border-yellow-600',
    orange: 'bg-orange-500 border-orange-600',
    red: 'bg-red-500 border-red-600',
    pink: 'bg-pink-500 border-pink-600',
    purple: 'bg-purple-500 border-purple-600',
    white: 'bg-white border-gray-150',
  };

  return (
    <>
      <input type='text' id={input.name} className='hidden' {...input} />
      <div className='flex gap-2 flex-wrap'>
        {colorOptions.map((color) => {
          return (
            <button
              key={color}
              type='button'
              aria-label={`Select ${color} color`}
              aria-pressed={input.value === color}
              className={cn(
                'w-9 h-9 rounded-full shadow border',
                inputClasses[color as keyof typeof inputClasses],
                input.value === color &&
                  'ring-[3px] ring-offset-2 ring-blue-400'
              )}
              onClick={() => {
                input.onChange(color);
              }}
            />
          );
        })}
      </div>
    </>
  );
});
