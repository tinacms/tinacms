import * as React from 'react'
import { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { Form } from '@toolkit/forms'
import { FormLegacy } from './form-legacy'
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
  const [isEditing, setIsEditing] = useState(false)

  if (!form) {
    return (
      <EditingContext.Provider value={isEditing}>
        {children({ isEditing, setIsEditing })}
      </EditingContext.Provider>
    )
  }

  return (
    <EditingContext.Provider value={isEditing}>
      <FormLegacy form={form}>
        {() => {
          return children({ isEditing, setIsEditing })
        }}
      </FormLegacy>
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
  const isEditing = useContext(EditingContext)
  if (!isEditing) return children || null

  return (
    <Field {...fieldProps}>
      {({ input, meta }) => {
        return <Component input={input} meta={meta} {...fieldProps} />
      }}
    </Field>
  )
}

TinaField.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  Component: PropTypes.any.isRequired,
  children: PropTypes.any,
}
