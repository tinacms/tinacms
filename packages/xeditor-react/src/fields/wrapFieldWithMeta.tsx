import * as React from 'react'
import { FieldProps } from './fieldProps'

type InputFieldType<ExtraFieldProps> = FieldProps & ExtraFieldProps

// Wraps the Field component in labels describing the field's meta state
// Add any other fields that the Field component should expect onto the ExtraFieldProps generic type
export function wrapFieldsWithMeta<ExtraFieldProps = {}>(
  Field:
    | React.StatelessComponent<InputFieldType<ExtraFieldProps>>
    | React.ComponentClass<InputFieldType<ExtraFieldProps>>
) {
  return (props: InputFieldType<ExtraFieldProps>) => (
    <>
      <div>
        <label htmlFor={name}>{props.field.name}</label>
      </div>
      <Field {...props} />
      {props.meta.error && <p>{props.meta.error}</p>}
    </>
  )
}
