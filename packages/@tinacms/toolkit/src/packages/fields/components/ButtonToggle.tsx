/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'

type Option = {
  value: string
  label: string
}

interface ButtonToggleFieldProps {
  label?: string
  name: string
  component: string
  options: (Option | string)[]
  direction?: 'horizontal' | 'vertical'
}

export interface ButtonToggleProps {
  name: string
  input: any
  field: ButtonToggleFieldProps
  disabled?: boolean
  options?: (Option | string)[]
  direction?: 'horizontal' | 'vertical'
}

export const ButtonToggle: React.FC<ButtonToggleProps> = ({
  input,
  field,
  options,
}) => {
  const toggleOptions = options || field.options
  const direction = field.direction || 'horizontal'

  return (
    <>
      <input type="text" id={input.name} className="hidden" {...input} />
      <div
        className={`flex ${
          direction === 'horizontal' ? 'divide-x' : 'flex-col divide-y'
        } divide-gray-150 shadow-inner bg-gray-50 border border-gray-200 w-full justify-between rounded-md`}
      >
        {toggleOptions
          ? toggleOptions.map((toggleOption) => {
              const option = toProps(toggleOption)
              return (
                <ButtonOption
                  key={option.value}
                  input={input}
                  value={option.value}
                  label={option.label}
                />
              )
            })
          : input.value}
      </div>
    </>
  )
}

const ButtonOption = ({ input, value, label, ...props }) => {
  return (
    <button
      className={`flex-1 truncate border border-transparent block font-medium text-base px-3 py-2 text-gray-400 transition-all ease-out duration-150 ${
        input.value === value
          ? 'bg-white border border-gray-200 origin-center scale-[1.01] rounded-md shadow text-blue-500'
          : ''
      }`}
      onClick={() => {
        input.onChange(value)
      }}
      {...props}
    >
      {label}
    </button>
  )
}

function toProps(option: Option | string): Option {
  if (typeof option === 'object') return option
  return { value: option, label: option }
}
