/**



*/

import * as React from 'react'
import { Form, Field } from '../forms'
import { useCMS, useEventSubscription } from '../react-core'
import { Field as FinalField } from 'react-final-form'
import { FieldPlugin } from './field-plugin'

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
      {fields.map((field: Field, index) => (
        <InnerField
          key={field.name}
          field={field}
          form={form}
          fieldPlugins={fieldPlugins}
          index={index}
        />
      ))}
    </FieldsGroup>
  )
}

const InnerField = ({ field, form, fieldPlugins, index }) => {
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
      // don't use the default value anymore
      // defaultValue={defaultValue}
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
              index={index}
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
