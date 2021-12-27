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

import { MarkType, ResolvedPos } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { isMarkPresent } from '../../../utils'

type Dispatch = typeof EditorView.prototype.dispatch

declare let window: any

function markExtend($cursor: ResolvedPos, markType: MarkType) {
  window.$cursor = $cursor
  let startIndex = $cursor.index()
  let endIndex = $cursor.indexAfter()

  // Clicked outside edge of tag.
  if (startIndex === $cursor.parent.childCount) {
    startIndex--
    endIndex--
  }

  const mark = markType.isInSet($cursor.parent.child(startIndex).marks)
  if (!mark) return
  // TODO: This might be a problem.
  const hasMark = (index: number) =>
    mark!.isInSet($cursor.parent.child(index).marks)

  while (startIndex > 0 && hasMark(startIndex - 1)) {
    startIndex--
  }
  while (endIndex < $cursor.parent.childCount && hasMark(endIndex)) {
    endIndex++
  }

  let startPos = $cursor.start()
  let endPos = startPos

  for (let i = 0; i < endIndex; i++) {
    const size = $cursor.parent.child(i).nodeSize
    if (i < startIndex) startPos += size
    endPos += size
  }

  return { from: startPos, to: endPos, mark }
}

export function unmountAnchorForm(view: EditorView) {
  const { dispatch, state } = view
  dispatch(state.tr.setMeta('show_anchor_toolbar', false))
}

/**
 * Finds the Link currently being edited and sets it's attributes.
 *
 * @param {EditorState} state
 * @param {(tr: Transaction) => void} dispatch
 * @param {Object} attrs
 */
export function updateAnchorBeingEdited(
  state: EditorState,
  dispatch: Dispatch | null,
  attrs: {id: string, name: string}
) {
  if (dispatch) {
    const { selection, schema, tr } = state
    const mark = markExtend(selection.$anchor, schema.marks.anchor)
    // we want name and id in the a tag
    attrs.id = attrs.name
    if (mark) {
      tr.addMark(mark.from, mark.to, schema.marks.anchor.create(attrs))
    }
    tr.setMeta('show_anchor_toolbar', false)
    dispatch(tr)
  }
  return true
}

export function removeAnchorBeingEdited(
  state: EditorState,
  dispatch: Dispatch | null
) {
  if (dispatch) {
    const { selection, schema, tr } = state
    const mark = markExtend(selection.$anchor, schema.marks.anchor)
    if (mark) {
      tr.removeMark(mark.from, mark.to, mark.mark)
    }
    tr.setMeta('show_anchor_toolbar', false)
    dispatch(tr)
  }
  return true
}

export const openAnchorPopup = (state: EditorState, dispatch: Dispatch) => {
  const { schema, selection } = state
  const { marks } = schema
  if (selection.empty && !isMarkPresent(state, marks.anchor)) return false

  const tr = state.tr.setMeta('show_anchor_toolbar', true)
  if (!isMarkPresent(state, marks.anchor)) {
    console.log(marks.anchor)
    const { $to, $from } = selection
    tr.addMark(
      $from.pos,
      $to.pos,
      marks.anchor.create({
        name: '',
        id: '',
      })
    )
  }
  return dispatch(tr)
}
