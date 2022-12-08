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

import {
  CMS,
  CMSConfig,
  CMSEvent,
  MediaUploadOptions,
  PluginType,
} from './packages/core'
import { FieldPlugin } from './packages/form-builder'
import { ScreenPlugin } from './packages/react-screens'
import {
  TextFieldPlugin,
  TextareaFieldPlugin,
  ImageFieldPlugin,
  ColorFieldPlugin,
  NumberFieldPlugin,
  MdxFieldPlugin,
  ToggleFieldPlugin,
  SelectFieldPlugin,
  RadioGroupFieldPlugin,
  GroupFieldPlugin,
  GroupListFieldPlugin,
  ListFieldPlugin,
  BlocksFieldPlugin,
  TagsFieldPlugin,
  DateFieldPlugin,
  CheckboxGroupFieldPlugin,
  ReferenceFieldPlugin,
  ButtonToggleFieldPlugin,
} from './packages/fields'
import { Form } from './packages/forms'
import { Alerts, EventsToAlerts } from './packages/alerts'
import { SidebarState, SidebarStateOptions } from './packages/react-sidebar'
import {
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
} from './plugins/fields/markdown'
import { MediaManagerScreenPlugin } from './plugins/screens/media-manager-screen'
import { createCloudConfig } from './packages/react-cloud-config'

const DEFAULT_FIELDS = [
  TextFieldPlugin,
  TextareaFieldPlugin,
  ImageFieldPlugin,
  ColorFieldPlugin,
  NumberFieldPlugin,
  ToggleFieldPlugin,
  SelectFieldPlugin,
  MdxFieldPlugin,
  RadioGroupFieldPlugin,
  GroupFieldPlugin,
  GroupListFieldPlugin,
  ListFieldPlugin,
  BlocksFieldPlugin,
  TagsFieldPlugin,
  DateFieldPlugin,
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
  CheckboxGroupFieldPlugin,
  ReferenceFieldPlugin,
  ButtonToggleFieldPlugin,
]

export interface TinaCMSConfig extends CMSConfig {
  sidebar?: SidebarStateOptions | boolean
  alerts?: EventsToAlerts
  isLocalClient?: boolean
  clientId?: string
}

export class TinaCMS extends CMS {
  sidebar?: SidebarState
  _alerts?: Alerts

  constructor({
    sidebar,
    alerts = {},
    isLocalClient,
    clientId,
    ...config
  }: TinaCMSConfig = {}) {
    super(config)

    this.alerts.setMap({
      'media:upload:failure': (
        event: CMSEvent & { error: Error; uploaded: MediaUploadOptions[] }
      ) => {
        return {
          error: event.error,
          level: 'error',
          message: `Failed to upload file(s) ${event?.uploaded
            .map((x) => x.file.name)
            .join(', ')}. See error message: \n\n ${event?.error.toString()}`,
        }
      },
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

    DEFAULT_FIELDS.forEach((field) => {
      if (!this.fields.find(field.name)) {
        this.fields.add(field)
      }
    })
    this.plugins.add(MediaManagerScreenPlugin)
    if (isLocalClient !== true) {
      if (clientId) {
        this.plugins.add(
          createCloudConfig({
            name: 'Project Config',
            link: {
              text: 'Project Config',
              href: `https://app.tina.io/projects/${clientId}/0`,
            },
          })
        )
        this.plugins.add(
          createCloudConfig({
            name: 'User Management',
            link: {
              text: 'User Management',
              href: `https://app.tina.io/projects/${clientId}/3`,
            },
          })
        )
      } else {
        this.plugins.add(
          createCloudConfig({
            name: 'Setup Cloud',
            text: 'No project configured, set one up ',
            link: {
              text: 'here',
              href: `https://app.tina.io`,
            },
          })
        )
      }
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
