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

import { FC } from 'react'
import styled from 'styled-components'
import * as React from 'react'
import { color, radius } from '@tinacms/styles'

export interface ToggleProps {
  name: string
  onBlur: <T>(event?: React.FocusEvent<T>) => void
  onChange: <T>(event: React.ChangeEvent<T> | any) => void
  onFocus: <T>(event?: React.FocusEvent<T>) => void
  value: any
  input: any
  checked?: boolean
  disabled?: boolean
}

export const Toggle: FC<ToggleProps> = props => {
  const checked = !!(props.input.value || props.input.checked)
  return (
    <ToggleElement>
      <ToggleInput id={props.name} type="checkbox" {...props.input} />
      <ToggleLabel htmlFor={props.name} role="switch" disabled={props.disabled}>
        <ToggleSwitch checked={checked}>
          <span></span>
        </ToggleSwitch>
      </ToggleLabel>
    </ToggleElement>
  )
}

const ToggleElement = styled.div`
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  margin: 0;
`

const ToggleLabel = styled.label<{ disabled?: boolean }>`
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
  border-radius: ${radius()};
  background-color: white;
  border: 1px solid ${color.grey(2)};
  pointer-events: none;
  margin-left: -2px;
  span {
    position: absolute;
    border-radius: ${radius()};
    left: 2px;
    top: 50%;
    width: calc(28px - 6px);
    height: calc(28px - 6px);
    background: ${p => (p.checked ? color.primary() : color.grey(3))};
    transform: translate3d(${p => (p.checked ? '20px' : '0')}, -50%, 0);
    transition: all 150ms ease-out;
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
`
