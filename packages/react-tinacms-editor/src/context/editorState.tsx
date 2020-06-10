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
import { createContext, useContext, ReactElement } from 'react'
import { EditorView } from 'prosemirror-view'

interface EditorStateIntf {
  editorView: { view: EditorView } | undefined
  translator: any
}

const EditorStateContext = createContext<EditorStateIntf>({
  editorView: undefined,
  translator: undefined,
})

export const EditorStateProvider = ({
  children,
  editorView,
  translator,
}: EditorStateIntf & { children?: ReactElement }) => {
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
