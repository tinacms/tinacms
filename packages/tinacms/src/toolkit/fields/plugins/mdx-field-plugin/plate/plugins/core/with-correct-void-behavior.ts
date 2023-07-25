import { isElement } from '@udecode/plate-headless'
import { Editor, Node, Path, Range, Transforms } from 'slate'

/**
 *
 * This fixes a bug where you can't delete between two void nodes
 * without deleting the first node.
 *
 * https://github.com/ianstormtaylor/slate/issues/3991#issuecomment-832160304
 */
export const withCorrectVoidBehavior = (editor) => {
  const { deleteBackward, insertBreak } = editor

  // if current selection is void node, insert a default node below
  editor.insertBreak = () => {
    if (!editor.selection || !Range.isCollapsed(editor.selection)) {
      return insertBreak()
    }

    const selectedNodePath = Path.parent(editor.selection.anchor.path)
    const selectedNode = Node.get(editor, selectedNodePath)
    if (isElement(selectedNode)) {
      if (Editor.isVoid(editor, selectedNode)) {
        Editor.insertNode(editor, {
          // @ts-ignore bad type from slate
          type: 'p',
          children: [{ text: '' }],
        })
        return
      }
    }

    insertBreak()
  }

  // if prev node is a void node, remove the current node and select the void node
  editor.deleteBackward = (unit) => {
    if (
      !editor.selection ||
      !Range.isCollapsed(editor.selection) ||
      editor.selection.anchor.offset !== 0
    ) {
      return deleteBackward(unit)
    }

    const parentPath = Path.parent(editor.selection.anchor.path)
    const parentNode = Node.get(editor, parentPath)
    const parentIsEmpty = Node.string(parentNode).length === 0

    if (parentIsEmpty && Path.hasPrevious(parentPath)) {
      const prevNodePath = Path.previous(parentPath)
      const prevNode = Node.get(editor, prevNodePath)
      if (isElement(prevNode)) {
        if (Editor.isVoid(editor, prevNode)) {
          Transforms.removeNodes(editor)
          // Deleting a top-level void node results in an empty array for the value
          // Normalizing kicks in some of the other normalization logic which
          // prevents this from happening. I'm not sure when/why normalize runs
          // but for whatever reason it doesn't happen unless we force it
          Editor.normalize(editor, { force: true })
          return
        }
      }
    }

    deleteBackward(unit)
  }

  return editor
}
