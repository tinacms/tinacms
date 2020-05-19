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

import { Decoration, EditorView, NodeView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import { Schema } from 'prosemirror-model'

export interface ImageProps {
  upload?: (files: File[]) => Promise<string[]>
  previewUrl?: (url: string) => string
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

export type NodeViews = {
  [name: string]: (
    node: Node,
    view: EditorView,
    getPos: () => number,
    decorations: Decoration[]
  ) => NodeView
} | null

export interface Command {
  (state: EditorState, ...options: any[]): void
}
