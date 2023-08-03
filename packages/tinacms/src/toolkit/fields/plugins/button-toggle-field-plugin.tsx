import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { ButtonToggle } from '../components'

export const ButtonToggleField = wrapFieldsWithMeta(ButtonToggle)

export const ButtonToggleFieldPlugin = {
  name: 'button-toggle',
  Component: ButtonToggleField,
}
