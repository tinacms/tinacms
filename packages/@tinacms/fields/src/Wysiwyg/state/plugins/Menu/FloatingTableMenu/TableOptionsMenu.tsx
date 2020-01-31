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

import React from 'react'
import ReactDOM from 'react-dom'
import { EditorView } from 'prosemirror-view'
import { deleteTable, TableMap } from 'prosemirror-tables'
import styled from 'styled-components'
import {
  findParentNodeOfType,
  forEachCellInColumn,
  setCellAttrs,
} from 'prosemirror-utils'

import { AlignCenter, AlignLeft, AlignRight, TrashIcon } from '@tinacms/icons'
import { IconButton } from '@tinacms/styles'

interface TableOptionsMenu {
  view: EditorView
}

const alignColumn = (view: EditorView, align: string) => {
  const { state, dispatch } = view
  const { selection } = state
  const { table } = state.schema.nodes
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
    forEachCellInColumn(columnPos, (cell, tr) =>
      setCellAttrs(cell, { align })(tr)
    )(state.tr)
  )
  view.focus()
}

export default ({ view }: TableOptionsMenu) => {
  const deleteSelectedTable = () => {
    const { state, dispatch } = view
    deleteTable(state, dispatch)
    view.focus()
  }
  const markerDivTable = document.getElementsByClassName(
    'tina_table_header_ext_top_left'
  )
  if (!markerDivTable.length) return null
  const tableElm = markerDivTable[0].closest('table')
  if (!tableElm) return null
  const { height, width } = tableElm.getBoundingClientRect()
  return ReactDOM.createPortal(
    <Wrapper height={height} width={width}>
      <IconButton onClick={() => alignColumn(view, 'left')} small primary>
        <AlignLeft />
      </IconButton>
      <IconButton onClick={() => alignColumn(view, 'center')} small primary>
        <AlignCenter />
      </IconButton>
      <IconButton onClick={() => alignColumn(view, 'right')} small primary>
        <AlignRight />
      </IconButton>
      <IconButton onClick={deleteSelectedTable} small primary>
        <TrashIcon />
      </IconButton>
    </Wrapper>,
    markerDivTable[0]
  )
}

const Wrapper = styled.div<
  React.HTMLAttributes<HTMLDivElement> & { height: number; width: number }
>`
  background-color: #ffffff;
  border-radius: 2px;
  display: flex;
  cursor: default;
  padding: 0px 4px;
  position: absolute;
  top: ${({ height }) => `${height + 24}px`};
  left: ${({ width }) => `${width / 2 - 64}px`};
  button:not(:first-of-type) {
    margin-left: 10px;
  }
`
