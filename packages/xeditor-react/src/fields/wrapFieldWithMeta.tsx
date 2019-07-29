import * as React from 'react'
import { FieldRenderProps } from 'react-final-form'
import { Props } from './fieldProps'

export const wrapFieldsWithMeta = (Field: React.StatelessComponent<any>) => {
  return ({ field, input, meta, ...props }: Props) => (
    <div {...props}>
      <div>
        <label htmlFor={name}>{field.name}</label>
      </div>
      <Field {...input} />
      {meta.error && <p>{meta.error}</p>}
    </div>
  )
}
