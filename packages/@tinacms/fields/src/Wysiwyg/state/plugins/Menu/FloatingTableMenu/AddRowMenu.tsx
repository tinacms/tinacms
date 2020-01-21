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

import React, { useEffect, useState, HTMLAttributes } from 'react'
import * as ReactDOM from 'react-dom'
import { EditorView } from 'prosemirror-view'
import { addRowAfter } from 'prosemirror-tables'
import { AddIcon } from '@tinacms/icons'
import styled from 'styled-components'

interface AddRowMenuProps {
  index: number
  marker: HTMLElement
  tableWidth: number
  view: EditorView
}

export default ({ index, marker, tableWidth, view }: AddRowMenuProps) => {
  const { state, dispatch } = view
  const addRow = (pos: number) => {
    console.log(pos)
    addRowAfter(state, dispatch)
  }
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (hovered) marker.style.zIndex = '1000'
    else marker.style.zIndex = '1'
  }, [hovered])

  return ReactDOM.createPortal(
    <>
      <Wrapper
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? (
          <IconWrapper onClick={() => addRow(index)}>
            <AddIcon />
          </IconWrapper>
        ) : (
          <Pointer />
        )}
      </Wrapper>
      {hovered && <ColumnDivider width={tableWidth}></ColumnDivider>}
    </>,
    marker
  )
}

const Wrapper = styled.div`
  left: -24px;
  position: absolute;
  top: calc(100% - 9px);
  padding: 8px;
`

const Pointer = styled.div`
  background: #e1ddec;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`

const IconWrapper = styled.span`
  left: -16px;
  position: absolute;
  top: calc(100% - 22px);
`

const ColumnDivider = styled.div<
  HTMLAttributes<HTMLDivElement> & { width: number }
>`
  position: absolute;
  width: 2px;
  background: #0574e4;
  left: calc(100% - 17px);
  z-index: 1000;
  top: 100%;
  height: 2px;
  width: ${({ width }) => `${width + 17}px`};
`
