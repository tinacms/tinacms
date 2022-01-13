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

import React, { useState, useEffect, HTMLAttributes } from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'
import { IconButton } from '@einsteinindustries/tinacms-styles'
import { EditorView } from 'prosemirror-view'
import { addColumnAt } from 'prosemirror-utils'
import { AddIcon } from '@einsteinindustries/tinacms-icons'

const borderWidth = 1
const controlSize = 12

interface AddColumnProps {
  index: number
  marker: HTMLElement
  tableHeight: number
  view: EditorView
}

export default ({ index, marker, tableHeight, view }: AddColumnProps) => {
  const { state, dispatch } = view
  const addColumn = (pos: number) => {
    dispatch(addColumnAt(pos)(state.tr))
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
        {hovered ? (
          <IconWrapperCol>
            <IconButton
              onClick={() => {
                addColumn(index)
                setHovered(false)
              }}
              small
              primary
            >
              <AddIcon />
            </IconButton>
          </IconWrapperCol>
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
  top: -7px;
  position: absolute;
  right: 0;
  padding: 8px;
  transform: translate3d(50%, -100%, 0);
  user-select: none;
`

const Pointer = styled.div`
  background: #e1ddec;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`

const IconWrapperCol = styled.span`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
`

const ColumnDivider = styled.div<
  HTMLAttributes<HTMLDivElement> & { height: number }
>`
  position: absolute;
  background: #0574e4;
  top: ${-1 * borderWidth}px;
  z-index: 1000;
  right: ${-1 * borderWidth}px;
  width: ${2 * borderWidth}px;
  height: ${({ height }) => `${height + controlSize - borderWidth}px`};
`
