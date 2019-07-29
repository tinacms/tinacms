import * as React from 'react'
import { FieldsBuilder } from '@forestryio/cms-final-form-builder'

export const Group = ({ field, input, meta, ...props }: any) => {
  let fields = field.fields || []
  return (
    <div {...props}>
      <div>
        <label htmlFor={name}>{field.name}</label>
      </div>
      {meta.error && <p>{meta.error}</p>}
      <FieldsBuilder fields={fields} />
    </div>
  )
}
