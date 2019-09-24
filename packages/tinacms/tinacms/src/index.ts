// Components
export * from './components/Tina'
export * from './components/SidebarProvider'
export * from './components/ModalProvider'
export * from './plugins/fields'

// React
export * from './hooks/use-tina'

// Plugins
export * from './plugins/create-content-form-plugin'
export * from './plugins/screen-plugin'

export { ActionButton } from './components/ActionsMenu'

import {
  TextInput,
  TextAreaInput,
  ColorPickerField,
  ToggleField,
  DateInput,
  Markdown,
} from './plugins/fields'
import { MediaView, SettingsView } from './components/FormView'
import { ImageUploadInput } from './plugins/fields/ImageUploadInput'
import { TinaCMS } from './tina-cms'

export const cms = new TinaCMS()

// View Plugins
cms.screens.add(MediaView)
cms.screens.add(SettingsView)

// Field Plugins
cms.fields.add({
  name: 'text',
  Component: TextInput,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
})

cms.fields.add({
  name: 'date',
  Component: DateInput,
  parse(date: any) {
    if (typeof date === 'string') return date
    return date.toDate()
  },
})

cms.fields.add({
  name: 'image',
  Component: ImageUploadInput,
})

cms.fields.add({
  name: 'textarea',
  Component: TextAreaInput,
})

cms.fields.add({
  name: 'color',
  Component: ColorPickerField,
})

cms.fields.add({
  name: 'toggle',
  type: 'checkbox',
  Component: ToggleField,
})

cms.fields.add({
  name: 'markdown',
  Component: Markdown,
})
