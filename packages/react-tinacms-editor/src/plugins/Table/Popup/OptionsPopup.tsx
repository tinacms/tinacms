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

import React from 'react'
import ReactDOM from 'react-dom'
import { deleteTable } from 'prosemirror-tables'
import styled from 'styled-components'

import { TrashIcon } from '@einsteinindustries/tinacms-icons'
import { IconButton } from '@einsteinindustries/tinacms-styles'

import { useEditorStateContext } from '../../../context/editorState'

export default () => {
  const { editorView } = useEditorStateContext()
  if (!editorView) return null
  const { view } = editorView
  const deleteSelectedTable = () => {
    const { state, dispatch } = view
    deleteTable(state, dispatch)
    view.focus()
  }
  const markerDivTable = document.getElementsByClassName(
    'tina_table_header_ext_top_left_selected'
  )
  if (!markerDivTable.length) return null
  const tableElm = markerDivTable[0].closest('table')
  if (!tableElm) return null
  const { height, width } = tableElm.getBoundingClientRect()
  return ReactDOM.createPortal(
    <Wrapper height={height} width={width}>
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
  cursor: default;
  padding: 0px 4px;
  position: absolute;
  top: ${({ height }) => `${height + 24}px`};
  left: ${({ width }) => `${width / 2 - 8}px`};
`
