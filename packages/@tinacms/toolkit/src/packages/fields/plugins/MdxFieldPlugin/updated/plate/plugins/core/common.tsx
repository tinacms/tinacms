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

import {
  someNode,
  isMarkActive as isMarkActiveBase,
  getPluginType,
  insertNodes,
  setNodes,
} from '@udecode/plate-core'
import { ReactEditor } from 'slate-react'
import { createParagraphPlugin } from '@udecode/plate-paragraph'
import { createCodeBlockPlugin } from '@udecode/plate-code-block'
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule'
import { createListPlugin, getListItemEntry } from '@udecode/plate-list'
import { createBlockquotePlugin } from '@udecode/plate-block-quote'
import { createHeadingPlugin } from '@udecode/plate-heading'
import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createCodePlugin,
} from '@udecode/plate-basic-marks'
import { ELEMENT_IMG } from '../create-img-plugin'
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins'
import { Editor, Node } from 'slate'

export const plugins = [
  createHeadingPlugin(),
  createParagraphPlugin(),
  createCodeBlockPlugin(),
  createBlockquotePlugin(),
  createBoldPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
  createCodePlugin(),
  createListPlugin(),
  createHorizontalRulePlugin(),
]

const isNodeActive = (editor, type) => {
  const pluginType = getPluginType(editor, type)
  return (
    !!editor?.selection && someNode(editor, { match: { type: pluginType } })
  )
}
const isMarkActive = (editor, type) => {
  return !!editor?.selection && isMarkActiveBase(editor, type)
}
const isListActive = (editor, type) => {
  const res = !!editor?.selection && getListItemEntry(editor)
  return !!res && res.list[0].type === type
}

const normalize = (node: any) => {
  if (
    [ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG].includes(node.type)
  ) {
    return {
      ...node,
      children: [{ type: 'text', text: '' }],
    }
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(normalize),
    }
  }
  return node
}

export const insertBlockElement = (editor, blockElement) => {
  const editorEl = ReactEditor.toDOMNode(editor, editor)
  if (editorEl) {
    /**
     * FIXME: there must be a better way to do this. When jumping
     * back from a nested form, the entire editor doesn't receive
     * focus, so enable that, but what we also want is to ensure
     * that this node is selected - so do that, too. But there
     * seems to be a race condition where the `editorEl.focus` doesn't
     * happen in time for the Transform to take effect, hence the
     * setTimeout. I _think_ it just needs to queue and the actual
     * ms timeout is irrelevant, but might be worth checking on
     * devices with lower CPUs
     */
    editorEl.focus()
    setTimeout(() => {
      // If empty, replace the current block
      if (isCurrentBlockEmpty(editor)) {
        setNodes(editor, blockElement)
      } else {
        insertNodes(editor, [blockElement])
      }
    }, 1)
  }
}

const isCurrentBlockEmpty = (editor) => {
  const [node] = Editor.node(editor, editor.selection)
  const isEmpty =
    !Node.string(node) &&
    // @ts-ignore bad type from slate
    !node.children?.some((n) => Editor.isInline(editor, n))

  return isEmpty
}

export const helpers = {
  isNodeActive,
  isMarkActive,
  isListActive,
  normalize,
}
