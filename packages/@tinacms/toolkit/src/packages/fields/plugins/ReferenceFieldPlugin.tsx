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

import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { parse } from './textFormat'
import * as React from 'react'
import { SelectElement } from '../components/Select'
import { useCMS } from '../../react-core'

type Option = {
  value: string
  label: string
}

interface ReferenceFieldProps {
  label?: string
  name: string
  component: string
  options: (Option | string)[]
  config: {
    query: string
  }
}

export interface SelectProps {
  name: string
  input: any
  field: ReferenceFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

const Select: React.FC<SelectProps> = ({ input, field, options }) => {
  const selectOptions = options || field.options
  const cms = useCMS()
  return (
    <SelectElement>
      <select
        id={input.name}
        {...input}
        value={null} // value is deciphered from `<option>` elements `selected` property
        onChange={async (event) => {
          const result = await cms.api.tina.request(field.config.query, {
            variables: { id: event.target.value },
          })
          input.onChange({
            changeType: 'select',
            id: result.node.id,
            data: result.node.dataJSON,
          })
        }}
      >
        {selectOptions ? (
          selectOptions
            .map(toProps)
            .map((option) => toComponent(option, input.value.id))
        ) : (
          <>
            <option>{input.value}</option>
          </>
        )}
      </select>
    </SelectElement>
  )
}
function toProps(option: Option | string): Option {
  if (typeof option === 'object') return option
  return { value: option, label: option }
}

function toComponent(option: Option, currentValue) {
  return (
    <option
      key={option.value}
      value={option.value}
      selected={currentValue === option.value}
    >
      {option.label}
    </option>
  )
}

export const ReferenceField = wrapFieldsWithMeta(Select)

export const ReferenceFieldPlugin = {
  name: 'reference',
  type: 'select',
  Component: ReferenceField,
  parse,
}
