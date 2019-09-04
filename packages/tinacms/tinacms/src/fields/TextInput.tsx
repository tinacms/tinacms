import * as React from 'react'
import { TextField, InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import './test.css'

export const TextInput = wrapFieldsWithMeta<InputProps>(({ input }) => (
  <TextField {...input} />
))
