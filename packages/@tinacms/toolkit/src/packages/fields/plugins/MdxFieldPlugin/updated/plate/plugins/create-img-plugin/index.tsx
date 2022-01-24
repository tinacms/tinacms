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
import { ImgEmbed } from './component'
import { createPluginFactory, setNodes } from '@udecode/plate-core'
import { Editor } from 'slate'
import { ReactEditor } from 'slate-react'
import { insertBlockElement } from '../core/common'

export const ELEMENT_IMG = 'img'

export const createImgPlugin = createPluginFactory({
  key: ELEMENT_IMG,
  isVoid: true,
  isInline: false,
  isElement: true,
  component: (props) => {
    const path = ReactEditor.findPath(props.editor, props.element)
    const handleChange = (values) => {
      setNodes(props.editor, values, { at: path })
    }
    return <ImgEmbed {...props} onChange={handleChange} />
  },
})

export const insertImg = (editor: ReactEditor) => {
  insertBlockElement(editor, {
    type: ELEMENT_IMG,
    children: [{ text: '' }],
    url: '',
    caption: '',
    alt: '',
  })

  // FIXME: not sure why this was needed
  Editor.normalize(editor, { force: true })
}
