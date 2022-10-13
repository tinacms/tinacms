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
import * as React from 'react'
import { Field } from '../../forms'

export interface ToggleProps {
  name: string
  input: any
  field: ToggleFieldDefinition
  disabled?: boolean
  onBlur: <T>(_event?: React.FocusEvent<T>) => void
  onChange: <T>(_event: React.ChangeEvent<T> | any) => void
  onFocus: <T>(_event?: React.FocusEvent<T>) => void
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
    <div className="flex items-center">
      {labels && <span className="text-gray-700">{labels.false}</span>}
      <div
        className="relative w-12 h-7"
        style={{ margin: labels !== null ? '0 10px' : '0' }}
      >
        <ToggleInput id={name} type="checkbox" {...input} />
        <label
          className="bg-none p-0 outline-none w-12 h-7"
          style={{
            opacity: disabled ? 0.4 : 1,
            pointerEvents: disabled ? 'none' : 'inherit',
          }}
          htmlFor={name}
          role="switch"
        >
          <div className="relative w-12 h-7 rounded-3xl bg-white pointer-events-none -ml-0.5">
            <span
              className="absolute rounded-3xl left-0.5 top-1/2 w-[22px] h-[22px]"
              style={{
                background: checked
                  ? 'var(--tina-color-primary)'
                  : 'var(--tina-color-grey-4)',
                border: `1px solid ${
                  checked
                    ? 'var(--tina-color-primary-dark)'
                    : 'var(--tina-color-grey-5)'
                }`,
                transform: `translate3d(${checked ? '20px' : '0'}, -50%, 0)`,
                transition: 'all 150ms ease-out',
                boxShadow: 'var(--tina-shadow-big)',
              }}
            />
          </div>
        </label>
      </div>
      {labels && <span className="text-gray-700">{labels.true}</span>}
    </div>
  )
}

const ToggleInput = ({ disabled, ...props }) => {
  return (
    <input
      className={`absolute left-0 top-0 w-12 h-8 opacity-0 m-0 ${
        disabled
          ? `cursor-not-allowed pointer-events-none`
          : `cursor-pointer z-20`
      }`}
      {...props}
    />
  )
}
