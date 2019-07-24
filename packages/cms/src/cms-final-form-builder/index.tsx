import * as React from 'react'
import { FieldPlugin, Form } from '../cms-forms'
import { Form as FinalForm, Field as FinalField, Field } from 'react-final-form'
import { useCMS } from '../cms-react'

export interface FormBuilderProps {
  form: Form
}

export function FormBuilder({ form }: FormBuilderProps) {
  let cms = useCMS()
  return (
    <FinalForm
      onSubmit={form.onSubmit as any}
      initialValues={form.initialValues}
    >
      {formProps => {
        return form.fields.map(field => {
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
        })
      }}
    </FinalForm>
  )
}
