import * as React from 'react'
import { Form, CMS } from '@tinacms/core'
import { useCMS } from '@tinacms/react-tinacms'
import {
  FormProps,
  Form as FinalForm,
  Field as FinalField,
  FormSpy,
  FormRenderProps,
} from 'react-final-form'
import { FC } from 'react'

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
    <FF form={form.finalForm} key={form.name}>
      {children}
    </FF>
  )
}

export interface FieldsBuilderProps {
  form: Form
}

export function FieldsBuilder({ form }: FieldsBuilderProps) {
  let cms = useCMS()
  return (
    <>
      {form.fields.map(field => {
        let plugin = cms.fields.find(field.component as string)
        let type: string | undefined
        if (plugin && plugin.type) {
          type = plugin.type
        }
        return (
          <FinalField
            name={field.name}
            key={field.name}
            type={type}
            validate={(value, values, meta) => {
              if (plugin && plugin.validate) {
                return plugin.validate(value, values, meta, field)
              }
            }}
          >
            {fieldProps => {
              if (typeof field.component !== 'string') {
                return <field.component {...fieldProps} field={field} />
              }

              if (plugin) {
                return <plugin.Component {...fieldProps} field={field} />
              }

              return <p>Unrecognized field type</p>
            }}
          </FinalField>
        )
      })}
    </>
  )
}
