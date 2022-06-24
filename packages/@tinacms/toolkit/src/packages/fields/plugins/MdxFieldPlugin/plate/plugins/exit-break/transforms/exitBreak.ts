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
  ELEMENT_DEFAULT,
  getPluginType,
  insertNodes,
  PlateEditor,
} from '@udecode/plate-core'
import { Editor, Path } from 'slate'
import { exitBreakAtEdges } from '../queries/exitBreakAtEdges'
import { ExitBreakRule } from '../types'

export const exitBreak = (
  editor: PlateEditor,
  {
    level = 0,
    defaultType = getPluginType(editor, ELEMENT_DEFAULT),
    query = {},
    before,
  }: Omit<ExitBreakRule, 'hotkey'>
) => {
  if (!editor.selection) return

  const { queryEdge, isEdge, isStart } = exitBreakAtEdges(editor, query)
  if (isStart) before = true

  if (queryEdge && !isEdge) return

  const selectionPath = Editor.path(editor, editor.selection)

  let insertPath
  if (before) {
    insertPath = selectionPath.slice(0, level + 1)
  } else {
    insertPath = Path.next(selectionPath.slice(0, level + 1))
  }

  insertNodes(
    editor,
    { type: defaultType, children: [{ text: '' }] },
    {
      at: insertPath,
      select: !isStart,
    }
  )

  return true
}
