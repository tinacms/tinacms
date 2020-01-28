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
import { Schema } from 'prosemirror-model'

export interface SchemaNodePlugin extends Plugin {
  __type: 'wysiwyg:schema:node'
  name: string
  node: any // TODO
}

export interface SchemaMarkPlugin extends Plugin {
  __type: 'wysiwyg:schema:mark'
  name: string
  mark: any // TODO
}

export interface KeymapPlugin {
  __type: 'wysiwyg:keymap'
  name: string
  command(schema: Schema): any // TODO Command
  ifMark?: string
  ifNode?: string
  ifNodes?: string[]
  ifMac?: boolean
  unlessMac?: boolean
  onCondition?(schema: Schema): boolean
}

function byType<P extends Plugin>(__type: string) {
  return (plugin: Plugin) => plugin.__type === __type
}

export function findPlugins<P extends Plugin>(type: string, plugins: Plugin[]) {
  return plugins.filter(byType(type)) as P[]
}
