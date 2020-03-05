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
import { Menu } from './Menu'
import { EditorView } from 'prosemirror-view'
import { Translator } from '../../../Translator'
import { TranslatorContext } from './TranslatorContext'

interface MenuProps {
  editorView: { view: EditorView }
  translator: Translator
  bottom?: boolean
  theme?: any
  sticky?: boolean
}

export default ({
  editorView,
  translator,
  bottom,
  theme,
  sticky,
}: MenuProps) => {
  return (
    <TranslatorContext.Provider value={translator}>
      <Menu
        editorView={editorView}
        bottom={bottom}
        format="markdown"
        theme={theme}
        sticky={sticky}
      />
    </TranslatorContext.Provider>
  )
}
