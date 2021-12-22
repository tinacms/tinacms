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

import {
  EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  Transaction,
} from 'prosemirror-state'
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view'
import { Slice } from 'prosemirror-model'

import { insertImageList } from './commands'
import { ImageView } from './nodeView'
import { ImageProps } from '../../types'

export const imagePluginKey = new PluginKey<{ selectedImage?: any }>('image')

const setSelectionAtPos = (
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  pos: number
) => {
  dispatch(state.tr.setSelection(new NodeSelection(state.tr.doc.resolve(pos))))
}

const insertImageFiles = (
  editorView: EditorView,
  data: DataTransfer,
  uploadImages: (files: File[]) => Promise<string[]>
) => {
  const files = []
  for (let i = 0; i < data.files.length; i++) {
    const file = data.files[i]
    if (file.type.match('image.*')) files.push(file)
  }
  if (files.length) {
    const { state, dispatch } = editorView
    dispatch(state.tr.setMeta('loading_images', files.length))
    const uploadPromise = uploadImages(files)
    uploadPromise.then((urls = []) => {
      dispatch(state.tr.setMeta('loading_images', 0))
      insertImageList(state, dispatch, urls)
      editorView.focus()
    })
    return true
  }
  return false
}

export const imagePlugin = ({ previewSrc, upload: uploadImages }: ImageProps) =>
  new Plugin<{ selectedImage?: any }>({
    key: imagePluginKey,

    state: {
      init: () => {
        return { selectedImage: undefined }
      },
      apply(tr, prev, _, newState) {
        if (tr.getMeta('loading_images') > 0) {
          const loadingImagesCount = tr.getMeta('loading_images')
          const div = document.createElement('div')
          for (let i = 0; i < loadingImagesCount; i++) {
            const childElement = document.createElement('div')
            childElement.classList.add('image_loading_indicator')
            div.appendChild(childElement)
          }
          return {
            ...prev,
            deco: DecorationSet.create(newState.doc, [
              Decoration.widget(newState.selection.$to.pos, div),
            ]),
          }
        }
        if (tr.getMeta('loading_images') === 0) {
          return {
            ...prev,
            deco: undefined,
          }
        }
        if (prev && prev.selectedImage) {
          const { pos } = prev.selectedImage
          if (!tr.doc.nodeAt(pos))
            return {
              ...prev,
              selectedImage: undefined,
            }
        }
        const selectedImage = tr.getMeta('image_clicked')
        if (selectedImage) return { ...prev, selectedImage }
        if (selectedImage === false)
          return { ...prev, selectedImage: undefined }
        return prev
      },
    },
    props: {
      nodeViews: {
        // @ts-ignore
        image(node, view) {
          return new ImageView(node, view, previewSrc)
        },
      },
      decorations(state) {
        return (this as any).getState(state).deco
      },
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const { state, dispatch } = view
        const { selection, schema } = state
        if (event.key === 'Escape') {
          dispatch(state.tr.setMeta('image_clicked', false))
        } else if (
          event.key === 'Backspace' &&
          selection.$to.nodeBefore &&
          selection.$to.nodeBefore.type === schema.nodes.image
        ) {
          setSelectionAtPos(state, dispatch, selection.$to.pos - 1)
          return true
        } else if (
          event.key === 'Delete' &&
          selection.$to.nodeAfter &&
          selection.$to.nodeAfter.type === schema.nodes.image
        ) {
          setSelectionAtPos(state, dispatch, selection.$to.pos)
          return true
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
      handleDrop(
        editorView: EditorView,
        event: Event,
        _: Slice,
        moved: boolean
      ) {
        if (moved || !uploadImages) return false
        event.preventDefault()
        const dataTransfer = (event as DragEvent).dataTransfer
        if (!dataTransfer) return false
        return insertImageFiles(editorView, dataTransfer, uploadImages)
      },
      handlePaste(editorView: EditorView, event: Event) {
        if (!uploadImages) return false
        event.preventDefault()
        const clipboardData = (event as ClipboardEvent).clipboardData
        if (!clipboardData) return false
        return insertImageFiles(editorView, clipboardData, uploadImages)
      },
    },
  })
