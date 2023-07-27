import { FC } from 'react'
import * as React from 'react'
import { Field } from '@toolkit/forms'

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
    <div className="flex gap-2 items-center">
      {labels && (
        <span
          className={`text-sm ${
            !checked ? 'text-blue-500 font-bold' : 'text-gray-300'
          }`}
        >
          {labels.false}
        </span>
      )}
      <div className="relative w-12 h-7">
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
          <div className="relative w-[48px] h-7 rounded-3xl bg-white shadow-inner border border-gray-200 pointer-events-none -ml-0.5">
            <span
              className={`absolute rounded-3xl left-0.5 top-1/2 w-[22px] h-[22px] shadow border transition-all ease-out duration-150 ${
                checked
                  ? 'bg-blue-500 border-blue-600'
                  : 'bg-gray-250 border-gray-300'
              }`}
              style={{
                transform: `translate3d(${checked ? '20px' : '0'}, -50%, 0)`,
              }}
            />
          </div>
        </label>
      </div>
      {labels && (
        <span
          className={`text-sm ${
            checked ? 'text-blue-500 font-bold' : 'text-gray-300'
          }`}
        >
          {labels.true}
        </span>
      )}
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
