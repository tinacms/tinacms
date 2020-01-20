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

import { TrashIcon } from '@tinacms/icons'
import styled from 'styled-components'

interface FloatingTableMenuProps {
  view: EditorView
}

export const FloatingTableMenu = (props: FloatingTableMenuProps) => {
  const { state, dispatch } = props.view
  const markerDivTable = document.getElementsByClassName(
    'tina_table_header_ext_top_left_selected'
  )[0]
  if (markerDivTable) return null
  const markerDivCol = document.getElementsByClassName(
    'tina_table_header_ext_top_selected'
  )[0]
  const markerDivRow = document.getElementsByClassName(
    'tina_table_header_ext_left_selected'
  )[0]
  if (!markerDivCol && !markerDivRow) return null
  return (
    <>
      {markerDivCol &&
        ReactDOM.createPortal(
          <IconWrapperCol onClick={() => deleteColumn(state, dispatch)}>
            <TrashIcon />
          </IconWrapperCol>,
          markerDivCol
        )}
      {markerDivRow &&
        ReactDOM.createPortal(
          <IconWrapperRow onClick={() => deleteRow(state, dispatch)}>
            <TrashIcon />
          </IconWrapperRow>,
          markerDivRow
        )}
    </>
  )
}

const IconWrapperCol = styled.span`
  left: 50%;
  margin-left: -16px;
  position: absolute;
  top: -30px;
`

const IconWrapperRow = styled.span`
  left: -30px;
  margin-top: -18px;
  position: absolute;
  top: 50%;
`
