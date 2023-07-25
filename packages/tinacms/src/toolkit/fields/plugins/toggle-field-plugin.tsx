import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { Toggle } from '../components'

export const ToggleField = wrapFieldsWithMeta(Toggle)

export const ToggleFieldPlugin = {
  name: 'toggle',
  type: 'checkbox',
  Component: ToggleField,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && (typeof value === 'undefined' || value === null))
      return 'Required'
  },
}
