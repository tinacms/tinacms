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
import { padding, color, radius, font } from '@tinacms/styles'
import styled from 'styled-components'

interface SelectFieldProps {
  label?: string
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
  display: block;
  position: relative;

  select {
    display: block;
    font-family: inherit;
    max-width: 100%;
    padding: ${padding('small')};
    border-radius: ${radius('small')};
    background: ${color.grey(0)};
    font-size: ${font.size(2)};
    line-height: 1.35;
    position: relative;
    background-color: ${color.grey()};
    transition: all 85ms ease-out;
    border: 1px solid ${color.grey(2)};
    width: 100%;
    margin: 0;
    appearance: none;
    outline: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 0.7em top 50%;
    background-size: 0.65em auto;
  }
`
