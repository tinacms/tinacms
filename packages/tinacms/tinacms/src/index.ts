export * from './sidebarProvider'
export * from './modalProvider'
export * from './fields'
export * from './Tina'

export { ActionButton } from './components/ActionsMenu'

import {
  TextInput,
  TextAreaInput,
  ColorPickerField,
  ToggleField,
  DateInput,
  Markdown,
} from './fields'
import { MediaView, SettingsView } from './components/FormView'
import { CMS, Plugin, Field } from '@tinacms/core'
import { ImageUploadInput } from './fields/ImageUploadInput'

export const cms = new CMS()

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

export interface AddContentPlugin extends Plugin {
  __type: 'content-button'
  onSubmit(value: string, cms: CMS): Promise<void> | void
  fields: Field[]
}
