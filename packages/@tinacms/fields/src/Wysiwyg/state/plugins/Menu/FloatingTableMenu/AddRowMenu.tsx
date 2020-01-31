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
import { addRowAt } from 'prosemirror-utils'
import { AddIcon } from '@tinacms/icons'
import { IconButton } from '@tinacms/styles'
import styled from 'styled-components'

const borderWidth = 1
const controlSize = 12

interface AddRowMenuProps {
  index: number
  marker: HTMLElement
  tableWidth: number
  view: EditorView
}

export default ({ index, marker, tableWidth, view }: AddRowMenuProps) => {
  const { state, dispatch } = view
  const addRow = (pos: number) => {
    if (pos > 1) dispatch(addRowAt(pos, true)(state.tr))
    view.focus()
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
        {hovered && index > 0 ? (
          <IconWrapperRow>
            <IconButton onClick={() => addRow(index)} small primary>
              <AddIcon />
            </IconButton>
          </IconWrapperRow>
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
  left: -7px;
  position: absolute;
  bottom: 0;
  padding: 8px;
  transform: translate3d(-100%, 50%, 0);
  user-select: none;
`

const Pointer = styled.div`
  background: #e1ddec;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`

const IconWrapperRow = styled.span`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate3d(-50%, -50%, 0);
`

const ColumnDivider = styled.div<
  HTMLAttributes<HTMLDivElement> & { width: number }
>`
  position: absolute;
  background: #0574e4;
  left: ${-1 * borderWidth}px;
  z-index: 1000;
  bottom: ${-1 * borderWidth}px;
  height: ${2 * borderWidth}px;
  width: ${({ width }) => `${width + controlSize - borderWidth}px`};
`
