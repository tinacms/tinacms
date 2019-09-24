import * as React from 'react'
import { TextField, InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

export const TextInput = wrapFieldsWithMeta<InputProps>(({ input }) => (
  <TextField {...input} />
))

export default {
  name: 'text',
  Component: TextInput,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
