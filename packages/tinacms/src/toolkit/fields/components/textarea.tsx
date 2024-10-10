import * as React from 'react'
import { getDirection } from '../field-utils'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextAreaProps extends a {
  error?: boolean
  ref?: any
}

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ ...props }, ref) => {
  return (
    <textarea
      {...props}
      className="shadow-inner text-base px-3 py-2 text-gray-600 resize-y focus:shadow-outline focus:border-blue-500 block w-full border border-gray-200 focus:text-gray-900 rounded-md"
      ref={ref}
      style={{ minHeight: '160px' }}
      dir={getDirection(props.value)}
    />
  )
})
