import * as React from 'react'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface PasswordFieldProps extends a {
  error?: boolean
  ref?: any
}

export const passwordFieldClasses =
  'shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md'
const disabledClasses = 'opacity-50 pointer-events-none cursor-not-allowed'
const errorClasses =
  'border-red-500 focus:border-red-500 focus:shadow-outline-red'
export const BasePasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ className, disabled, error, ...rest }, ref) => {
  return (
    <input
      ref={ref}
      type="password"
      className={`${passwordFieldClasses} ${
        disabled ? disabledClasses : ''
      } ${className} ${error ? errorClasses : ''}`}
      {...rest}
    />
  )
})
