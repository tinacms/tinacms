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

import { InlineSettings } from '../inline-settings'
import { useInlineForm } from '../inline-form'
import { FocusRing } from '../styles'
import { InlineFieldContext } from '../inline-field-context'
import {
  BlockMenu,
  BlockMenuWrapper,
} from '../blocks/inline-block-field-controls'
import { useContext } from 'react'

interface InlineGroupControls {
  children: any
  offset?: number
  borderRadius?: number
}

export function InlineGroupControls({
  children,
  offset,
  borderRadius,
}: InlineGroupControls) {
  const { status, focussedField, setFocussedField } = useInlineForm()
  const { name = '' } = useContext(InlineFieldContext)
  const groupRef = React.useRef<HTMLDivElement>(null)
  const groupMenuRef = React.useRef<HTMLDivElement>(null)
  const { fields } = React.useContext(InlineFieldContext)

  if (status === 'inactive') {
    return children
  }

  const active = !!(focussedField && name && name === focussedField)
  const childIsActive = focussedField.startsWith(name)

  const handleSetActive = (event: any) => {
    if (!name || active || childIsActive) return
    setFocussedField(name)
    event.stopPropagation()
    event.preventDefault()
  }

  return (
    <FocusRing
      ref={groupRef}
      active={active}
      onClick={handleSetActive}
      offset={offset}
      borderRadius={borderRadius}
      disableHover={childIsActive}
    >
      <BlockMenuWrapper ref={groupMenuRef} offset={offset} active={active}>
        <BlockMenu>
          <InlineSettings fields={fields} />
        </BlockMenu>
      </BlockMenuWrapper>
      <GroupChildren disableClick={!name || (!active && !childIsActive)}>
        {children}
      </GroupChildren>
    </FocusRing>
  )
}

const GroupChildren = styled.div<{ disableClick: boolean }>(
  ({ disableClick }) => css`
    ${disableClick && `pointer-events: none;`};
  `
)
