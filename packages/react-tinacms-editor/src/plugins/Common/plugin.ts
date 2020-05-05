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

export interface CommonPluginState {
  editorFocused: boolean
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
  },
})
