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

import { Slice } from 'prosemirror-model'
import { Plugin, Transaction, PluginKey, EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import { commonPluginKey } from '../Common'
import { isMarkPresent } from '../../utils'
import { linkify } from './util'

interface LinkPluginState {
  showLinkForm: boolean
}

export const linkPluginKey = new PluginKey('image')

export function linkPlugin(): Plugin {
  let shiftKey: boolean
  return new Plugin({
    key: linkPluginKey,
    state: {
      init: () => {
        return { showLinkForm: false }
      },
      apply(
        tr: Transaction,
        prev: LinkPluginState,
        _: any,
        state: EditorState
      ) {
        if (tr.getMeta('show_link_toolbar') === false) {
          return {
            show_link_toolbar: false,
          }
        }

        if (tr.getMeta('show_link_toolbar')) {
          return {
            show_link_toolbar: true,
          }
        }

        const { editorFocused } = commonPluginKey.getState(state)
        if (isMarkPresent(state, state.schema.marks.link)) {
          return {
            show_link_toolbar: true,
          }
        } else if (editorFocused) {
          return {
            show_link_toolbar: false,
          }
        }

        return prev
      },
    },
    props: {
      transformPasted(slice: Slice): Slice {
        if (shiftKey) {
          return slice
        }
        return new Slice(linkify(slice.content), slice.openStart, slice.openEnd)
      },
      handleKeyDown(_x: any, e: any) {
        shiftKey = e.shiftKey
        return false
      },
      handleClickOn(view: EditorView, _1: any) {
        const { dispatch, state } = view
        const { tr, schema } = state
        if (!isMarkPresent(state, schema.marks.link)) {
          dispatch(tr.setMeta('show_link_toolbar', false))
        }
        return false
      },
    },
    // TODO: Fix pls
  } as any)
}
