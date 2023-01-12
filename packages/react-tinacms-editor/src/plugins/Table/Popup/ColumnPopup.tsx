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

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'
import { EditorView } from 'prosemirror-view'
import { deleteColumn, deleteRow, TableMap } from 'prosemirror-tables'
import {
  findParentNodeOfType,
  forEachCellInColumn,
  setCellAttrs,
} from 'prosemirror-utils'
import { IconButton } from '@einsteinindustries/tinacms-styles'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  TrashIcon,
} from '@einsteinindustries/tinacms-icons'

import { useEditorStateContext } from '../../../context/editorState'

const alignColumn = (view: EditorView, alignValue: string) => {
  const { state, dispatch } = view
  const { selection } = state
  const { table, table_cell, table_header } = state.schema.nodes
  const tableCell = findParentNodeOfType(table_cell)(state.selection)
  const tableHeader = findParentNodeOfType(table_header)(state.selection)
  const cellNode = tableCell || tableHeader
  if (!cellNode) return
  const align =
    cellNode.node.attrs.align === alignValue ? undefined : alignValue
  const tableNode = findParentNodeOfType(table)(state.selection)
  if (!tableNode) return
  const tableMap = TableMap.get(tableNode.node)
  const pos = Object.entries(tableMap.map).find(
    entry => entry[1] > selection.head - tableNode.start
  )
  if (!pos) return
  const cellPos = parseInt(pos[0]) - 1
  const columnPos = cellPos % tableMap.width
  dispatch(
    forEachCellInColumn(columnPos, (cell, tr) => {
      return setCellAttrs(cell, { align })(tr)
    })(state.tr)
  )
  view.focus()
}

export default () => {
  const { editorView } = useEditorStateContext()
  if (!editorView) return null
  const { state, dispatch } = editorView.view
  const markerDivTable = document.getElementsByClassName(
    'tina_table_header_ext_top_left_selected'
  )[0]
  if (markerDivTable) return null
  const markerDivCol = document.getElementsByClassName(
    'tina_table_header_ext_top_selected'
  )[0]
  const markerDivRows = document.getElementsByClassName(
    'tina_table_header_ext_left'
  )
  let markerDivRow
  for (let i = 1; i < markerDivRows.length; i++) {
    if (
      markerDivRows[i].classList.contains('tina_table_header_ext_left_selected')
    )
      markerDivRow = markerDivRows[i]
  }
  if (!markerDivCol && !markerDivRow) return null
  const { view } = editorView
  return (
    <>
      {markerDivCol &&
        ReactDOM.createPortal(
          <IconWrapperCol>
            <IconButton onClick={() => alignColumn(view, 'left')} small primary>
              <AlignLeft />
            </IconButton>
            <IconButton
              onClick={() => alignColumn(view, 'center')}
              small
              primary
            >
              <AlignCenter />
            </IconButton>
            <IconButton
              onClick={() => alignColumn(view, 'right')}
              small
              primary
            >
              <AlignRight />
            </IconButton>
            <IconButton
              onClick={() => {
                deleteColumn(state, dispatch)
                view.focus()
              }}
              small
              primary
            >
              <TrashIcon />
            </IconButton>
          </IconWrapperCol>,
          markerDivCol
        )}
      {markerDivRow &&
        ReactDOM.createPortal(
          <IconWrapperRow>
            <IconButton
              onClick={() => {
                deleteRow(state, dispatch)
                view.focus()
              }}
              small
              primary
            >
              <TrashIcon />
            </IconButton>
          </IconWrapperRow>,
          markerDivRow
        )}
    </>
  )
}

const IconWrapperCol = styled.span`
  display: flex;
  left: 50%;
  position: absolute;
  top: -8px;
  transform: translate3d(-50%, -100%, 0);
  button:not(:first-of-type) {
    margin-left: 10px;
  }
`

const IconWrapperRow = styled.span`
  position: absolute;
  top: 50%;
  left: -8px;
  transform: translate3d(-100%, -50%, 0);
`
