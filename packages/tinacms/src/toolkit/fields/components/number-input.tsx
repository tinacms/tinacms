import * as React from 'react'
import { Input } from './input'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface NumberProps extends a {
  step?: string | number
}

export const NumberInput: React.FC<NumberProps> = ({
  onChange,
  value,
  step,
}) => (
  <Input
    type="number"
    step={step}
    value={value}
    onChange={(event) => {
      const inputValue = event.target.value
      const newValue = inputValue === '' ? undefined : inputValue
      if (onChange) {
        const syntheticEvent = {
          ...event,
          target: {
            ...event.target,
            value: newValue,
          },
        }
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
      }
    }}
  />
)
