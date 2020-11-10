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
import { ScreenPlugin } from '@tinacms/react-screens'
import {
  TextFieldPlugin,
  TextareaFieldPlugin,
  ImageFieldPlugin,
  ColorFieldPlugin,
  NumberFieldPlugin,
  ToggleFieldPlugin,
  SelectFieldPlugin,
  GroupFieldPlugin,
  GroupListFieldPlugin,
  ListFieldPlugin,
  BlocksFieldPlugin,
  TagsFieldPlugin,
} from '@tinacms/fields'
import { Form } from '@tinacms/forms'
import { Alerts, EventsToAlerts } from '@tinacms/alerts'
import { SidebarState, SidebarStateOptions } from '@tinacms/react-sidebar'
import { ToolbarStateOptions, ToolbarState } from '@tinacms/react-toolbar'
import {
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
  DateFieldPlaceholder,
} from './plugins/fields/markdown'
import { MediaManagerScreenPlugin } from './plugins/screens/media-manager-screen'
import { BaseMediaPaginator } from './components/media/pagination'

const DEFAULT_FIELDS = [
  TextFieldPlugin,
  TextareaFieldPlugin,
  ImageFieldPlugin,
  ColorFieldPlugin,
  NumberFieldPlugin,
  ToggleFieldPlugin,
  SelectFieldPlugin,
  GroupFieldPlugin,
  GroupListFieldPlugin,
  ListFieldPlugin,
  BlocksFieldPlugin,
  TagsFieldPlugin,
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
  DateFieldPlaceholder,
]

export interface TinaCMSConfig extends CMSConfig {
  sidebar?: SidebarStateOptions | boolean
  toolbar?: ToolbarStateOptions | boolean
  alerts?: EventsToAlerts
}

export class TinaCMS extends CMS {
  sidebar?: SidebarState
  toolbar?: ToolbarState
  _alerts?: Alerts

  constructor({
    sidebar,
    toolbar,
    alerts = {},
    ...config
  }: TinaCMSConfig = {}) {
    super(config)

    this.alerts.setMap({
      'media:upload:failure': () => ({
        level: 'error',
        message: 'Failed to upload file.',
      }),
      'media:delete:failure': () => ({
        level: 'error',
        message: 'Failed to delete file.',
      }),
      ...alerts,
    })

    if (sidebar) {
      const sidebarConfig = typeof sidebar === 'object' ? sidebar : undefined
      this.sidebar = new SidebarState(this.events, sidebarConfig)
    }

    if (toolbar) {
      const toolbarConfig = typeof toolbar === 'object' ? toolbar : undefined
      this.toolbar = new ToolbarState(toolbarConfig)
    }

    DEFAULT_FIELDS.forEach(field => {
      if (!this.fields.find(field.name)) {
        this.fields.add(field)
      }
    })
    this.plugins.add(MediaManagerScreenPlugin)
    if (!this.plugins.getType('media:ui').find('paginator')) {
      this.plugins.add(BaseMediaPaginator)
    }
  }

  get alerts() {
    if (!this._alerts) {
      this._alerts = new Alerts(this.events)
    }
    return this._alerts
  }

  registerApi(name: string, api: any) {
    if (api.alerts) {
      this.alerts.setMap(api.alerts)
    }
    super.registerApi(name, api)
  }

  get forms(): PluginType<Form> {
    return this.plugins.findOrCreateMap<Form & { __type: string }>('form')
  }

  get fields(): PluginType<FieldPlugin> {
    return this.plugins.findOrCreateMap('field')
  }

  get screens(): PluginType<ScreenPlugin> {
    return this.plugins.findOrCreateMap('screen')
  }
}
