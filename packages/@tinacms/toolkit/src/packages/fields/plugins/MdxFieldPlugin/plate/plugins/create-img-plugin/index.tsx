/**

*/

import React from 'react'
import { ImgEmbed } from './component'
import {
  createPluginFactory,
  normalizeEditor,
  PlateEditor,
  setNodes,
} from '@udecode/plate-headless'
import { ReactEditor } from 'slate-react'
import { insertBlockElement } from '../core/common'

export const ELEMENT_IMG = 'img'

export const createImgPlugin = createPluginFactory({
  key: ELEMENT_IMG,
  isVoid: true,
  isInline: false,
  isElement: true,
  component: (props) => {
    const handleChange = (values) => {
      const path = ReactEditor.findPath(props.editor, props.element)
      setNodes(props.editor, values, { at: path })
    }
    return <ImgEmbed {...props} onChange={handleChange} />
  },
})

export const insertImg = (editor: PlateEditor) => {
  insertBlockElement(editor, {
    type: ELEMENT_IMG,
    children: [{ text: '' }],
    url: '',
    caption: '',
    alt: '',
  })

  // FIXME: not sure why this was needed
  normalizeEditor(editor, { force: true })
}
