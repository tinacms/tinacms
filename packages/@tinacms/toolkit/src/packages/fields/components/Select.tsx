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
import styled from 'styled-components'
import { MdKeyboardArrowDown } from 'react-icons/md'

type Option = {
  value: string
  label: string
}

interface SelectFieldProps {
  label?: string
  name: string
  component: string
  options: (Option | string)[]
}

export interface SelectProps {
  name: string
  input: React.SelectHTMLAttributes<HTMLSelectElement>
  field?: SelectFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

export const selectFieldClasses =
  'shadow appearance-none bg-white text-gray-600 block pl-3 pr-7 py-2 truncate w-full text-base cursor-pointer border border-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'

export const Select: React.FC<SelectProps> = ({ input, field, options }) => {
  const selectOptions = options || field.options
  return (
    <div className="relative group">
      <select
        id={input.name}
        value={input.value}
        onChange={input.onChange}
        className={selectFieldClasses}
        {...input}
      >
        {selectOptions ? (
          selectOptions.map(toProps).map(toComponent)
        ) : (
          <option>{input.value}</option>
        )}
      </select>
      <MdKeyboardArrowDown className="absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out pointer-events-none" />
    </div>
  )
}
function toProps(option: Option | string): Option {
  if (typeof option === 'object') return option
  return { value: option, label: option }
}

function toComponent(option: Option) {
  return (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  )
}
