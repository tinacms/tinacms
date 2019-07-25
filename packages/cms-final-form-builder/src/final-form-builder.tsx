import * as React from 'react'
import { Form, CMS } from '@forestryio/cms'
import { useCMS } from '@forestryio/cms-react'
import {
  Form as FinalForm,
  Field as FinalField,
  FormSpy,
} from 'react-final-form'

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
        return (
          <>
            <FormSpy
              subscription={{ values: true }}
              onChange={({ values }) => form.onChange(values)}
            />
            <FieldsBuilder cms={cms} form={form} />
          </>
        )
      }}
    </FinalForm>
  )
}

export interface FieldsBuilderProps {
  cms: CMS
  form: Form
}
export function FieldsBuilder({ cms, form }: FieldsBuilderProps) {
  return (
    <>
      {form.fields.map(field => {
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
