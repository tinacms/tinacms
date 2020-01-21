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

import React, { useState, HTMLAttributes } from 'react'
import * as ReactDOM from 'react-dom'
import { EditorView } from 'prosemirror-view'
import { addColumnAfter } from 'prosemirror-tables'
import { AddIcon } from '@tinacms/icons'
import styled from 'styled-components'

interface FloatingTableAddMenu {
  view: EditorView
}

export default (props: FloatingTableAddMenu) => {
  const { state, dispatch } = props.view
  const markerDivTable = document.getElementsByClassName(
    'tina_table_header_ext_top_left'
  )
  if (!markerDivTable.length) return null
  const tableElm = markerDivTable[0].closest('table')
  if (!tableElm) return null
  const { height: tableHeight } = tableElm.getBoundingClientRect()
  const markerDivCol = document.getElementsByClassName(
    'tina_table_header_ext_top'
  )
  const markerDivRow = document.getElementsByClassName(
    'tina_table_header_ext_left'
  )
  if (!markerDivCol.length && !markerDivRow.length) return null
  const [hovered, setHovered] = useState(false)
  const addColumn = (pos: number) => {
    addColumnAfter(state, dispatch)
  }
  return (
    <>
      {markerDivCol &&
        ReactDOM.createPortal(
          <>
            <Wrapper
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {hovered ? (
                <IconWrapper onClick={() => addColumn(1)}>
                  <AddIcon />
                </IconWrapper>
              ) : (
                <Pointer />
              )}
            </Wrapper>
            {hovered && <ColumnDivider height={tableHeight}></ColumnDivider>}
          </>,
          markerDivCol[0]
        )}
    </>
  )
}

const Wrapper = styled.div`
  left: 100%;
  margin-left: -10px;
  position: absolute;
  top: -24px;
  padding: 8px;
`

const Pointer = styled.div`
  background: #e1ddec;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`

const IconWrapper = styled.span`
  left: -7px;
  position: absolute;
  top: -12px;
`

const ColumnDivider = styled.div<
  HTMLAttributes<HTMLDivElement> & { height: number }
>`
  position: absolute;
  width: 2px;
  background: #0574e4;
  left: calc(100% - 2px);
  transform: translateZ(10px);
  z-index: 1000;
  top: -4px;
  height: ${({ height }) => `${height + 15}px`};
`
