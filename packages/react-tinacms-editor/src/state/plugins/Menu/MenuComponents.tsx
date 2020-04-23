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
import { useMenuPortal } from '../../../context/MenuPortal'

const MenuItem = css`
  flex: 1 1 32px;
`

export const MenuButton = styled.button<{
  active?: boolean
  disabled?: boolean
  bottom?: boolean
  ref?: any
}>`
  ${MenuItem}
  background-color: ${p =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${p =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  fill: ${p =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  border: 1px solid var(--tina-color-grey-2);
  margin: -1px;
  outline: none;
  padding: 6px 4px;
  transition: all 85ms ease-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  svg {
    width: 20px;
    height: 20px;
  }
  ${props =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`

export const MenuButtonDropdown = styled(
  ({ children, open, triggerRef, innerRef, ...styleProps }) => {
    const MenuPortal = useMenuPortal()
    const menuPortalRef = React.useRef<HTMLDivElement | null>(null)

    const menuOffset = React.useMemo(() => {
      if (!triggerRef.current || !menuPortalRef.current) return 0
      const menuDropdownBoundingBox = triggerRef.current.getBoundingClientRect()
      const menuPortalBoundingBox = menuPortalRef.current.getBoundingClientRect()
      return menuDropdownBoundingBox.x - menuPortalBoundingBox.x
    }, [triggerRef.current, menuPortalRef.current])

    return (
      <MenuPortal>
        <Offset offset={menuOffset}>
          <div ref={menuPortalRef} {...styleProps}>
            {children}
          </div>
        </Offset>
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

export const MenuOption = styled.div<{ disabled: boolean; active: boolean }>`
  display: block;
  padding: 8px 16px;
  transition: all 85ms ease-out;
  cursor: pointer;
  &:first-child {
    padding-top: var(--tina-padding-small);
  }
  &:last-child {
    padding-bottom: var(--tina-padding-small);
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
    color: var(--tina-color-primary);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  ${props =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
`
