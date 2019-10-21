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
import { Form, Field } from '@tinacms/core'
import { useCMS } from 'react-tinacms'
import {
  Form as FinalForm,
  Field as FinalField,
  FormRenderProps,
} from 'react-final-form'
import { FC } from 'react'
import { FieldPlugin } from './field-plugin'
import styled from 'styled-components'

export interface FormBuilderProps {
  form: Form
  children(props: FormRenderProps<string>): any
}

const FF: any = FinalForm

export const FormBuilder: FC<FormBuilderProps> = ({ form, children }) => {
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    setI(i => i + 1)
  }, [form])
  /**
   * > Why is a `key` being set when this isn't an array?
   *
   * `FinalForm` does not update when given a new `form` prop.
   *
   * We can force `FinalForm` to update by setting the `key` to
   * the name of the form. When the name changes React will
   * treat it as a new instance of `FinalForm`, destroying the
   * old `FinalForm` componentt and create a new one.
   *
   * See: https://github.com/final-form/react-final-form/blob/master/src/ReactFinalForm.js#L68-L72
   */
  return (
    <FF form={form.finalForm} key={`${i}: ${form.id}`}>
      {children}
    </FF>
  )
}

export interface FieldsBuilderProps {
  form: Form
  fields: Field[]
}

export function FieldsBuilder({ form, fields }: FieldsBuilderProps) {
  const cms = useCMS()
  return (
    <FieldsGroup>
      {fields.map((field: Field) => {
        if (field.component === null) return null

        const plugin = cms.plugins
          .findOrCreateMap<FieldPlugin>('field')
          .find(field.component as string)

        let type: string | undefined
        if (plugin && plugin.type) {
          type = plugin.type
        }

        let parse = getProp('parse', field, plugin)
        let validate = getProp('validate', field, plugin)

        let format = field.format

        if (!format && plugin && plugin.format) {
          format = plugin.format
        }

        let defaultValue = field.defaultValue

        if (!parse && plugin && plugin.defaultValue) {
          defaultValue = plugin.defaultValue
        }

        return (
          <FinalField
            name={field.name}
            key={field.name}
            type={type}
            parse={
              parse
                ? (value: any, name: string) => parse!(value, name, field)
                : undefined
            }
            format={
              format
                ? (value: any, name: string) => format!(value, name, field)
                : undefined
            }
            defaultValue={defaultValue}
            validate={(value, values, meta) => {
              if (validate) {
                return validate(value, values, meta, field)
              }
            }}
          >
            {fieldProps => {
              if (
                typeof field.component !== 'string' &&
                field.component !== null
              ) {
                return (
                  <field.component
                    {...fieldProps}
                    form={form.finalForm}
                    tinaForm={form}
                    field={field}
                  />
                )
              }

              if (plugin) {
                return (
                  <plugin.Component
                    {...fieldProps}
                    form={form.finalForm}
                    tinaForm={form}
                    field={field}
                  />
                )
              }

              return <p>Unrecognized field type</p>
            }}
          </FinalField>
        )
      })}
    </FieldsGroup>
  )
}

const FieldsGroup = styled.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 1.25rem 1.25rem 0 1.25rem;
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: auto !important;
`

/**
 *
 * @param name
 * @param field
 * @param plugin
 */
function getProp(
  name: keyof FieldPlugin & keyof Field,
  field: Field,
  plugin?: FieldPlugin
): any {
  let prop = field[name]
  if (!prop && plugin && plugin[name]) {
    prop = plugin[name]
  }
  return prop
}
