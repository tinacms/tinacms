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
import { InlineGroupSettings } from './inline-group-settings'
import { useInlineForm } from '../inline-form'
import { Button, IconButton } from '@tinacms/styles'

// TODO: children type should be more specific
export function InlineGroupControls({ children }: any) {
  const { status } = useInlineForm()
  const [active, setActive] = React.useState(false)
  const groupRef = React.useRef<HTMLDivElement>(null)
  const groupMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [groupRef.current, groupMenuRef.current])

  if (status === 'inactive') {
    return children
  }

  const handleClickOutside = (event: any) => {
    if (
      groupRef.current?.contains(event.target) ||
      groupMenuRef.current?.contains(event.target)
    ) {
      return
    }
    setActive(false)
  }

  const handleSetActive = () => {
    if (active) return
    setActive(true)
  }

  return (
    <GroupWrapper ref={groupRef} active={active} onClick={handleSetActive}>
      <GroupMenu ref={groupMenuRef}>
        <InlineGroupSettings />
      </GroupMenu>
      {children}
    </GroupWrapper>
  )
}

export interface GroupWrapperProps {
  active: boolean
}

const GroupWrapper = styled.div<GroupWrapperProps>`
  position: relative;

  &:hover {
    &:after {
      opacity: 0.3;
    }
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -16px;
    top: -16px;
    width: calc(100% + 2rem);
    height: calc(100% + 2rem);
    border: 3px solid var(--tina-color-primary);
    border-radius: var(--tina-radius-big);
    opacity: 0;
    pointer-events: none;
    transition: all var(--tina-timing-medium) ease-out;
  }

  ${p =>
    p.active &&
    css`
      ${GroupMenu} {
        transform: translate3d(0, -100%, 0);
        opacity: 1;
        pointer-events: all;
      }

      &:after {
        opacity: 1 !important;
      }
    `};
`

const GroupMenu = styled.div`
  position: absolute;
  top: -1.5rem;
  right: -4px;
  left: -4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  opacity: 0;
  transform: translate3d(0, 0, 0);
  transition: all 120ms ease-out;
  pointer-events: none;

  ${Button} {
    height: 34px;
    margin: 0 4px;
  }

  ${IconButton} {
    width: 34px;
    height: 34px;
    margin: 0 4px;
  }
`
