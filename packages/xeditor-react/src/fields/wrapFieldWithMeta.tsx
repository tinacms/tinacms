import * as React from 'react'
import { Props } from './fieldProps'
import { FieldInputProps } from 'react-final-form'

type FieldType<T> = FieldInputProps<any, HTMLElement> & T

export function wrapFieldsWithMeta<ExtraFieldProps = {}>(
  Field:
    | React.StatelessComponent<FieldType<ExtraFieldProps>>
    | React.ComponentClass<FieldType<ExtraFieldProps>>
) {
  return ({ field, input, meta, extraProps }: Props<ExtraFieldProps>) => (
    <>
      <div>
        <label htmlFor={name}>{field.name}</label>
      </div>
      <Field {...input} {...extraProps} />
      {meta.error && <p>{meta.error}</p>}
    </>
  )
}
