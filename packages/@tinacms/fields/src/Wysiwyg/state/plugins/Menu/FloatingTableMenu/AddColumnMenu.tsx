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

import React, { useState, useEffect, HTMLAttributes } from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'
import { AddIcon } from '@tinacms/icons'
import { EditorView } from 'prosemirror-view'
import { addColumnAfter } from 'prosemirror-tables'

interface AddColumnMenuProps {
  index: number
  marker: HTMLElement
  tableHeight: number
  view: EditorView
}

export default ({ index, marker, tableHeight, view }: AddColumnMenuProps) => {
  const { state, dispatch } = view
  const addColumn = (pos: number) => {
    console.log(pos)
    addColumnAfter(state, dispatch)
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
          <IconWrapper onClick={() => addColumn(index)}>
            <AddIcon />
          </IconWrapper>
        ) : (
          <Pointer />
        )}
      </Wrapper>
      {hovered && <ColumnDivider height={tableHeight}></ColumnDivider>}
    </>,
    marker
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
  left: -6px;
  position: absolute;
  top: -12px;
`

const ColumnDivider = styled.div<
  HTMLAttributes<HTMLDivElement> & { height: number }
>`
  position: absolute;
  width: 2px;
  background: #0574e4;
  left: calc(100% - 1px);
  z-index: 1000;
  top: -6px;
  height: ${({ height }) => `${height + 17}px`};
`
