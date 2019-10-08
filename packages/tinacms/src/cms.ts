/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { TinaCMS } from './tina-cms'

// Screen Plugins
import { MediaView, SettingsView } from './plugins/screens'

// Field Plugins
import TextFieldPlugin from './plugins/fields/TextFieldPlugin'
import TextareaFieldPlugin from './plugins/fields/TextareaFieldPlugin'
import DateFieldPlugin from './plugins/fields/DateFieldPlugin'
import ImageFieldPlugin from './plugins/fields/ImageFieldPlugin'
import ColorFieldPlugin from './plugins/fields/ColorFieldPlugin'
import ToggleFieldPlugin from './plugins/fields/ToggleFieldPlugin'
import MarkdownFieldPlugin from './plugins/fields/MarkdownFieldPlugin'
import GroupFieldPlugin from './plugins/fields/GroupFieldPlugin'
import GroupListFieldPlugin from './plugins/fields/GroupListFieldPlugin'
import BlocksFieldPlugin from './plugins/fields/BlocksFieldPlugin'

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
cms.fields.add(GroupFieldPlugin)
cms.fields.add(GroupListFieldPlugin)
cms.fields.add(BlocksFieldPlugin)
