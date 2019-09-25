import * as React from 'react'
import { TextArea, InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

export const TextareaField = wrapFieldsWithMeta<InputProps>(({ input }) => (
  <TextArea {...input} />
))
export default {
  name: 'textarea',
  Component: TextareaField,
}
