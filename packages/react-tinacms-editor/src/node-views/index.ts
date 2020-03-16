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

import { Node } from 'prosemirror-model'
import { Decoration, EditorView, NodeView } from 'prosemirror-view'

import { CodeBlockView } from './CodeBlockView'
import { ImageView } from './ImageView'

export type NodeViews = {
  [name: string]: (
    node: Node,
    view: EditorView,
    getPos: () => number,
    decorations: Decoration[]
  ) => NodeView
} | null

export const nodeViews: NodeViews = {
  code_block(node, view, getPos) {
    return new CodeBlockView(node, view, getPos)
  },
  image(node, view, getPos) {
    return new ImageView(node, view, getPos)
  },
}
