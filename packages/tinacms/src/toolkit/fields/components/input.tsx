import * as React from 'react'
import { textFieldClasses } from './text-field'

export interface InputProps {
  error?: boolean
  small?: boolean
  placeholder?: string
  step?: string | number
}

export const Input = ({ ...props }) => {
  return <input className={textFieldClasses} {...props} />
}
