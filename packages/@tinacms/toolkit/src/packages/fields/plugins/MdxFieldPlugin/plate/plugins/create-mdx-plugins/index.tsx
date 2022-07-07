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
