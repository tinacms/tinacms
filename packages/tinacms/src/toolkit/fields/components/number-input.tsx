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
}) => <Input type="number" step={step} value={value} onChange={onChange} />
