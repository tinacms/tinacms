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
import { Button, IconButton } from '@tinacms/styles'

import { InlineSettings } from '../inline-settings'
import { useInlineForm } from '../inline-form'
import { FocusRing } from '../styles'

interface InlineGroupControls {
  children: any
  offset: number
  borderRadius: number
}

// TODO: children type should be more specific
export function InlineGroupControls({
  children,
  offset,
  borderRadius,
}: InlineGroupControls) {
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
    <FocusRing
      ref={groupRef}
      active={active}
      onClick={handleSetActive}
      offset={offset}
      borderRadius={borderRadius}
    >
      <GroupMenu ref={groupMenuRef} active={active}>
        <InlineSettings />
      </GroupMenu>
      {children}
    </FocusRing>
  )
}

interface GroupMenuProps {
  active: boolean
}

const GroupMenu = styled.div<GroupMenuProps>`
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

  ${p =>
    p.active &&
    css`
      transform: translate3d(0, -100%, 0);
      opacity: 1;
      pointer-events: all;
    `}
`
