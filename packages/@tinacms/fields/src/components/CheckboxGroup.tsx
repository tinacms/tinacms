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
import { Circle, CircleCheck } from '@tinacms/icons'

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
      <CheckboxOptionWrap key={option.value}>
        <input
          type="checkbox"
          name={input.name}
          id={optionId}
          value={option.value}
          checked={checked}
          disabled={disabled}
          onChange={event => {
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
        <CheckboxOption htmlFor={optionId} checked={checked}>
          {checked === true ? <CircleCheck /> : <Circle />}
          <Label>{option.label}</Label>
        </CheckboxOption>
      </CheckboxOptionWrap>
    )
  }

  return (
    <CheckboxOptions id={input.name}>
      {checkboxOptions?.map(toProps).map(toComponent)}
    </CheckboxOptions>
  )
}

const CheckboxOptions = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 4px;
  min-height: calc(40px + 2px);
  background-color: var(--tina-color-grey-0);
  border-radius: var(--tina-radius-big);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  padding: 3px;
  box-shadow: 0 0 0 0 var(--tina-color-grey-3);
  transition: all 85ms ease-out;
  gap: 3px;
  &:hover {
    box-shadow: 0 0 0 2px var(--tina-color-grey-3);
  }
  &:focus-within,
  &:active {
    box-shadow: 0 0 0 2px var(--tina-color-primary);
  }
`

const CheckboxOptionWrap = styled.div`
  flex: 1;

  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
}
`

const CheckboxOption = styled.label<{ checked: boolean; htmlFor: string }>`
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-1);
  flex: 1;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-1);
  height: calc(40px - 6px);
  padding: 0 var(--tina-padding-small);
  transition: all 85ms ease-out;
  margin: 0;
  border: none;
  svg {
    margin-right: 5px;
  }
`

const Label = styled.span`
  position: relative;
`
