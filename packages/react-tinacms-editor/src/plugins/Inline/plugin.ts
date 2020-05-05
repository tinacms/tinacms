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

import { Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const exitCodeMarkOnArrowRight = (view: EditorView, event: KeyboardEvent) => {
  // If user is at end of current line and there is a code mark an arrow-right will
  // take user out of the code mark.
  if (event.key !== 'ArrowRight') return false
  const { selection, schema } = view.state
  const { code } = schema.marks
  if (!code.isInSet(selection.$to.marks())) return false
  const selectionIsAtEnd =
    selection.$to.node().nodeSize - 2 === selection.$to.parentOffset
  if (!selectionIsAtEnd) return false
  const { state, dispatch } = view
  dispatch(
    state.tr
      .insertText(' ', selection.$to.pos)
      .removeMark(selection.$to.pos, selection.$to.pos + 1, code)
  )
  return true
}

const inlinePluginKey = new PluginKey('inline')

export const inlinePlugin = new Plugin({
  key: inlinePluginKey,

  props: {
    handleKeyDown(view: EditorView, event: KeyboardEvent) {
      return exitCodeMarkOnArrowRight(view, event)
    },
  },
})
