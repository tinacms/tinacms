import * as React from 'react'
import { Form, Field } from '@forestryio/cms'
import { useCMS } from '@forestryio/cms-react'
import {
  Form as FinalForm,
  Field as FinalField,
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
  fields: Field[]
}

export function FieldsBuilder({ fields }: FieldsBuilderProps) {
  let cms = useCMS()
  return (
    <>
      {fields.map(field => {
        return (
          <FinalField name={field.name} key={field.name}>
            {fieldProps => {
              if (typeof field.component !== 'string') {
                return <field.component {...fieldProps} field={field} />
              }

              let plugin = cms.forms.getFieldPlugin(field.component)
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
