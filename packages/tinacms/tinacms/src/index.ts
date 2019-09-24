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

import { MediaView, SettingsView } from './components/FormView'
import { TinaCMS } from './tina-cms'

export const cms = new TinaCMS()

// View Plugins
cms.screens.add(MediaView)
cms.screens.add(SettingsView)

// Field Plugins
import TextFieldPlugin from './plugins/fields/TextInput'
import TextareaPlugin from './plugins/fields/TextAreaInput'
import DateFieldPlugin from './plugins/fields/DateInput'
import ImageFieldPlugin from './plugins/fields/ImageUploadInput'
import ColorPickerFieldPlugin from './plugins/fields/ColorPickerField'
import ToggleFieldPlugin from './plugins/fields/ToggleField'
import MarkdownFieldPlugin from './plugins/fields/Markdown'

cms.fields.add(TextFieldPlugin)
cms.fields.add(TextareaPlugin)
cms.fields.add(DateFieldPlugin)
cms.fields.add(ImageFieldPlugin)
cms.fields.add(ColorPickerFieldPlugin)
cms.fields.add(ToggleFieldPlugin)
cms.fields.add(MarkdownFieldPlugin)
