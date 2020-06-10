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
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { EditorView } from 'prosemirror-view'

import { EditorProps } from '../../types'
import { EditorStateProvider } from '../../context/editorState'
import { useBrowserFocusContext } from '../../context/browserFocus'

import { buildEditor } from './utils/buildEditor'
import { buildEditorState } from './utils/buildEditorState'
import { Menubar } from './Menubar'
import { CodeMirrorCss } from './styles/CodeMirror'
import { ProseMirrorCss } from './styles/ProseMirror'

export const ProsemirrorEditor = styled(
  ({
    input,
    plugins,
    sticky,
    format,
    imageProps,
    ...styleProps
  }: EditorProps) => {
    const editorRef = useRef<HTMLDivElement | null>(null)
    const [editorView, setEditorView] = useState<{ view: EditorView }>()
    const [translator, setTranslator] = useState<any>()
    const { browserFocused } = useBrowserFocusContext()

    useEffect(() => {
      // State is updated with latest value of editorRef to trigger re-render
      const { translator: translatorObj } = buildEditor(
        input,
        editorRef.current,
        imageProps,
        setEditorView,
        format
      )
      setTranslator(translatorObj)
      return () => {
        editorView && editorView.view.destroy()
      }
    }, [editorRef])

    useEffect(() => {
      const view = editorView && editorView.view
      if (!view || (view.hasFocus() && browserFocused)) return
      view.updateState(
        buildEditorState(view.state.schema, translator, input.value, imageProps)
      )
    }, [input.value])

    return (
      <WysiwygWrapper className="wysiwyg-wrapper" data-testid="wysiwyg-editor">
        <link
          rel="stylesheet"
          href="https://codemirror.net/lib/codemirror.css"
        />
        <EditorStateProvider translator={translator} editorView={editorView}>
          <Menubar
            sticky={sticky}
            uploadImages={imageProps && imageProps.upload}
            plugins={plugins}
          />
        </EditorStateProvider>
        <div {...styleProps} ref={editorRef} />
      </WysiwygWrapper>
    )
  }
)`
  ${CodeMirrorCss}${ProseMirrorCss}
`

const WysiwygWrapper = styled.div`
  position: relative;
`
