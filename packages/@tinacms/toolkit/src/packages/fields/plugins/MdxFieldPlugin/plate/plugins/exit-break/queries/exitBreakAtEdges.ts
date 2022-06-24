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
  isExpanded,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  TEditor,
} from '@udecode/plate-core'

/**
 * Check if the selection is at the edge of its parent block.
 * If it is and if the selection is expanded, delete its content.
 */
export const exitBreakAtEdges = (
  editor: TEditor,
  {
    start,
    end,
  }: {
    start?: boolean
    end?: boolean
  }
) => {
  let queryEdge = false
  let isEdge = false
  let isStart = false
  if (start || end) {
    queryEdge = true

    if (start && isSelectionAtBlockStart(editor)) {
      isEdge = true
      isStart = true
    }

    if (end && isSelectionAtBlockEnd(editor)) {
      isEdge = true
    }

    if (isEdge && isExpanded(editor.selection)) {
      editor.deleteFragment()
    }
  }

  return {
    queryEdge,
    isEdge,
    isStart,
  }
}
