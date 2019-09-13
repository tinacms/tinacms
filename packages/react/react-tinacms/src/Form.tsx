import * as React from 'react'
import { useState, useContext } from 'react'
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
  Component: any
  children: any
}

export function TinaField({ name, Component, children }: TinaFieldsProps) {
  let isEditing = useContext(EditingContext)
  if (!isEditing) return children
  return (
    <Field name={name}>
      {({ input, meta }) => {
        return <Component input={input} meta={meta} />
      }}
    </Field>
  )
}
