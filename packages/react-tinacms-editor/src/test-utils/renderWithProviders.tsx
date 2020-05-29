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

import React from 'react'
import { render } from '@testing-library/react'

import { EditorModeProvider } from '../context/editorMode'
import { BrowserFocusProvider } from '../context/browserFocus'
import { EditorStateProvider } from '../context/editorState'

export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <EditorModeProvider>
      <BrowserFocusProvider>
        <EditorStateProvider editorView={{} as any} translator={{} as any}>
          {component}
        </EditorStateProvider>
      </BrowserFocusProvider>
    </EditorModeProvider>
  )
}
