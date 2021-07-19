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

import * as React from 'react'
import styled, { createGlobalStyle } from 'styled-components'

export const ResizeHandle = () => {
  const [mouseDown, setMouseDown] = React.useState(false)
  /* Only set sidebar width once resized; otherwise default to CSS width */
  const [sidebarWidth, setSidebarWidth] = React.useState(null)

  const pxToNumber = (string: string) => {
    return parseInt(string.replace('px', ''), 10)
  }

  React.useEffect(() => {
    const handleMouseUp = () => setMouseDown(false)

    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  React.useEffect(() => {
    const handleMouseMove = (e: any) => {
      setSidebarWidth((sidebarWidth) => {
        /* Get value from CSS if sidebarWidth isn't set yet */
        const newWidth = sidebarWidth
          ? sidebarWidth + e.movementX
          : pxToNumber(
              window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--tina-sidebar-width')
            ) + e.movementX
        const minWidth = 250
        const maxWidth = window.innerWidth - 64

        if (newWidth < minWidth) {
          return minWidth
        } else if (newWidth > maxWidth) {
          return maxWidth
        } else {
          return newWidth
        }
      })
    }

    if (mouseDown) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseDown])

  const handleMouseDown = () => setMouseDown(true)

  return (
    <>
      <Handle onMouseDown={handleMouseDown}></Handle>
      <GlobalStyles blockSelect={mouseDown} width={sidebarWidth} />
    </>
  )
}

const Handle = styled.div`
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
`

export const GlobalStyles = createGlobalStyle<{
  width: number | null
  blockSelect: boolean
}>`
  ${({ width }) =>
    width &&
    `
    :root {
      --tina-sidebar-width: ${width + `px`};
    }
  `}

  ${({ blockSelect }) =>
    blockSelect &&
    `
  * {
  -webkit-user-select: none;  
  -moz-user-select: none;    
  -ms-user-select: none;      
  user-select: none;
  }
  `}
`
