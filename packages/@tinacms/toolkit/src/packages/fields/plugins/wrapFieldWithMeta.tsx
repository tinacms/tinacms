/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import { FieldProps } from './fieldProps'
import { useEvent } from '../../react-core/use-cms-event'
import { FieldHoverEvent, FieldFocusEvent } from '../field-events'

export type InputFieldType<ExtraFieldProps, InputProps> =
  FieldProps<InputProps> & ExtraFieldProps

// Wraps the Field component in labels describing the field's meta state
// Add any other fields that the Field component should expect onto the ExtraFieldProps generic type
export function wrapFieldsWithMeta<ExtraFieldProps = {}, InputProps = {}>(
  Field:
    | React.StatelessComponent<InputFieldType<ExtraFieldProps, InputProps>>
    | React.ComponentClass<InputFieldType<ExtraFieldProps, InputProps>>
) {
  return (props: InputFieldType<ExtraFieldProps, InputProps>) => (
    <FieldMeta
      name={props.input.name}
      label={props.field.label}
      description={props.field.description}
      error={props.meta.error}
    >
      <Field {...props} />
    </FieldMeta>
  )
}

interface FieldMetaProps extends React.HTMLAttributes<HTMLElement> {
  name: string
  children: any
  label?: string
  description?: string
  error?: string
  margin?: boolean
}

export const FieldMeta = ({
  name,
  label,
  description,
  error,
  margin = true,
  children,
  ...props
}: FieldMetaProps) => {
  const { dispatch: setHoveredField } = useEvent<FieldHoverEvent>('field:hover')
  const { dispatch: setFocusedField } = useEvent<FieldFocusEvent>('field:focus')
  return (
    <FieldWrapper
      margin={margin}
      onMouseOver={() => setHoveredField({ fieldName: name })}
      onMouseOut={() => setHoveredField({ fieldName: null })}
      onClick={() => setFocusedField({ fieldName: name })}
      {...props}
    >
      <FieldLabel name={name}>
        {label || name}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldLabel>
      {children}
      {/*
      FIXME: when a object field has a sub-field with a validation (eg. required)
             AND the object field is not pristine (eg. you've touched other fields)
             the error will be an object (eg {mySubField: "required"}).
     */}
      {error && typeof error === 'string' && <FieldError>{error}</FieldError>}
    </FieldWrapper>
  )
}

export const FieldWrapper = ({
  margin,
  children,
  ...props
}: {
  margin: boolean
  children: React.ReactNode
} & Partial<React.ComponentPropsWithoutRef<'div'>>) => {
  return (
    <div className={`relative ${margin ? `mb-5 last:mb-0` : ``}`} {...props}>
      {children}
    </div>
  )
}

export interface FieldLabel extends React.HTMLAttributes<HTMLLabelElement> {
  children?: any | any[]
  className?: string
  name?: string
}

export const FieldLabel = ({
  children,
  className,
  name,
  ...props
}: FieldLabel) => {
  return (
    <label
      htmlFor={name}
      className={`block font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}

export const FieldDescription = ({
  children,
  className,
  ...props
}: {
  children?: any | any[]
  className?: string
}) => {
  return (
    <span
      className={`block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0 ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export const FieldError = ({
  children,
  className,
  ...props
}: {
  children?: any | any[]
  className?: string
}) => {
  return (
    <span
      className={`block font-sans text-xs font-normal text-red-500 pt-2 whitespace-normal m-0 ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
