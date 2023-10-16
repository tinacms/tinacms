/**

 Copyright 2021 Forestry.io Holdings, Inc.

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


import { CMS, CMSConfig, PluginType } from '@einsteinindustries/tinacms-core'
import { FieldPlugin } from '@einsteinindustries/tinacms-form-builder'
import { ScreenPlugin } from '@einsteinindustries/tinacms-react-screens'
import {
  TextFieldPlugin,
  TextareaFieldPlugin,
  ImageFieldPlugin,
  ColorFieldPlugin,
  NumberFieldPlugin,
  ToggleFieldPlugin,
  SelectFieldPlugin,
  RadioGroupFieldPlugin,
  GroupFieldPlugin,
  GroupListFieldPlugin,
  ListFieldPlugin,
  BlocksFieldPlugin,
  TagsFieldPlugin,
  DateFieldPlugin,
} from '@einsteinindustries/tinacms-fields'
import { Form } from '@einsteinindustries/tinacms-forms'
import { Alerts, EventsToAlerts } from '@einsteinindustries/tinacms-alerts'
import {
  SidebarState,
  SidebarStateOptions,
} from '@einsteinindustries/tinacms-react-sidebar'
import {
  ToolbarStateOptions,
  ToolbarState,
} from '@einsteinindustries/tinacms-react-toolbar'
import {
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
} from './plugins/fields/markdown'
import { createMediaManagerScreenPlugin } from './plugins/screens/media-manager-screen'

const DEFAULT_FIELDS = [
  TextFieldPlugin,
  TextareaFieldPlugin,
  ImageFieldPlugin,
  ColorFieldPlugin,
  NumberFieldPlugin,
  ToggleFieldPlugin,
  SelectFieldPlugin,
  RadioGroupFieldPlugin,
  GroupFieldPlugin,
  GroupListFieldPlugin,
  ListFieldPlugin,
  BlocksFieldPlugin,
  TagsFieldPlugin,
  DateFieldPlugin,
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
]

export interface TinaCMSConfig extends CMSConfig {
  sidebar?: SidebarStateOptions | boolean
  toolbar?: ToolbarStateOptions | boolean
  alerts?: EventsToAlerts
  namespace?: string
}

export class TinaCMS extends CMS {
  sidebar?: SidebarState
  toolbar?: ToolbarState
  _alerts?: Alerts
  namespace?: string

  constructor({
    sidebar,
    toolbar,
    alerts = {},
    namespace,
    ...config
  }: TinaCMSConfig = {}) {
    super(config)

    this.namespace = namespace

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

    const mediaManagerScreenPlugin = createMediaManagerScreenPlugin(this.namespace)
    this.plugins.add(mediaManagerScreenPlugin)
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
