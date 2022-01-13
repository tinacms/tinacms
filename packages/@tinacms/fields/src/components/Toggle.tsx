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

import { FC } from 'react'
import styled from 'styled-components'
import * as React from 'react'
import { Field } from '@einsteinindustries/tinacms-forms'

export interface ToggleProps {
  name: string
  input: any
  field: ToggleFieldDefinition
  disabled?: boolean
  onBlur: <T>(event?: React.FocusEvent<T>) => void
  onChange: <T>(event: React.ChangeEvent<T> | any) => void
  onFocus: <T>(event?: React.FocusEvent<T>) => void
}

interface ToggleFieldDefinition extends Field {
  component: 'toggle'
  toggleLabels?: boolean | FieldLabels
}

type FieldLabels = { true: string; false: string }

export const Toggle: FC<ToggleProps> = ({
  input,
  field,
  name,
  disabled = false,
}) => {
  const checked = !!(input.value || input.checked)
  let labels: null | FieldLabels = null

  if (field.toggleLabels) {
    const fieldLabels =
      typeof field.toggleLabels === 'object' &&
      'true' in field.toggleLabels &&
      'false' in field.toggleLabels &&
      field.toggleLabels

    labels = {
      true: fieldLabels ? fieldLabels['true'] : 'Yes',
      false: fieldLabels ? fieldLabels['false'] : 'No',
    }
  }

  return (
    <ToggleWrap>
      {labels && <span>{labels.false}</span>}
      <ToggleElement hasToggleLabels={labels !== null}>
        <ToggleInput id={name} type="checkbox" {...input} />
        <ToggleLabel htmlFor={name} role="switch" disabled={disabled}>
          <ToggleSwitch checked={checked}>
            <span></span>
          </ToggleSwitch>
        </ToggleLabel>
      </ToggleElement>
      {labels && <span>{labels.true}</span>}
    </ToggleWrap>
  )
}

const ToggleWrap = styled.div`
  display: flex;
  align-items: center;

  > span {
    color: var(--tina-color-grey-8);
  }
`

const ToggleElement = styled.div<{ hasToggleLabels?: boolean }>`
  position: relative;
  width: 48px;
  height: 28px;
  margin: ${props => (props.hasToggleLabels ? '0 10px' : '0')};
`

const ToggleLabel = styled.label<{
  disabled?: boolean
}>`
  background: none;
  color: inherit;
  padding: 0;
  opacity: ${props => (props.disabled ? '0.4' : '1')};
  outline: none;
  width: 48px;
  height: 28px;
  pointer-events: ${props => (props.disabled ? 'none' : 'inherit')};
`

const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: var(--tina-radius-big);
  background-color: white;
  border: 1px solid var(--tina-color-grey-2);
  pointer-events: none;
  margin-left: -2px;
  span {
    position: absolute;
    border-radius: var(--tina-radius-big);
    left: 2px;
    top: 50%;
    width: calc(28px - 6px);
    height: calc(28px - 6px);
    background: ${p =>
      p.checked ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-4)'};
    border: 1px solid
      ${p =>
        p.checked
          ? 'var(--tina-color-primary-dark)'
          : 'var(--tina-color-grey-5)'};
    transform: translate3d(${p => (p.checked ? '20px' : '0')}, -50%, 0);
    transition: all 150ms ease-out;
    box-shadow: var(--tina-shadow-big);
  }
`

const ToggleInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 28px;
  opacity: 0;
  margin: 0;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  pointer-events: auto;

  &:hover {
    + ${ToggleLabel} ${ToggleSwitch} {
      box-shadow: 0 0 0 2px var(--tina-color-grey-3);
    }
  }

  &:focus {
    + ${ToggleLabel} ${ToggleSwitch} {
      box-shadow: 0 0 0 2px var(--tina-color-primary);
    }
  }
`
