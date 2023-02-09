import * as React from 'react'
import { TextArea, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { parse } from './textFormat'

export const TextareaField = wrapFieldsWithMeta<{ input: InputProps }>(
  ({ input }) => <TextArea {...input} />
)
export const TextareaFieldPlugin = {
  name: 'textarea',
  Component: TextareaField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
