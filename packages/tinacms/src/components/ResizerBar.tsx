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
import {
  radius,
  color,
} from '@tinacms/styles'

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
  const [isResizing, setIsResizing] = React.useState(false)
  const [barPos, setBarPos] = React.useState(sideBarWidth - resizerBarWidth/2)

  const handleResizeMouseDown = () => {
    setIsResizing(true)
  }

  React.useEffect(() => {
    const resize = (e: any) => {
      e.preventDefault()
      if (isResizing) {
        setBarPos(e.clientX - resizerBarWidth / 2)
      }
    }

    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', (e: any) => {
      document.removeEventListener('mousemove', resize)
      setIsResizing(false)
      setSideBarWidth(e.clientX)
    })
  }, [isResizing])

  return (
    <Resizer
      onMouseDown={handleResizeMouseDown}
      resizerBarWidth={resizerBarWidth}
      xPos={barPos}
      open={open}
      isResizing={isResizing}
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
  background: ${p =>
    p.isResizing
      ? 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)) no-repeat center/1px 100%'
      : 'transparent'};
  width: ${p => p.resizerBarWidth}px;
  height: 100%;
  position: fixed;
  border-radius: 20px;
  left: ${p => (!p.open ? -p.resizerBarWidth : p.xPos)}px;
  z-index: 2147000001;
  transition: ${p =>
    // Don't apply the transition when we're resizing
    p.isResizing ? 'none' : `all ${p.open ? 150 : 200}ms ease-out`};
`

const Handle = styled.div`
  background: ${color.primary()};
  border-radius: ${radius()};
  width: 20px;
  height: 20px;
`
