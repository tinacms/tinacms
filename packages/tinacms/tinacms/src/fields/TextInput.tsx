import * as React from 'react'
import { TextField, InputProps } from '@tinacms/xeditor-fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

export const TextInput = wrapFieldsWithMeta<InputProps>(({ input }) => (
  <TextField {...input} />
))
