import * as React from 'react'
import { getDirection } from '../field-utils'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextFieldProps extends a {
  error?: boolean
  ref?: any
}

export const textFieldClasses =
  'shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md'
const disabledClasses = 'opacity-50 pointer-events-none cursor-not-allowed'
export const BaseTextField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, disabled, ...rest }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      className={`${textFieldClasses} ${
        disabled ? disabledClasses : ''
      } ${className}`}
      dir={getDirection(rest.value)}
      {...rest}
    />
  )
})
