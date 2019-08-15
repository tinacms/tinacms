export * from './sidebarProvider'
export * from './fields'
import {
  TextInput,
  TextAreaInput,
  ColorPickerField,
  ToggleField,
} from './fields'
import { CMS } from '@forestryio/cms'
import { FormsView, DummyView } from './views/FormView'

export const cms = new CMS()

// View Plugins
cms.plugins.add(FormsView)
cms.plugins.add(DummyView)

// Field Plugins
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
