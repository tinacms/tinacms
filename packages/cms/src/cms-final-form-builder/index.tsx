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
    <FinalForm onSubmit={form.onSubmit as any}>
      {form.fields.map(field => {
        return (
          <FinalField name={field.name}>
            {props => {
              let plugin: FieldPlugin | null = null
              if (typeof field.component === 'function') {
                let C = field.component
                return <C {...props} field={field} />
              } else {
                plugin = cms.forms.getFieldPlugin(field.name)
                if (!plugin) return
              }
              return <plugin.Component {...props} field={field} />
            }}
          </FinalField>
        )
      })}
    </FinalForm>
  )
}
