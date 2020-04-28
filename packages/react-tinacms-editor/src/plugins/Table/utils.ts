/**

Copyright 2019 Forestry.io Inc

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

import { TableMap, CellSelection } from 'prosemirror-tables'
import { ContentNodeWithPos } from 'prosemirror-utils'
import { Node } from 'prosemirror-model'
import { EditorState, Selection } from 'prosemirror-state'
import { Decoration } from 'prosemirror-view'

export const buildCellSelection = (
  pos: number,
  classes: String,
  tableMap: TableMap,
  table: ContentNodeWithPos,
  state: EditorState
): CellSelection | void => {
  if (classes.includes('tina_table_header_ext_top_left'))
    return buildTableSelection(pos, tableMap, table, state.doc)
  if (classes.includes('tina_table_header_ext_left'))
    return buildColumnSelection(pos, tableMap, table, state.doc)
  if (classes.includes('tina_table_header_ext_top'))
    return buildRowSelection(pos, tableMap, table, state.doc)
}

const buildColumnSelection = (
  pos: number,
  tableMap: TableMap,
  table: ContentNodeWithPos,
  doc: Node
): CellSelection => {
  const { width } = tableMap
  const colStart = tableMap.map.findIndex(
    (c: number) => c === pos - table.start
  )
  return new CellSelection(
    doc.resolve(tableMap.map[colStart + width - 1] + table.start),
    doc.resolve(pos)
  )
}

const buildRowSelection = (
  pos: number,
  tableMap: TableMap,
  table: ContentNodeWithPos,
  doc: Node
): CellSelection => {
  const { width, height } = tableMap
  const rowStart = tableMap.map.findIndex(
    (c: number) => c === pos - table.start
  )
  return new CellSelection(
    doc.resolve(tableMap.map[rowStart + width * (height - 1)] + table.start),
    doc.resolve(pos)
  )
}

const buildTableSelection = (
  pos: number,
  tableMap: TableMap,
  table: ContentNodeWithPos,
  doc: Node
): CellSelection =>
  new CellSelection(
    doc.resolve(tableMap.map[tableMap.map.length - 1] + table.start),
    doc.resolve(pos)
  )

export const buildExtendedHeaders = (
  tableNode: ContentNodeWithPos,
  selection: Selection
): Decoration[] => {
  const tableMap = TableMap.get(tableNode.node)
  const colSelection =
    (selection as any).isColSelection && (selection as any).isColSelection()
  const rowSelection =
    (selection as any).isRowSelection && (selection as any).isRowSelection()

  let decorations = buildExtendedTableHeaders(
    tableNode,
    colSelection,
    rowSelection
  )
  decorations = [
    ...decorations,
    ...buildExtendedColumnHeaders(tableNode, tableMap, selection, colSelection),
  ]
  decorations = [
    ...decorations,
    ...buildExtendedRowHeaders(tableNode, tableMap, selection, rowSelection),
  ]
  return decorations
}

const buildExtendedColumnHeaders = (
  tableNode: ContentNodeWithPos,
  tableMap: TableMap,
  selection: Selection,
  colSelection: boolean
): Decoration[] => {
  const decorations: Decoration[] = []
  const cellMap = tableMap.map
  for (let i = 0; i < tableMap.width; i++) {
    const div = document.createElement('div')
    div.classList.add('tina_table_header_ext_top')
    if (
      colSelection &&
      selection.ranges.some(
        r => r.$from.pos === tableNode.start + cellMap[i] + 1
      )
    ) {
      div.classList.add('tina_table_header_ext_top_selected')
    }
    decorations.push(Decoration.widget(tableNode.start + cellMap[i] + 1, div))
  }
  return decorations
}

const buildExtendedRowHeaders = (
  tableNode: ContentNodeWithPos,
  tableMap: TableMap,
  selection: Selection,
  rowSelection: boolean
): Decoration[] => {
  const decorations: Decoration[] = []
  const cellMap = tableMap.map

  for (let i = 0; i < tableMap.height; i++) {
    const div = document.createElement('div')
    div.classList.add('tina_table_header_ext_left')
    if (
      rowSelection &&
      selection.ranges.some(
        r => r.$from.pos === tableNode.start + cellMap[i * tableMap.width] + 1
      )
    ) {
      div.classList.add('tina_table_header_ext_left_selected')
    }
    decorations.push(
      Decoration.widget(tableNode.start + cellMap[i * tableMap.width] + 1, div)
    )
  }
  return decorations
}

const buildExtendedTableHeaders = (
  tableNode: ContentNodeWithPos,
  colSelection: boolean,
  rowSelection: boolean
): Decoration[] => {
  const decorations: Decoration[] = []
  const div = document.createElement('div')
  div.classList.add('tina_table_header_ext_top_left')
  if (colSelection && rowSelection) {
    div.classList.add('tina_table_header_ext_top_left_selected')
  }
  decorations.push(Decoration.widget(tableNode.start + 2, div))
  return decorations
}
