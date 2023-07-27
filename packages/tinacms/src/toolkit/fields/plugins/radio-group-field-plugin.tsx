import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { RadioGroup } from '../components'

export const RadioGroupField = wrapFieldsWithMeta(RadioGroup)

export const RadioGroupFieldPlugin = {
  name: 'radio-group',
  Component: RadioGroupField,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
