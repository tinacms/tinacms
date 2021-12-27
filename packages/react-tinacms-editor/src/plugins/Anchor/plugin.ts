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

import { Slice } from 'prosemirror-model'
import { Plugin, Transaction, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import { linkify } from './util'

interface AnchorPluginState {
  showAnchorForm: boolean
  show_anchor_toolbar: boolean
}

export const anchorPluginKey = new PluginKey<AnchorPluginState>('image')

export function anchorPlugin(): Plugin {
  let shiftKey: boolean
  return new Plugin({
    key: anchorPluginKey,
    state: {
      init: () => {
        return { showAnchorForm: false }
      },
      apply(tr: Transaction, prev: AnchorPluginState, _: any) {
        if (tr.getMeta('show_anchor_toolbar') === false) {
          return {
            show_anchor_toolbar: false,
          }
        }

        if (tr.getMeta('show_anchor_toolbar')) {
          return {
            show_anchor_toolbar: true,
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
        const { tr } = state
        dispatch(tr.setMeta('show_anchor_toolbar', false))
      },
    },
    // TODO: Fix pls
  } as any)
}
