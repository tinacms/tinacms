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
import styled from 'styled-components'
import { radius, color } from '@tinacms/styles'
import { SIDEBAR_MIN_WIDTH, Z_INDEX } from '../Globals'

interface ResizerBarProps {
  resizerBarWidth: number
  open: boolean
  sideBarWidth: number
  setSideBarWidth: (nr: number) => void
}

export const ResizerBar = ({
  resizerBarWidth,
  open,
  sideBarWidth,
  setSideBarWidth,
}: ResizerBarProps) => {
  const [barPos, setBarPos] = React.useState(sideBarWidth - resizerBarWidth / 2)
  const isResizing: any = React.useRef()

  const resize = (e: any) => {
    e.preventDefault()
    if (isResizing.current) {
      setBarPos(e.clientX - resizerBarWidth / 2)
    }
  }

  const handleMouseUp = (e: any) => {
    console.log('removing eventlistener')
    isResizing.current = false
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('mouseup', handleMouseUp)
    if (e.clientX <= SIDEBAR_MIN_WIDTH) {
      setSideBarWidth(SIDEBAR_MIN_WIDTH)
      setBarPos(SIDEBAR_MIN_WIDTH - resizerBarWidth / 2)
    } else {
      setSideBarWidth(e.clientX)
    }
  }

  const handleMouseDown = () => {
    console.log('adding eventlistener')
    isResizing.current = true
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <Resizer
      onMouseDown={handleMouseDown}
      resizerBarWidth={resizerBarWidth}
      xPos={barPos}
      open={open}
      isResizing={isResizing.current}
    >
      <Handle />
    </Resizer>
  )
}

const Resizer = styled.div<{
  resizerBarWidth: number
  xPos: number
  open: boolean
  isResizing: boolean
}>`
  display: flex;
  align-items: center;
  cursor: pointer;
  background: ${p =>
    p.isResizing
      ? 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)) no-repeat center/1px 100%'
      : 'transparent'};
  width: ${p => p.resizerBarWidth}px;
  height: 100%;
  position: fixed;
  border-radius: 20px;
  left: ${p => (!p.open ? -p.resizerBarWidth : p.xPos)}px;
  z-index: ${Z_INDEX + 1};
  transition: ${p =>
    // Don't apply the transition when we're resizing
    p.isResizing ? 'none' : `all ${p.open ? 150 : 200}ms ease-out`};
`

const Handle = styled.div`
  position: relative;
  background: ${color.primary()};
  border-radius: ${radius()};
  width: 20px;
  height: 20px;

  :before,
  :after {
    content: '';
    width: 0;
    height: 12px;
    position: absolute;
    top: 4px;
  }

  :before {
    border-left: 1px solid #fff;
    left: 3px;
  }

  :after {
    border-right: 1px solid #fff;
    right: 3px;
  }
`
