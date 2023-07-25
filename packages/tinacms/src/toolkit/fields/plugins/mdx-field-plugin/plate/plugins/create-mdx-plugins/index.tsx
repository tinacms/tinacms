import React from 'react'
import {
  createPluginFactory,
  setNodes,
  normalizeEditor,
  PlateEditor,
} from '@udecode/plate-headless'
import { ReactEditor } from 'slate-react'
import { BlockEmbed, InlineEmbed } from './component'
import {
  insertBlockElement,
  insertInlineElement,
  helpers,
} from '../core/common'
import type { MdxTemplate } from '../../types'

export const ELEMENT_MDX_INLINE = 'mdxJsxTextElement'
export const ELEMENT_MDX_BLOCK = 'mdxJsxFlowElement'

const Embed = (props) => {
  const handleChange = (values) => {
    const path = ReactEditor.findPath(props.editor, props.element)
    setNodes(props.editor, { props: values }, { at: path })
  }

  if (props.inline) {
    return <InlineEmbed {...props} onChange={handleChange} />
  }
  return <BlockEmbed {...props} onChange={handleChange} />
}

export const createMdxInlinePlugin = createPluginFactory<{
  templates: MdxTemplate[]
}>({
  key: ELEMENT_MDX_INLINE,
  isInline: true,
  isVoid: true,
  isElement: true,
  component: (props) => <Embed {...props} inline={true} />,
})

export const createMdxBlockPlugin = createPluginFactory({
  key: ELEMENT_MDX_BLOCK,
  isVoid: true,
  isElement: true,
  component: (props) => <Embed {...props} inline={false} />,
})

export const insertMDX = (editor: PlateEditor, value: MdxTemplate) => {
  const flow = value.inline ? false : true
  if (!helpers.currentNodeSupportsMDX(editor)) {
    return
  }
  if (flow) {
    insertBlockElement(editor, {
      type: ELEMENT_MDX_BLOCK,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    })

    normalizeEditor(editor, { force: true })
  } else {
    insertInlineElement(editor, {
      type: ELEMENT_MDX_INLINE,
      name: value.name,
      children: [{ text: '' }],
      props: value.defaultItem ? value.defaultItem : {},
    })
  }
}
