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

export const imagePluginKey = new PluginKey('image')

export const imagePlugin = new Plugin({
  key: imagePluginKey,

  state: {
    init: () => {
      return { selectedImage: undefined }
    },
    apply(tr, prev) {
      if (prev && prev.selectedImage) {
        const { pos } = prev.selectedImage
        if (!tr.doc.nodeAt(pos)) return {}
      }
      const selectedImage = tr.getMeta('image_clicked')
      if (selectedImage) return { selectedImage }
      if (selectedImage === false) return { selectedImage: undefined }
      return prev
    },
  },
  props: {
    decorations(state) {
      return (this as any).getState(state).deco
    },
    handleKeyDown(view: EditorView, event: KeyboardEvent) {
      if (event.key === 'Escape') {
        const { state, dispatch } = view
        dispatch(state.tr.setMeta('image_clicked', false))
      }
      return false
    },
    handleClickOn(
      view: EditorView,
      _1: any,
      node: any,
      nodePos: number,
      _2: any,
      direct: boolean
    ) {
      if (!direct) return false
      const { state, dispatch } = view
      const { image } = view.state.schema.nodes
      if (node.type === image) {
        dispatch(state.tr.setMeta('image_clicked', { pos: nodePos, node }))
      } else {
        dispatch(state.tr.setMeta('image_clicked', false))
      }
      return false
    },
  },
})
