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

import { EditorState } from "prosemirror-state"
import { liftTarget } from "prosemirror-transform"
import { NodeType } from "prosemirror-model"
import { EditorView } from 'prosemirror-view'

type Dispatch = typeof EditorView.prototype.dispatch;

export function liftBlockquote(state: EditorState, dispatch: Dispatch | null) {
  const range = getRangeForType(state, state.schema.nodes.blockquote)
  if (!range) return false

  const target = liftTarget(range)
  if (!target) return false

  if (dispatch) {
    dispatch(state.tr.lift(range, target)) //dont lift lists
  }
  return true
}

const getRangeForType = (state: EditorState, listType: NodeType) => {
  const { $from, $to } = state.selection
  const range = $from.blockRange($to, node => {
    return node.type == listType
  })
  return range
}
