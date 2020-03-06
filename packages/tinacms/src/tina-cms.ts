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

import { CMS, CMSConfig, PluginType } from '@tinacms/core'
import { FieldPlugin } from '@tinacms/form-builder'
import { ScreenPlugin } from './plugins/screen-plugin'
import TextFieldPlugin from './plugins/fields/TextFieldPlugin'
import TextareaFieldPlugin from './plugins/fields/TextareaFieldPlugin'
import DateFieldPlugin from './plugins/fields/DateFieldPlugin'
import ImageFieldPlugin from './plugins/fields/ImageFieldPlugin'
import ColorFieldPlugin from './plugins/fields/ColorFieldPlugin'
import NumberFieldPlugin from './plugins/fields/NumberFieldPlugin'
import ToggleFieldPlugin from './plugins/fields/ToggleFieldPlugin'
import SelectFieldPlugin from './plugins/fields/SelectFieldPlugin'
import MarkdownFieldPlugin from './plugins/fields/MarkdownFieldPlugin'
import GroupFieldPlugin from './plugins/fields/GroupFieldPlugin'
import GroupListFieldPlugin from './plugins/fields/GroupListFieldPlugin'
import BlocksFieldPlugin from './plugins/fields/BlocksFieldPlugin'
import HtmlFieldPlugin from './plugins/fields/HtmlFieldPlugin'
import { Form } from '@tinacms/forms'
import { MediaManager, MediaStore, MediaUploadOptions } from './media'
import { Theme } from '@tinacms/styles'
import { Alerts } from './tina-cms/alerts'
import { watch, Subscribable } from 'babas'

export declare type SidebarPosition = 'fixed' | 'float' | 'displace' | 'overlay'

export interface TinaCMSConfig extends CMSConfig {
  sidebar?: SidebarStateOptions
}

export class TinaCMS extends CMS {
  sidebar: Subscribable<SidebarState>
  media = new MediaManager(new DummyMediaStore())
  alerts = new Alerts()

  constructor({ sidebar, ...config }: TinaCMSConfig) {
    super(config)

    this.sidebar = watch<SidebarState>({
      hidden: false,
      isOpen: false,
      position: 'displace',
      ...sidebar,
      buttons: {
        save: 'Save',
        reset: 'Reset',
        ...(sidebar?.buttons || {}),
      },
    })
    this.fields.add(TextFieldPlugin)
    this.fields.add(TextareaFieldPlugin)
    this.fields.add(DateFieldPlugin)
    this.fields.add(ImageFieldPlugin)
    this.fields.add(ColorFieldPlugin)
    this.fields.add(NumberFieldPlugin)
    this.fields.add(ToggleFieldPlugin)
    this.fields.add(SelectFieldPlugin)
    this.fields.add(MarkdownFieldPlugin)
    this.fields.add(HtmlFieldPlugin)
    this.fields.add(GroupFieldPlugin)
    this.fields.add(GroupListFieldPlugin)
    this.fields.add(BlocksFieldPlugin)
  }

  get forms() {
    return this.plugins.findOrCreateMap<Form & { __type: string }>('form')
  }

  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }
}

export interface SidebarState {
  buttons: SidebarButtons
  hidden: boolean
  isOpen: boolean
  position: SidebarPosition
  theme?: Theme
}

export type SidebarStateOptions = Partial<SidebarState>

export interface SidebarButtons {
  save: string
  reset: string
}

class DummyMediaStore implements MediaStore {
  accept = '*'
  async persist(files: MediaUploadOptions[]) {
    alert('UPLOADING FILES')
    console.log(files)
    return files.map(({ directory, file }) => ({
      directory,
      filename: file.name,
    }))
  }
}
