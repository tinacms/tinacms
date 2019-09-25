import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { Toggle } from '@tinacms/fields'

export const ToggleField = wrapFieldsWithMeta(Toggle)

export default {
  name: 'toggle',
  type: 'checkbox',
  Component: ToggleField,
}
