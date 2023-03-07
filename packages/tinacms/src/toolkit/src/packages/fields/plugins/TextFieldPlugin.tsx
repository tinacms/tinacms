/**



*/

import * as React from 'react'
import { BaseTextField, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { parse } from './textFormat'
interface ExtraProps {
  placeholder: string
  disabled?: boolean
}
export const TextField = wrapFieldsWithMeta<{}, InputProps & ExtraProps>(
  ({ input, field }) => {
    return (
      <BaseTextField
        {...input}
        disabled={field?.disabled ?? false}
        placeholder={field.placeholder}
      />
    )
  }
)

export const TextFieldPlugin = {
  name: 'text',
  Component: TextField,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
  parse,
}
