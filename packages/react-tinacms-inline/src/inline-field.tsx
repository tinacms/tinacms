/**

Copyright 2019 Forestry.io Inc

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
import { useContext } from 'react'
import { Field, FieldRenderProps } from 'react-final-form'
import { InlineFormState, useInlineForm } from './inline-form'
import { InlineFieldContext } from './inline-field-context'

export interface InlineFieldProps {
  name: string
  children(fieldProps: InlineFieldRenderProps): React.ReactElement
}

export interface InlineFieldRenderProps<V = any>
  extends FieldRenderProps<V>,
    InlineFormState {}

export function InlineField({ name, children }: InlineFieldProps) {
  const formState = useInlineForm()

  let fieldName = name

  const parentField = useContext(InlineFieldContext)

  if (parentField.name) {
    fieldName = `${parentField.name}.${name}`
  }

  return (
    <Field name={fieldName}>
      {fieldProps => {
        return children({
          ...fieldProps,
          ...formState,
        })
      }}
    </Field>
  )
}
