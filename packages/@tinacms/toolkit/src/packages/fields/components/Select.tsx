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
  input: any
  field: SelectFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

export const selectFieldClasses =
  'shadow block w-full text-base cursor-pointer border-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'

export const Select: React.FC<SelectProps> = ({ input, field, options }) => {
  const selectOptions = options || field.options
  return (
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
