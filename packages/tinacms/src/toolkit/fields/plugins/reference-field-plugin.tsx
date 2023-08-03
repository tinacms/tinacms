import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { Reference } from '../components/reference'
import { parse } from './text-format'

export const ReferenceField = wrapFieldsWithMeta(Reference)

export const ReferenceFieldPlugin = {
  name: 'reference',
  type: 'reference',
  Component: ReferenceField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
