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

import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { NodeType, Fragment, Node } from 'prosemirror-model'

type Dispatch = typeof EditorView.prototype.dispatch

const createCell = (
  cellType: NodeType,
  cellContent?: Fragment | Node | Array<Node>
) => {
  if (cellContent) return cellType.createChecked(null, cellContent)
  return cellType.createAndFill()
}

export const insertTable = (
  state: EditorState,
  dispatch: Dispatch
): boolean => {
  if (!dispatch) return true
  const {
    table_cell: tableCell,
    table_header: tableHeader,
    table_row: tableRow,
    table,
  } = state.schema.nodes

  const rowsCount = 3
  const colsCount = 3
  const cells = []
  const headerCells = []
  for (let i = 0; i < colsCount; i += 1) {
    headerCells.push(createCell(tableHeader))
    cells.push(createCell(tableCell))
  }
  const rows = []
  for (let i = 0; i < rowsCount; i += 1) {
    // @ts-ignore
    rows.push(tableRow.createChecked(null, i === 0 ? headerCells : cells))
  }

  const newTable = table.createChecked(null, rows)
  const { selection, tr } = state
  const { $from, $to } = selection
  const start = $from.pos - 1
  const end = $to.pos < state.doc.content.size ? $to.pos + 1 : $to.pos
  dispatch(
    tr
      .replaceWith(start, end, newTable)
      .setSelection(new TextSelection(tr.doc.resolve($from.pos + 1)))
      .scrollIntoView()
  )
  return true
}
