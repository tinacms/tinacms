import * as React from 'react'
import { TextArea, InputProps } from '@forestryio/xeditor-fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

export const TextAreaInput = wrapFieldsWithMeta<InputProps>(({ input }) => (
  <TextArea {...input} />
))
