import * as React from 'react'
import { useState } from 'react'
import { Form } from '@tinacms/core'
import { FormBuilder } from '@tinacms/form-builder'
import { Field } from 'react-final-form'

interface RenderProps {
  isEditing: boolean
  setIsEditing(nextVal: boolean): any
}
export interface Props {
  form: Form
  children({ isEditing, setIsEditing }: RenderProps): any // TODO: Fix return type
}

export function TinaForm({ form, children }: Props) {
  let [isEditing, setIsEditing] = useState(false)
  if (!form) return children({ isEditing, setIsEditing })
  return (
    <FormBuilder form={form}>
      {() => {
        return children({ isEditing, setIsEditing })
      }}
    </FormBuilder>
  )
}

interface TinaFieldsProps {
  name: string
  Component: any
}
export function TinaFields({ name, Component }: TinaFieldsProps) {
  return (
    <Field name={name}>
      {({ input, meta }) => {
        return <Component input={input} meta={meta} />
      }}
    </Field>
  )
}
