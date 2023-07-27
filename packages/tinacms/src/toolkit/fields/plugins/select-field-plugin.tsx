import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { Select } from '../components'
import { parse } from './text-format'

// @ts-ignore
export const SelectField = wrapFieldsWithMeta(Select)

export const SelectFieldPlugin = {
  name: 'select',
  type: 'select',
  Component: SelectField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
