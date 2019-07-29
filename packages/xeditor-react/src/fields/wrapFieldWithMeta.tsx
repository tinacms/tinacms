import * as React from 'react'
import { FieldProps } from './fieldProps'
import { FieldInputProps } from 'react-final-form'

type InputFieldType<T> = FieldInputProps<any, HTMLElement> & T

// Wraps the Field component in labels describing the field's meta state
// Add any other fields that the Field component should expect onto the ExtraFieldProps generic type
export function wrapFieldsWithMeta<ExtraFieldProps = {}>(
  Field:
    | React.StatelessComponent<InputFieldType<ExtraFieldProps>>
    | React.ComponentClass<InputFieldType<ExtraFieldProps>>
) {
  return ({ input, meta, ...extraProps }: FieldProps & ExtraFieldProps) => (
    <>
      <div>
        <label htmlFor={name}>{extraProps.field.name}</label>
      </div>
      <Field {...input as any} {...extraProps} />
      {meta.error && <p>{meta.error}</p>}
    </>
  )
}
