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
import { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { Form } from '@einsteinindustries/tinacms-forms'
import { FormLegacy } from './FormLegacy'
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
