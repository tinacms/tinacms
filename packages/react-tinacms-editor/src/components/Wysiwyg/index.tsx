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

import { BrowserFocusProvider } from '../../context/browserFocus'
import { EditorModeMenu } from '../EditorModeMenu'
import {
  EditorModeProvider,
  EditorModeConsumer,
} from '../../context/editorMode'
import { EditorProps } from '../../types'
import { MarkdownEditor } from '../MarkdownEditor'
import { ProsemirrorEditor } from '../ProsemirrorEditor'

const modeTogglePlugin = {
  name: 'wysiwygModeToggle',
  MenuItem: () => <EditorModeMenu />,
}

export const Wysiwyg = ({
  imageProps,
  input,
  plugins = [],
  format = 'markdown',
  sticky,
}: EditorProps) => {
  const { value, onChange } = input
  const pluginList =
    format === 'markdown' ? [...plugins, modeTogglePlugin] : plugins

  return (
    <EditorModeProvider>
      <EditorModeConsumer>
        {({ mode }) => (
          <BrowserFocusProvider>
            {mode === 'markdown' ? (
              <MarkdownEditor
                value={value}
                onChange={onChange}
                imageProps={imageProps}
                plugins={pluginList}
              />
            ) : (
              <ProsemirrorEditor
                input={{
                  value,
                  onChange: onChange,
                }}
                plugins={pluginList}
                sticky={sticky}
                format={format}
                imageProps={imageProps}
              />
            )}
          </BrowserFocusProvider>
        )}
      </EditorModeConsumer>
    </EditorModeProvider>
  )
}
