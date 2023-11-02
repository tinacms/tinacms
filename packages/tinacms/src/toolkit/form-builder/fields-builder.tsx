import * as React from 'react'
import { Form, Field } from '@toolkit/forms'
import { useCMS, useEventSubscription } from '@toolkit/react-core'
import { Field as FinalField } from 'react-final-form'
import { FieldPlugin } from './field-plugin'

export interface FieldsBuilderProps {
  form: Form
  activeFieldName?: string
  fields: Field[]
  padding?: boolean
}

export function FieldsBuilder({
  form,
  fields,
  activeFieldName,
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
      {fields.map((field: Field, index) => {
        return (
          <InnerField
            key={field.name}
            field={field}
            activeFieldName={activeFieldName}
            form={form}
            fieldPlugins={fieldPlugins}
            index={index}
          />
        )
      })}
    </FieldsGroup>
  )
}

const InnerField = ({ field, form, fieldPlugins, index, activeFieldName }) => {
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

  let isActiveField = field.name === activeFieldName
  // TODO: this handles focusing on the tag element when one
  // of it's items is the activeField (categories.2) but not
  // for when the items are displayed with the ListFieldPlugin
  // It also doesn't handle radio/checkbox focus
  // @ts-ignore field types don't know about list and type
  if (field.list && field.type === 'string') {
    if (activeFieldName) {
      const activeFieldNameArray = activeFieldName.split('.')
      const activeFieldNameWithoutIndex = activeFieldNameArray
        .slice(0, activeFieldNameArray.length - 1)
        .join('.')
      if (field.name === activeFieldNameWithoutIndex) {
        isActiveField = true
      }
    }
  }

  return (
    <FinalField
      name={field.name}
      key={field.name}
      isEqual={(a, b) => isEqual(field, a, b)}
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
              field={{ ...field, experimental_focusIntent: isActiveField }}
            />
          )
        }

        if (plugin) {
          return (
            <plugin.Component
              {...fieldProps}
              experimental_focusIntent={isActiveField}
              form={form.finalForm}
              tinaForm={form}
              field={{ ...field, experimental_focusIntent: isActiveField }}
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

/**
 * Since rich-text values are objects the default comparison always returns `false`
 * There's also a Slate plugin which adds "id" fields to each node for copy/paste
 * behavior, so we ignore those within the `JSON.stringify` function. Defaults to `a === b`
 *
 * https://final-form.org/docs/final-form/types/FieldConfig#isequal
 */
const isEqual = (field, a, b) => {
  const replacer = (key, value) => {
    if (key === 'id') {
      return undefined
    }
    return value
  }

  if (field.type === 'rich-text') {
    return JSON.stringify(a, replacer) === JSON.stringify(b, replacer)
  }

  return a === b
}
