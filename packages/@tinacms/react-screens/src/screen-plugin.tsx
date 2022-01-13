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

import React from 'react'
import { Plugin } from '@einsteinindustries/tinacms-core'

/**
 * Represents a Screen that should be accessible via the CMS.
 *
 * The purpose of these screens is to give a way to display information
 * about the website that is not suited to inline editing. Example use
 * cases may include:
 *
 * * User Management
 * * CI build status
 * * Website Metadata e.g. SEO
 * * Layout Configuration e.g. Menus
 */
export interface ScreenPlugin<ExtraProps = {}> extends Plugin {
  __type: 'screen'
  Component(props: ScreenComponentProps & ExtraProps): React.ReactElement
  Icon: any
  layout: 'fullscreen' | 'popup'
}

/**
 * The set of props passed to all Screen Components.
 */
export interface ScreenComponentProps {
  close(): void
  currentTab?: number
  setAllTabs?: (tabsArray: string[]) => void
}

/**
 * An options object used to create Screen Plugins.
 */
export interface ScreenOptions<ExtraProps = {}> {
  name: string
  Component: React.FC<ExtraProps & ScreenComponentProps>
  Icon: any
  layout?: ScreenPlugin['layout']
  props?: ExtraProps
}

/**
 * Creates screen plugins.
 *
 * @param Component
 * @param props
 * @param options
 */
export function createScreen<ExtraProps>({
  Component,
  props,
  ...options
}: ScreenOptions<ExtraProps>): ScreenPlugin<ExtraProps> {
  return {
    __type: 'screen',
    layout: 'popup',
    ...options,
    Component(screenProps) {
      return <Component {...screenProps} {...props} />
    },
  }
}
