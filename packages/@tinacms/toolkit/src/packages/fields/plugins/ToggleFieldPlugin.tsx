/**



*/

import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { Toggle } from '../components'

export const ToggleField = wrapFieldsWithMeta(Toggle)

export const ToggleFieldPlugin = {
  name: 'toggle',
  type: 'checkbox',
  Component: ToggleField,
}
