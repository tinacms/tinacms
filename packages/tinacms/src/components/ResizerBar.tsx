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
import { radius, color, timing } from '@tinacms/styles'
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

  const resize = React.useCallback(
    (e: any) => {
      e.preventDefault()
      if (isResizing.current) {
        setBarPos(e.clientX - resizerBarWidth / 2)
      }
    },
    [isResizing]
  )

  const handleMouseUp = React.useCallback(
    (e: any) => {
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
    },
    [isResizing]
  )

  const handleMouseDown = React.useCallback(() => {
    console.log('adding eventlistener')
    isResizing.current = true
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', handleMouseUp)
  }, [isResizing])

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

const Handle = styled.div`
  position: relative;
  background-color: ${color.primary()};
  width: 16px;
  left: 50%;
  top: 50%;
  height: 28px;
  border-radius: ${radius('small')};
  transform: translate3d(-50%, -50%, 0);
  transition: all ${timing('short')} 150ms ease-out;
  opacity: 0;

  :before,
  :after {
    content: '';
    width: 2px;
    transform: translate3d(-50%, -50%, 0);
    height: 16px;
    top: 50%;
    position: absolute;
    background-color: ${color.grey(0)};
    border-radius: 1px;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.03);
  }

  :before {
    left: 33.33%;
  }

  :after {
    left: 66.66%;
  }
`

const Resizer = styled.div<{
  resizerBarWidth: number
  xPos: number
  open: boolean
  isResizing: boolean
}>`
  cursor: col-resize;
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

  &:hover {
    ${Handle} {
      opacity: 1;
    }
  }
`
