/**



*/

import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { CheckboxGroup } from '../components'

export const CheckboxGroupField = wrapFieldsWithMeta(CheckboxGroup)

export const CheckboxGroupFieldPlugin = {
  name: 'checkbox-group',
  Component: CheckboxGroupField,
}
