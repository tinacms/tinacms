import {
  createParagraphPlugin,
  createHorizontalRulePlugin,
  createNodeIdPlugin,
  createListPlugin,
  getListItemEntry,
  createBlockquotePlugin,
  createHeadingPlugin,
  createBoldPlugin,
  createStrikethroughPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createCodePlugin,
  createIndentListPlugin,
  createTablePlugin,
} from '@udecode/plate'
import { ReactEditor } from 'slate-react'
import {
  createCodeBlockPlugin,
  createHTMLBlockPlugin,
  createHTMLInlinePlugin,
} from '../create-code-block'
import { ELEMENT_IMG } from '../create-img-plugin'
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../create-mdx-plugins'
import { HANDLES_MDX } from './formatting'
import {
  findNode,
  getBlockAbove,
  getPluginType,
  insertNodes,
  type PlateEditor,
  setNodes,
  someNode,
} from '@udecode/plate-common'
import { createSlashPlugin } from '@udecode/plate-slash-command'
import { Transforms, Editor, Node } from 'slate'

export const plugins = [
  createHeadingPlugin(),
  createParagraphPlugin(),
  createCodeBlockPlugin(),
  createHTMLBlockPlugin(),
  createHTMLInlinePlugin(),
  createBlockquotePlugin(),
  createBoldPlugin(),
  createStrikethroughPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
  createCodePlugin(),
  createListPlugin(),
  createIndentListPlugin(),
  createHorizontalRulePlugin(),
  // Allows us to do things like copy/paste, remembering the state of the element (like mdx)
  createNodeIdPlugin(),
  createSlashPlugin(),
  createTablePlugin(),
]

export const unsupportedItemsInTable = new Set([
  'Code Block',
  'Unordered List',
  'Ordered List',
  'Quote',
  'Mermaid',
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Heading 4',
  'Heading 5',
  'Heading 6',
])

const isNodeActive = (editor, type) => {
  const pluginType = getPluginType(editor, type)
  return (
    !!editor?.selection && someNode(editor, { match: { type: pluginType } })
  )
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
      id: Date.now(),
    }
  }
  if (node.children) {
    if (node.children.length) {
      return {
        ...node,
        children: node.children.map(normalize),
        id: Date.now(),
      }
    }
    // Always supply an empty text leaf
    return {
      ...node,
      children: [{ text: '' }],
      id: Date.now(),
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
  isListActive,
  currentNodeSupportsMDX,
  normalize,
}
