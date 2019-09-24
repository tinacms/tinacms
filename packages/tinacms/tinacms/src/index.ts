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
import TextFieldPlugin from './plugins/fields/TextFieldPlugin'
import TextareaFieldPlugin from './plugins/fields/TextareaFieldPlugin'
import DateFieldPlugin from './plugins/fields/DateFieldPlugin'
import ImageFieldPlugin from './plugins/fields/ImageFieldPlugin'
import ColorFieldPlugin from './plugins/fields/ColorFieldPlugin'
import ToggleFieldPlugin from './plugins/fields/ToggleFieldPlugin'
import MarkdownFieldPlugin from './plugins/fields/MarkdownFieldPlugin'

cms.fields.add(TextFieldPlugin)
cms.fields.add(TextareaFieldPlugin)
cms.fields.add(DateFieldPlugin)
cms.fields.add(ImageFieldPlugin)
cms.fields.add(ColorFieldPlugin)
cms.fields.add(ToggleFieldPlugin)
cms.fields.add(MarkdownFieldPlugin)
