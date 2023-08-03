import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { CheckboxGroup } from '../components'

export const CheckboxGroupField = wrapFieldsWithMeta(CheckboxGroup)

export const CheckboxGroupFieldPlugin = {
  name: 'checkbox-group',
  Component: CheckboxGroupField,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && (typeof value === 'undefined' || value === null))
      return 'Required'
  },
}
