import * as React from 'react'
import { Form, Field } from '@tinacms/core'
import { useCMS } from '@tinacms/react-tinacms'
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
    <FF form={form.finalForm} key={form.id}>
      {children}
    </FF>
  )
}

export interface FieldsBuilderProps {
  form: Form
  fields: Field[]
}

export function FieldsBuilder({ form, fields }: FieldsBuilderProps) {
  let cms = useCMS()
  return (
    <FieldsGroup>
      {fields.map((field: Field) => {
        if (field.component === null) return null

        let plugin = cms.plugins
          .findOrCreateMap<FieldPlugin>('field')
          .find(field.component as string)

        let type: string | undefined
        if (plugin && plugin.type) {
          type = plugin.type
        }

        let parse = field.parse

        if (!parse && plugin && plugin.parse) {
          parse = plugin.parse
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
            parse={parse}
            format={field.format}
            defaultValue={defaultValue}
            validate={(value, values, meta) => {
              if (plugin && plugin.validate) {
                return plugin.validate(value, values, meta, field)
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
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 100%;
  padding: 1.25rem 1.25rem 0 1.25rem;
`
