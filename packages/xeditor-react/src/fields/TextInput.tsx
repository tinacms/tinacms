import * as React from 'react'
import { TextField } from '@forestryio/xeditor-react-fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

export const TextInput = wrapFieldsWithMeta(props => <TextField {...props} />)
