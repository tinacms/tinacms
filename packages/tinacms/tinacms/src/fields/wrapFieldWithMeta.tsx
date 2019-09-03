import * as React from 'react'
import { FieldProps } from './fieldProps'
import styled from 'styled-components'

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
      <FieldWrapper>
        <FieldLabel htmlFor={name}>
          {props.field.label || props.field.name}
        </FieldLabel>
        <Field {...props} />
        {props.meta.error && 
          <FieldError>{props.meta.error}</FieldError>
        }
      </FieldWrapper>
    </>
  )
}

// Styling
const FieldWrapper = styled.div`
  margin-bottom: 1.5rem;
`

const FieldLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #333;
  margin-bottom: 0.5rem;
`

const FieldError = styled.span`
  display: block;
  color: red;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: 500;
`