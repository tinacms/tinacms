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
import { Form, Field } from '../forms'
import { useCMS, useEventSubscription } from '../react-core'
import { Field as FinalField } from 'react-final-form'
import { FieldPlugin } from './field-plugin'
import styled, { css } from 'styled-components'

export interface FieldsBuilderProps {
  form: Form
  fields: Field[]
  padding?: boolean
}

export function FieldsBuilder({
  form,
  fields,
  padding = false,
}: FieldsBuilderProps) {
  const cms = useCMS()

  // re-build fields when new field plugins are registered
  const [fieldPlugins, setFieldPlugins] = React.useState<FieldPlugin[]>([])
  const updateFieldPlugins = React.useCallback(() => {
    const fieldPlugins = cms.plugins.getType<FieldPlugin>('field').all()
    setFieldPlugins(fieldPlugins)
  }, [setFieldPlugins])
  React.useEffect(() => updateFieldPlugins(), [])
  useEventSubscription('plugin:add:field', () => updateFieldPlugins(), [])

  return (
    // @ts-ignore FIXME twind
    <FieldsGroup padding={padding}>
      {fields.map((field: Field) => (
        <InnerField
          key={field.name}
          field={field}
          form={form}
          fieldPlugins={fieldPlugins}
        />
      ))}
    </FieldsGroup>
  )
}

const InnerField = ({ field, form, fieldPlugins }) => {
  /**
   * We double-render form builders for some reason which reults in useMemo not working here
   */
  React.useEffect(() => {
    form.mutators.setFieldData(field.name, {
      tinaField: field,
    })
  }, [form, field])

  if (field.component === null) return null

  const plugin = fieldPlugins.find(
    (plugin: FieldPlugin) => plugin.name === field.component
  )

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
      {(fieldProps) => {
        if (typeof field.component !== 'string' && field.component !== null) {
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
}

export const FieldsGroup = ({
  padding,
  children,
}: {
  padding?: boolean
  children?: any | any[]
}) => {
  return (
    <div
      className={`relative block w-full h-full whitespace-nowrap overflow-x-visible ${
        padding ? `pb-5` : ``
      }`}
    >
      {children}
    </div>
  )
}

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
