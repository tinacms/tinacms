/**



*/

import * as React from 'react'
import { useActiveFieldCallback } from '../use-active-field'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextAreaProps extends a {
  error?: boolean
  ref?: any
}

export const TextArea = ({ ...props }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  useActiveFieldCallback(props.name, () => {
    if (ref.current) {
      const el = ref.current
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  })
  return (
    <textarea
      ref={ref}
      className="shadow-inner text-base px-3 py-2 text-gray-600 resize-y focus:shadow-outline focus:border-blue-500 block w-full border border-gray-200 focus:text-gray-900 rounded-md"
      {...props}
      style={{ minHeight: '160px' }}
    />
  )
}
