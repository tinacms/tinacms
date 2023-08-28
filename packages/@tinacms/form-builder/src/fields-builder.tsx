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
import { Form, Field } from '@einsteinindustries/tinacms-forms'
import { useCMS } from '@einsteinindustries/tinacms-react-core'
import { Field as FinalField } from 'react-final-form'
import { FieldPlugin } from './field-plugin'
import styled from 'styled-components'

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

        const parse = getProp('parse', field, plugin)
        const validate = getProp('validate', field, plugin)

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
            key={field.key ?? field.name}
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

export const FieldsGroup = styled.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 20px 20px 0 20px;
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
