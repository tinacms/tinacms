/**



*/

import * as React from 'react'

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
export const BaseTextField = ({ className = '', ...props }) => {
  return (
    <input
      type="text"
      className={`${textFieldClasses} ${
        props?.disabled ? disabledClasses : ''
      } ${className}`}
      {...props}
    />
  )
}
