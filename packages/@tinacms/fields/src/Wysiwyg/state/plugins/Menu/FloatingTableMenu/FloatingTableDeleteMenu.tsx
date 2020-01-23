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

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { EditorView } from 'prosemirror-view'
import { deleteColumn, deleteRow } from 'prosemirror-tables'
import { IconButton } from '@tinacms/styles'
import { TrashIcon } from '@tinacms/icons'
import styled from 'styled-components'

interface FloatingTableDeleteMenuProps {
  view: EditorView
}

export default (props: FloatingTableDeleteMenuProps) => {
  const { state, dispatch } = props.view
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
  return (
    <>
      {markerDivCol &&
        ReactDOM.createPortal(
          <IconWrapperCol>
            <IconButton
              onClick={() => deleteColumn(state, dispatch)}
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
              onClick={() => deleteRow(state, dispatch)}
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
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translate3d(-50%, -100%, 0);
`

const IconWrapperRow = styled.span`
  position: absolute;
  top: 50%;
  left: -8px;
  transform: translate3d(-100%, -50%, 0);
`
