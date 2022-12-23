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
import {
  Field as FinalField,
  Form as FinalForm,
  FieldInputProps,
  FieldMetaState,
  useField,
  UseFieldConfig,
} from 'react-final-form'
import { FieldPlugin } from './field-plugin'
import { SchemaField } from '@tinacms/schema-tools/src/types'
import { String } from '../fields/plugins/core/string'
import { Wrap } from '../fields'
import { Object } from '../fields/plugins/core/object'

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

const InnerField = ({
  field,
  form,
  fieldPlugins,
}: {
  field: Field
  form: Form
  fieldPlugins: FieldPlugin[]
}) => {
  // TODO: deprecate global field plugins
  const plugin = fieldPlugins.find(
    (plugin: FieldPlugin) => plugin.name === field.ui?.component
  )

  let type: string | undefined
  if (plugin && plugin.type) {
    type = plugin.type
  }

  const fieldConfig: UseFieldConfig<unknown, unknown> = {}

  const parse = field.ui?.parse || plugin?.parse
  if (parse) {
    fieldConfig['parse'] = (value, name) => parse!(value, name, field)
  }
  const validate = field.ui?.validate || plugin?.validate
  if (validate) {
    fieldConfig['validate'] = (value, values, meta) =>
      validate!(value, values, meta, field)
  }
  let format = field.ui?.format
  if (!format && plugin && plugin.format) {
    format = plugin.format
  }
  if (format) {
    fieldConfig['format'] = (value, name) => format(value, name, field)
  }
  if (field.type === 'string') {
    if (field.options) {
      fieldConfig['type'] = field.list ? 'checkbox' : 'radio'
    }
  }
  const { input, meta } = useField(field.name, fieldConfig)

  const props: TinaFieldProps = {
    input,
    meta,
    field,
    tinaForm: form,
    form: form.finalForm,
  }

  return <TinaField {...props} />
}

export type TinaFieldProps = {
  input: FieldInputProps<unknown, HTMLElement>
  meta: FieldMetaState<unknown>
  field: SchemaField<true>
  tinaForm: Form
  form: typeof FinalForm
}
const TinaField = (props: TinaFieldProps) => {
  switch (props.field.type) {
    case 'string': {
      return <String {...props} />
    }
    case 'object': {
      return <Object {...props} />
    }
  }
  return <p>Unrecognized field type</p>
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
