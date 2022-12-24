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
import { Form, Field, FormApi } from '../forms'
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
import { SchemaField } from '@tinacms/schema-tools'
import { String } from '../fields/plugins/core/string'
import { Object } from '../fields/plugins/core/object'
import { getPath, State } from './FormBuilder'
import { IoMdClose } from 'react-icons/io'

export interface FieldsBuilderProps {
  form: Form
  state: State
  setActiveFields: (fieldName: string) => void
  padding?: boolean
}

export function FieldsBuilder({
  form,
  state,
  setActiveFields,
  padding = false,
}: FieldsBuilderProps) {
  const prefix = getPath(state.depth)
  const fields = state.fields
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
    <div className="min-h-full bg-gray-50">
      {state.depth.length > 0 && (
        <button
          className={`group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm border-gray-100 px-6 -mt-px`}
          onClick={() => {
            const excludeLast = state.depth.slice(0, -1)
            const fieldName = excludeLast
              .map((item) =>
                isNaN(item.index) ? item.name : `${item.name}.${item.index}`
              )
              .join('.')
            setActiveFields(fieldName)
          }}
          tabIndex={-1}
        >
          <div className="flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto">
            {state.depth[state.depth.length - 1].name}
            <IoMdClose className="h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" />
          </div>
        </button>
      )}
      <div className="w-full flex justify-center pt-8 px-6 pb-2">
        <div className="w-full max-w-form">
          <FieldsGroup padding={padding}>
            {fields.map((field: Field) => (
              <InnerField
                setActiveFields={setActiveFields}
                key={field.name}
                prefix={prefix}
                field={field}
                state={state}
                form={form}
                fieldPlugins={fieldPlugins}
              />
            ))}
          </FieldsGroup>
        </div>
      </div>
    </div>
  )
}

const InnerField = ({
  field,
  form,
  prefix,
  setActiveFields,
  state,
  fieldPlugins,
}: {
  field: Field
  form: Form
  prefix: string
  state: State
  setActiveFields: (fields: string) => void
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
  const { input, meta } = useField(
    `${prefix ? `${prefix}.` : ''}${field.name}`,
    fieldConfig
  )

  const props: TinaFieldProps = {
    input,
    meta,
    field,
    tinaForm: form,
    form: form.finalForm,
    state,
    setActiveFields,
  }

  return <TinaField {...props} setActiveFields={setActiveFields} />
}

export type TinaFieldProps = {
  input: FieldInputProps<unknown, HTMLElement>
  meta: FieldMetaState<unknown>
  field: SchemaField
  tinaForm: Form
  setActiveFields: (fields: string) => void
  state: State
  form: FormApi
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
