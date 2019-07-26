import * as React from 'react'
import { TextField } from '@forestryio/xeditor-react-fields'

export const TextInput = ({ field, input, meta, ...props }: any) => {
  return (
    <div {...props}>
      <div>
        <label htmlFor={name}>{field.name}</label>
      </div>
      <TextField {...input} />
      {meta.error && <p>{meta.error}</p>}
    </div>
  )
}
