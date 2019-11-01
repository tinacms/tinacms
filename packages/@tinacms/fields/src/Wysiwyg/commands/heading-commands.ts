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

import { EditorState, Selection } from 'prosemirror-state'
import { NodeType, Node } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'

type Dispatch = typeof EditorView.prototype.dispatch;

export function deleteEmptyHeading(state: EditorState, dispatch: Dispatch | null) {
  const { $cursor } = state.selection as any
  if (!$cursor) return false
  const node = state.doc.nodeAt(Math.max($cursor.pos - 1, 0))
  if (!node) return false
  if (node.type != state.schema.nodes.heading) return false
  if (node.textContent.length) return false
  if (dispatch) {
    dispatch(
      state.tr
        // Replace the entire heading with an empty paragraph
        .replaceRangeWith(
          $cursor.pos - 1,
          $cursor.pos + node.nodeSize - 1,
          state.schema.nodes.paragraph.create()
        )
        // Set the seleciton to be at the start of the paragram
        .setSelection(Selection.near(state.doc.resolve($cursor.pos - 1)))
    )
  }
  return true
}

export function toggleHeader(
  nodeType: NodeType,
  attrs: any,
  fallBackNodeType: NodeType,
  fallbackAttrs: any
) {
  return function(state: EditorState, dispatch: Dispatch | null) {
    const { from, to } = state.selection
    let firstTextblock: Node | null = null
    let firstPos = -1
    // Find the first textblock
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (firstTextblock) return false
      if (node.isTextblock) {
        firstTextblock = node
        firstPos = pos
      }
      return true
    })

    if (!firstTextblock || firstPos < 0) return false

    const $firstPos = state.doc.resolve(firstPos)
    const index = $firstPos.index()

    const setAsParagraph = state.selection.$head.parent.attrs.level == attrs.level
    const nextNodeType = setAsParagraph ? fallBackNodeType : nodeType
    const nextAttrs = setAsParagraph ? fallbackAttrs : attrs

    if (!$firstPos.parent.canReplaceWith(index, index + 1, nextNodeType))
      return false

    if (dispatch) {
      dispatch(
        (state.tr.setBlockType(
          from,
          to,
          nextNodeType,
          nextAttrs
        ) as any).scrollIntoView()
      )
    }

    return true
  }
}
