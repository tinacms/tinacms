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

import * as React from 'react'
import { useEffect, useState } from 'react'
import { createContext, useContext } from 'react'

const EditorModeContext = createContext<{
  mode: string
  setMode: (mode: string) => void
}>({
  mode: 'wysiwyg',
  setMode: () => {},
})

export const EditorModeProvider = ({ children }: any) => {
  const [mode, setMode] = useState('wysiwyg')

  useEffect(() => {
    document.addEventListener('keydown', event => {
      if (
        event.altKey &&
        event.shiftKey &&
        event.metaKey &&
        event.keyCode === 77
      )
        setMode(mode === 'wysiwyg' ? 'markdown' : 'wysiwyg')
    })
  })

  return (
    <EditorModeContext.Provider value={{ mode, setMode }}>
      {children}
    </EditorModeContext.Provider>
  )
}

export const EditorModeConsumer = EditorModeContext.Consumer

export const useEditorModeContext = () => useContext(EditorModeContext)
