import * as React from 'react'
import { TextField } from '@forestryio/xeditor-react-fields'

export const TextInput = ({ field, input, meta, ...props }: any) => {
  return (
    <div {...props}>
      <label htmlFor={name}>{field.name}</label>
      <TextField {...input} />
      {meta.error && <p>{meta.error}</p>}
    </div>
  )
}
