import * as React from 'react'
import { TextArea, InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

export const TextAreaInput = wrapFieldsWithMeta<InputProps>(({ input }) => (
  <TextArea {...input} />
))
export default {
  name: 'textarea',
  Component: TextAreaInput,
}
