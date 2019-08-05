import { CMS } from '@forestryio/cms'
import {
  TextInput,
  TextAreaInput,
  ColorPickerField,
} from '@forestryio/xeditor'

export * from './markdownRemark'

export let cms = new CMS()

cms.forms.addFieldPlugin({ name: 'text', Component: TextInput })
cms.forms.addFieldPlugin({ name: 'textarea', Component: TextAreaInput })
cms.forms.addFieldPlugin({
  name: 'color',
  Component: ColorPickerField,
})
