/**

Copyright 2019 Forestry.io Inc

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

interface SelectFieldProps {
  label: string
  name: string
  component: string
  options: string[]
}

export interface SelectProps {
  name: string
  input: any
  field: SelectFieldProps
  disabled?: boolean
  options?: string[]
}

export const Select: React.FC<SelectProps> = ({ input, field, options }) => {
  const selectOptions = options || field.options

  return (
    <SelectElement>
      <select
        id={input.name}
        value={input.value}
        onChange={input.onChange}
        {...input}
      >
        {selectOptions ? (
          selectOptions.map(option => (
            <option value={option} key={option}>
              {option}
            </option>
          ))
        ) : (
          <option>{input.value}</option>
        )}
      </select>
    </SelectElement>
  )
}

const SelectElement = styled.div`
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  margin: 0;
`
