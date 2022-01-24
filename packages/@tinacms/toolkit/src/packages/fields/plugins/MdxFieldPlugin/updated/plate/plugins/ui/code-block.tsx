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

import React from 'react'
import { CODE_BLOCK_LANGUAGES } from '@udecode/plate-code-block'
import { setNodes } from '@udecode/plate-core'
import { ReactEditor } from 'slate-react'
import { Dropdown } from './dropdown'

export const CodeBlock = ({ attributes, editor, element, ...props }) => {
  const setLanguage = (language) => {
    const path = ReactEditor.findPath(editor, element)
    setNodes(editor, { language: language }, { at: path })
  }

  const items = Object.entries(CODE_BLOCK_LANGUAGES).map(([key, item]) => {
    return {
      key,
      onClick: () => setLanguage(key),
      render: item,
    }
  })

  return (
    <div className="relative">
      <div contentEditable={false} className="absolute top-1 right-1">
        <div className="flex w-full">
          <div />
          <Dropdown
            label={CODE_BLOCK_LANGUAGES[element.language] || 'Language'}
            items={items}
          />
        </div>
      </div>
      <pre {...attributes} className="pt-10 m-0">
        <code {...props} />
      </pre>
    </div>
  )
}
