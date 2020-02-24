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

import { Plugin } from '@tinacms/core'
import React from 'react'

export interface ScreenPlugin extends Plugin {
  __type: 'screen'
  Component: any
  Icon: any
  layout: 'fullscreen' | 'popup'
}

export interface ScreenOptions<T = {}> {
  name: string
  Component: React.FC<T>
  Icon: any
  layout?: ScreenPlugin['layout']
  props?: T
}

export function createScreen({
  Component,
  props,
  ...options
}: ScreenOptions): ScreenPlugin {
  return {
    __type: 'screen',
    layout: 'popup',
    ...options,
    Component(screenProps: any) {
      return <Component {...screenProps} {...props} />
    },
  }
}
