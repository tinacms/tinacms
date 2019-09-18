import * as React from 'react'
import { useState, useContext } from 'react'
import { Form } from '@tinacms/core'
import { FormBuilder } from './final-form-builder'
import { Field } from 'react-final-form'

interface RenderProps {
  isEditing: boolean
  setIsEditing(nextVal: boolean): any
}
export interface Props {
  form: Form
  children({ isEditing, setIsEditing }: RenderProps): any // TODO: Fix return type
}

const EditingContext = React.createContext(false)

export function TinaForm({ form, children }: Props) {
  let [isEditing, setIsEditing] = useState(false)

  if (!form) {
    return (
      <EditingContext.Provider value={isEditing}>
        {children({ isEditing, setIsEditing })}
      </EditingContext.Provider>
    )
  }

  return (
    <EditingContext.Provider value={isEditing}>
      <FormBuilder form={form}>
        {() => {
          return children({ isEditing, setIsEditing })
        }}
      </FormBuilder>
    </EditingContext.Provider>
  )
}

interface TinaFieldsProps {
  name: string
  type?: string
  Component: any
  children: any
}

export function TinaField({
  Component,
  children,
  ...fieldProps
}: TinaFieldsProps) {
  let isEditing = useContext(EditingContext)
  if (!isEditing) return children || null
  return (
    <Field {...fieldProps}>
      {({ input, meta }) => {
        return <Component input={input} meta={meta} />
      }}
    </Field>
  )
}
