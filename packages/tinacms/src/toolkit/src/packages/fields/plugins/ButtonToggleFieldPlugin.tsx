/**



*/

import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { ButtonToggle } from '../components'

export const ButtonToggleField = wrapFieldsWithMeta(ButtonToggle)

export const ButtonToggleFieldPlugin = {
  name: 'button-toggle',
  Component: ButtonToggleField,
}
