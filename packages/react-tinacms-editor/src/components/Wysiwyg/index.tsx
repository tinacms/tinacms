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
import { useState } from 'react'

import { EditorModeMenu } from '../EditorModeMenu'
import { EditorProps } from '../../types'
import { MarkdownEditor } from '../MarkdownEditor'
import { ProsemirrorEditor } from '../ProsemirrorEditor'

const modeTogglePlugin = (setMode: (mode: string) => void) => ({
  name: 'wysiwygModeToggle',
  MenuItem: () => <EditorModeMenu toggleEditorMode={() => setMode('raw')} />,
})

export const Wysiwyg = ({
  imageProps,
  input,
  plugins = [],
  format = 'markdown',
  sticky,
}: EditorProps) => {
  const [mode, setMode] = useState('wysiwyg')
  const [value, setValue] = useState(input.value)

  const handleChange = (value: string) => {
    setValue(value)
    input.onChange(value)
  }

  const pluginList =
    format === 'markdown' ? [...plugins, modeTogglePlugin(setMode)] : plugins

  return (
    <>
      {mode === 'raw' ? (
        <MarkdownEditor
          value={value}
          onChange={handleChange}
          imageProps={imageProps}
          toggleEditorMode={() => setMode('wysiwyg')}
        />
      ) : (
        <ProsemirrorEditor
          input={{
            value,
            onChange: handleChange,
          }}
          plugins={pluginList}
          sticky={sticky}
          format={format}
          imageProps={imageProps}
        />
      )}
    </>
  )
}
