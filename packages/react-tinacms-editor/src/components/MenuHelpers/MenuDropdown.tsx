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

import styled, { css } from 'styled-components'
import { useMenuPortal } from '../../context/MenuPortal'

export const MenuDropdown = styled(
  ({ children, open, triggerRef, innerRef, ...styleProps }) => {
    const MenuPortal = useMenuPortal()
    const menuPortalRef = React.useRef<HTMLDivElement | null>(null)
    const [menuOffset, setMenuOffset] = React.useState(0)

    React.useEffect(() => {
      if (triggerRef.current && menuPortalRef.current) {
        const menuDropdownBoundingBox = triggerRef.current.getBoundingClientRect()
        const menuPortalBoundingBox = menuPortalRef.current.getBoundingClientRect()
        setMenuOffset(menuDropdownBoundingBox.x - menuPortalBoundingBox.x)
      }
    }, [triggerRef.current, menuPortalRef.current])

    return (
      <MenuPortal>
        <div ref={menuPortalRef}>
          <Offset offset={menuOffset}>
            <div {...styleProps}>{children}</div>
          </Offset>
        </div>
      </MenuPortal>
    )
  }
)`
  border-radius: var(--tina-radius-small);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: -4px;
  left: 0;
  transform: translate3d(0, 100%, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 0 0;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(48, 48, 48, 0.1);
  background-color: white;
  overflow: hidden;
  z-index: 10;

  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 100%, 0) scale3d(1, 1, 1);
    `};
`

const Offset = styled.div<{ offset: number }>`
  position: absolute;
  left: ${props => props.offset}px;
`
