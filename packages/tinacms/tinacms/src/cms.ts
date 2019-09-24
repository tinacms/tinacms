import { MediaView, SettingsView } from './components/FormView'
import { TinaCMS } from './tina-cms'

import TextFieldPlugin from './plugins/fields/TextFieldPlugin'
import TextareaFieldPlugin from './plugins/fields/TextareaFieldPlugin'
import DateFieldPlugin from './plugins/fields/DateFieldPlugin'
import ImageFieldPlugin from './plugins/fields/ImageFieldPlugin'
import ColorFieldPlugin from './plugins/fields/ColorFieldPlugin'
import ToggleFieldPlugin from './plugins/fields/ToggleFieldPlugin'
import MarkdownFieldPlugin from './plugins/fields/MarkdownFieldPlugin'

export const cms = new TinaCMS()

cms.screens.add(MediaView)
cms.screens.add(SettingsView)

cms.fields.add(TextFieldPlugin)
cms.fields.add(TextareaFieldPlugin)
cms.fields.add(DateFieldPlugin)
cms.fields.add(ImageFieldPlugin)
cms.fields.add(ColorFieldPlugin)
cms.fields.add(ToggleFieldPlugin)
cms.fields.add(MarkdownFieldPlugin)
