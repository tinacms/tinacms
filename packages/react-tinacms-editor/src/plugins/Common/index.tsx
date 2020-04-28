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

import { Plugin, PluginKey, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

interface CommonPluginState {
  editorFocused: boolean
}

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

export const commonPluginKey = new PluginKey('common')

export const commonPlugin = new Plugin({
  key: commonPluginKey,
  state: {
    init: () => {
      return { editorFocused: false }
    },
    apply(tr: Transaction, prev: CommonPluginState) {
      if (tr.getMeta('editor_focused') === false) {
        return {
          editorFocused: false,
        }
      }

      if (tr.getMeta('editor_focused')) {
        return {
          editorFocused: true,
        }
      }

      return prev
    },
  },
  props: {
    handleScrollToSelection() {
      return true
    },
    handleDOMEvents: {
      focus(view) {
        const { state, dispatch } = view
        dispatch(state.tr.setMeta('editor_focused', true))
        return false
      },
      blur(view) {
        const { state, dispatch } = view
        dispatch(state.tr.setMeta('editor_focused', false))
        return false
      },
    },
    handleKeyDown(view: EditorView, event: KeyboardEvent) {
      return exitCodeMarkOnArrowRight(view, event)
    },
  },
})
