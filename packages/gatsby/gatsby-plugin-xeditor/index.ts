import { CMS } from '@forestryio/cms'
import {
  TextInput,
  TextAreaInput,
  ColorPickerField,
  ToggleField,
} from '@forestryio/xeditor'

export let cms = new CMS()

cms.forms.addFieldPlugin({
  name: 'text',
  Component: TextInput,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
})
cms.forms.addFieldPlugin({ name: 'textarea', Component: TextAreaInput })
cms.forms.addFieldPlugin({
  name: 'color',
  Component: ColorPickerField,
})
cms.forms.addFieldPlugin({
  name: 'toggle',
  type: 'checkbox',
  Component: ToggleField,
})
