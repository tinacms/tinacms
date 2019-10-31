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
import { EditorView } from 'prosemirror-view'

type Dispatch = typeof EditorView.prototype.dispatch;

export function insertImage(state: EditorState, dispatch: Dispatch | null, src: string) {
  const nodeType = state.schema.nodes["image"]
  const image = nodeType.createAndFill({ src, alt: "", title: "" })
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(image))
  }
  return true
}

export function alignImage(
  state: EditorState,
  dispatch: Dispatch | null,
  at: number,
  direction: "left" | "right" | "center" | ""
) {
  const node = state.doc.nodeAt(at)
  if (!node || node.type !== state.schema.nodes.image) return false
  const attrs = {
    ...node.attrs,
    align: node.attrs.align === direction ? null : direction,
  }

  if (dispatch) {
    dispatch((state.tr as any).setNodeMarkup(at, node.type, attrs, node.marks) as any)
  }
  return true
}

export function removeImage(state: EditorState, dispatch: Dispatch | null, at: number) {
  const from = at
  const to = from + 1
  const node = state.doc.nodeAt(from)
  if (!node || node.type != state.schema.nodes.image) return false
  if (dispatch) {
    dispatch(state.tr.delete(from, to) as any)
  }
  return true
}
