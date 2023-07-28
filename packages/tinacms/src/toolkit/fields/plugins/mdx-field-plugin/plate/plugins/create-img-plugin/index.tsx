import React from 'react'
import { ImgEmbed } from './component'
import {
  createPluginFactory,
  normalizeEditor,
  PlateEditor,
  setNodes,
} from '@udecode/plate-headless'
import { ReactEditor } from 'slate-react'
import { insertInlineElement } from '../core/common'
import { Media } from '../../../../../../core/media'
import { isImage } from '@toolkit/components/media/utils'

export const ELEMENT_IMG = 'img'

export const createImgPlugin = createPluginFactory({
  key: ELEMENT_IMG,
  isVoid: true,
  isInline: true,
  isElement: true,
  component: (props) => {
    const handleChange = (values) => {
      const path = ReactEditor.findPath(props.editor, props.element)
      setNodes(props.editor, values, { at: path })
    }
    return <ImgEmbed {...props} onChange={handleChange} />
  },
})

export const insertImg = (editor: PlateEditor, media: Media) => {
  if (isImage(media.src)) {
    insertInlineElement(editor, {
      type: ELEMENT_IMG,
      children: [{ text: '' }],
      url: media.src,
      caption: '',
      alt: '',
    })
  } else {
    insertInlineElement(editor, {
      type: 'a',
      url: media.src,
      title: media.filename,
      children: [{ text: media.filename }],
    })
  }

  // FIXME: not sure why this was needed
  normalizeEditor(editor, { force: true })
}
