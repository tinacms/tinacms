import React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';

export const colorOptions = ['blue', 'teal', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'white'];

export const ColorPickerInput = wrapFieldsWithMeta(({ input }) => {
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
              //@ts-ignore
              className={`w-9 h-9 rounded-full shadow border ${inputClasses[color]} ${input.value === color ? 'ring-[3px] ring-offset-2 ring-blue-400' : ''}`}
              onClick={() => {
                input.onChange(color);
              }}
            ></button>
          );
        })}
      </div>
    </>
  );
});
