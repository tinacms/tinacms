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
import { Circle, CircleCheck } from '../../icons'

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
          className="flex items-center text-[13px] flex-grow rounded-3xl text-blue-500 font-normal cursor-pointer h-[34px] px-3 transition-all duration-100 ease-out m-0 border-0"
          htmlFor={optionId}
        >
          {checked === true ? (
            <CircleCheck className="w-5 h-auto text-black mr-[5px]" />
          ) : (
            <Circle className="w-5 h-auto text-black mr-[5px]" />
          )}
          <span className="relative">{option.label}</span>
        </label>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col min-h-[42px] bg-white rounded-3xl shadow-none  text-blue-500 p-[3px] transition-all duration-100 ease-out gap-[3px] [&:not(:active)]:[&:not(:focus-within)]:hover:shadow-[0_0_0_2px_#e1ddec] focus-within:shadow-[0_0_0_2px_#0084ff] active:shadow-[0_0_0_2px_#0084ff]"
      id={input.name}
    >
      {checkboxOptions?.map(toProps).map(toComponent)}
    </div>
  )
}
