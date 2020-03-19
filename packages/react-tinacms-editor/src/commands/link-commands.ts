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

import { MarkType, ResolvedPos } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

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

export function insertLinkToFile(
  state: EditorState,
  dispatch: Dispatch | null,
  url: string
) {
  if (dispatch) {
    url = url || ''
    const filenamePath = url.split('/')
    const filename =
      decodeURI(filenamePath[filenamePath.length - 1]) || 'Download File'
    const attrs = { title: filename, href: url }
    const schema = state.schema
    const node = schema.text(attrs.title, [schema.marks.link.create(attrs)])
    dispatch(state.tr.replaceSelectionWith(node, false))
  }
  return true
}

export function unmountLinkForm(view: EditorView) {
  const { dispatch, state } = view
  dispatch(state.tr.setMeta('show_link_toolbar', false))
}

/**
 * Finds the Link currently being edited and sets it's attributes.
 *
 * @param {EditorState} state
 * @param {(tr: Transaction) => void} dispatch
 * @param {Object} attrs
 */
export function updateLinkBeingEdited(
  state: EditorState,
  dispatch: Dispatch | null,
  attrs: object
) {
  if (dispatch) {
    const { selection, schema, tr } = state
    const mark = markExtend(selection.$anchor, schema.marks.link)
    if (mark) {
      tr.addMark(mark.from, mark.to, schema.marks.link.create(attrs))
    }
    tr.setMeta('show_link_toolbar', false)
    dispatch(tr)
  }
  return true
}

export function removeLinkBeingEdited(
  state: EditorState,
  dispatch: Dispatch | null
) {
  if (dispatch) {
    const { selection, schema, tr } = state
    const mark = markExtend(selection.$anchor, schema.marks.link)
    if (mark) {
      tr.removeMark(mark.from, mark.to, mark.mark)
    }
    tr.setMeta('show_link_toolbar', false)
    dispatch(tr)
  }
  return true
}
