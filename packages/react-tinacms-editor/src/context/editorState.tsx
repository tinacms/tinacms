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

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { EditorView } from 'prosemirror-view'

import { buildEditor } from './utils/buildEditor'
import { buildEditorState } from './utils/buildEditorState'
import { useBrowserFocusContext } from './browserFocus'

const EditorStateContext = createContext<{
  editorView: { view: EditorView } | undefined
  translator: any
}>({
  editorView: undefined,
  translator: undefined,
})

export const EditorStateProvider = ({
  children,
  input,
  el,
  imageProps,
  format,
}: any) => {
  const [editorView, setEditorView] = useState<{ view: EditorView }>()
  const [translator, setTranslator] = useState<any>()
  const { browserFocused } = useBrowserFocusContext()

  useEffect(() => {
    const { translator: translatorObj } = buildEditor(
      input,
      el,
      imageProps,
      setEditorView,
      format
    )
    setTranslator(translatorObj)
    return () => {
      editorView && editorView.view.destroy()
    }
  }, [el])

  useEffect(() => {
    const view = editorView && editorView.view
    if (!view || view.hasFocus()) return
    view.updateState(
      buildEditorState(view.state.schema, translator, input.value, imageProps)
    )
  }, [input.value])

  useEffect(() => {
    const view = editorView && editorView.view
    if (!view || (view.hasFocus() && browserFocused)) return
    view.updateState(
      buildEditorState(view.state.schema, translator, input.value, imageProps)
    )
  }, [input.value])

  return (
    <EditorStateContext.Provider value={{ editorView, translator }}>
      {children}
    </EditorStateContext.Provider>
  )
}

export const EditorStateConsumer = EditorStateContext.Consumer

export const useEditorStateContext = () => ({
  ...useContext(EditorStateContext),
})
