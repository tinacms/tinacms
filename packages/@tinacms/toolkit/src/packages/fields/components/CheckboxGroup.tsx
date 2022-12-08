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
import { BiCheck } from 'react-icons/bi'

type Option = {
  value: string
  label: string
}

export interface CheckboxGroupFieldProps {
  name: string
  label?: string
  component: string
  options: (Option | string)[]
}

export interface CheckboxGroupProps {
  name: string
  input: any
  field: CheckboxGroupFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  input,
  field,
  options,
  disabled = false,
}) => {
  const checkboxOptions = options || field.options

  const toProps = (option: Option | string): Option => {
    if (typeof option === 'object') return option
    return { value: option, label: option }
  }

  const toComponent = (option: Option) => {
    const optionId = `field-${field.name}-option-${option.value}`

    /**
     * We made the decision that an `option` (specifically, a `value`) would
     * typically not be duplicated.
     *
     * Valid:
     * options: ['Yes', 'No', 'Maybe']
     * Invalid:
     * options: ['Yes', 'Yes', 'No', 'Yes', 'Maybe']
     */

    const checked = input.value ? input.value.includes(option.value) : false
    return (
      <div className="flex-1" key={option.value}>
        <input
          className="absolute w-0 h-0 opacity-0 cursor-pointer"
          type="checkbox"
          name={input.name}
          id={optionId}
          value={option.value}
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.checked === true) {
              /**
               * Add `value` to `input.value[]`
               */
              input.onChange([...input.value, event.target.value])
            } else {
              /**
               * Remove `value` from `input.value[]`
               */
              input.onChange([
                ...input.value.filter((v: string) => v !== event.target.value),
              ])
            }
          }}
        />
        <label
          className="cursor-pointer flex group items-center gap-2"
          htmlFor={optionId}
        >
          <span
            className={`relative h-[18px] w-[18px] rounded border text-indigo-600 focus:ring-indigo-500 transition ease-out duration-150 ${
              checked
                ? 'border-blue-500 bg-blue-500 shadow-sm group-hover:bg-blue-400 group-hover:border-blue-400'
                : 'border-gray-200 bg-white shadow-inner group-hover:bg-gray-100'
            }`}
          >
            <BiCheck
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[17px] h-[17px] transition ease-out duration-150 ${
                checked
                  ? 'opacity-100 text-white group-hover:opacity-80'
                  : 'text-blue-500 opacity-0 grou-hover:opacity-30'
              }`}
            />
          </span>
          <span
            className={`relative transition ease-out duration-150 ${
              checked
                ? 'text-gray-800 opacity-100'
                : 'text-gray-700 opacity-70 group-hover:opacity-100'
            }`}
          >
            {option.label}
          </span>
        </label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1" id={input.name}>
      {checkboxOptions?.map(toProps).map(toComponent)}
    </div>
  )
}
