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
  getPluginType,
  isMarkActive as isMarkActiveBase,
  insertNodes,
  setNodes,
  findNode,
  PlateEditor,
  getBlockAbove,
  createParagraphPlugin,
  createHorizontalRulePlugin,
  createNodeIdPlugin,
  createListPlugin,
  getListItemEntry,
  createBlockquotePlugin,
  createHeadingPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createCodePlugin,
} from '@udecode/plate-headless'
import { ReactEditor } from 'slate-react'
import {
  createCodeBlockPlugin,
  createHTMLBlockPlugin,
  createHTMLInlinePlugin,
} from '../create-code-block'
import { Editor, Node, Transforms } from 'slate'
import { ELEMENT_IMG } from '../create-img-plugin'
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins'
import { HANDLES_MDX } from './formatting'

export const plugins = [
  createHeadingPlugin(),
  createParagraphPlugin(),
  createCodeBlockPlugin(),
  createHTMLBlockPlugin(),
  createHTMLInlinePlugin(),
  createBlockquotePlugin(),
  createBoldPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
  createCodePlugin(),
  createListPlugin(),
  createHorizontalRulePlugin(),
  // Allows us to do things like copy/paste, remembering the state of the element (like mdx)
  createNodeIdPlugin(),
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
    if (node.children.length) {
      return {
        ...node,
        children: node.children.map(normalize),
      }
    } else {
      // Always supply an empty text leaf
      return {
        ...node,
        children: [{ text: '' }],
      }
    }
  }
  return node
}

export const insertInlineElement = (editor, inlineElement) => {
  insertNodes(editor, [inlineElement])
  /**
   * FIXME mdx-setTimeout: setTimeout seems to work, but not sure why it's necessary
   * Without this, the move occurs on the element that was selected
   * _before_ we inserted the node
   */
  // Move selection to the space after the embedded line
  setTimeout(() => {
    Transforms.move(editor)
  }, 1)
}
export const insertBlockElement = (editor, blockElement) => {
  const editorEl = ReactEditor.toDOMNode(editor, editor)
  if (editorEl) {
    /**
     * FIXME mdx-setTimeout: there must be a better way to do this. When jumping
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
  if (!editor.selection) {
    return false
  }
  const [node] = Editor.node(editor, editor.selection)
  const cursor = editor.selection.focus
  const blockAbove = getBlockAbove(editor)
  const isEmpty =
    !Node.string(node) &&
    // @ts-ignore bad type from slate
    !node.children?.some((n) => Editor.isInline(editor, n)) &&
    // Only do this if we're at the start of a block
    Editor.isStart(editor, cursor, blockAbove[1])

  return isEmpty
}

/** Specifies node types which mdx can be embedded.
 * This prevents nodes like code blocks from having
 * MDX elements in them, which can't be parsed
 * NOTE: this also excludes block quotes, but probably should
 * allow for that, at the moment blockquotes are strict
 */
const currentNodeSupportsMDX = (editor: PlateEditor) =>
  findNode(editor, {
    match: { type: HANDLES_MDX },
  })

export const helpers = {
  isNodeActive,
  isMarkActive,
  isListActive,
  currentNodeSupportsMDX,
  normalize,
}
