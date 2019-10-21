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

import { CMS, PluginType } from '@tinacms/core'
import { FieldPlugin } from '@tinacms/form-builder'
import { ScreenPlugin } from './plugins/screen-plugin'
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
import { MediaView, SettingsView } from './plugins/screens'

export class TinaCMS extends CMS {
  constructor() {
    super()
    this.screens.add(MediaView)
    this.screens.add(SettingsView)
    this.fields.add(TextFieldPlugin)
    this.fields.add(TextareaFieldPlugin)
    this.fields.add(DateFieldPlugin)
    this.fields.add(ImageFieldPlugin)
    this.fields.add(ColorFieldPlugin)
    this.fields.add(ToggleFieldPlugin)
    this.fields.add(MarkdownFieldPlugin)
    this.fields.add(GroupFieldPlugin)
    this.fields.add(GroupListFieldPlugin)
    this.fields.add(BlocksFieldPlugin)
  }
  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }
}
