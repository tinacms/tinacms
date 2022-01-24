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
    if (Editor.isVoid(editor, selectedNode)) {
      Editor.insertNode(editor, {
        // @ts-ignore bad type from slate
        type: 'p',
        children: [{ text: '' }],
      })
      return
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

    deleteBackward(unit)
  }

  return editor
}
