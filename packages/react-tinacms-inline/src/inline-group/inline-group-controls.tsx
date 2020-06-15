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
import { useCMS } from 'tinacms'

import { InlineSettings } from '../inline-settings'
import { useInlineForm } from '../inline-form'
import { FocusRing } from '../styles'
import { InlineFieldContext } from '../inline-field-context'
import {
  BlockMenu,
  BlockMenuWrapper,
} from '../blocks/inline-block-field-controls'
import { FocusRingStyleProps } from '../styles'

interface InlineGroupControls {
  name: string
  children: any
  insetControls?: boolean
  focusRing?: false | FocusRingStyleProps
}

export function InlineGroupControls({
  name,
  children,
  insetControls,
  focusRing = {},
}: InlineGroupControls) {
  const cms = useCMS()
  const { focussedField, setFocussedField } = useInlineForm()
  const groupRef = React.useRef<HTMLDivElement>(null)
  const groupMenuRef = React.useRef<HTMLDivElement>(null)
  const { fields } = React.useContext(InlineFieldContext)

  if (cms.disabled) {
    return children
  }

  const active = name === focussedField
  const childIsActive = focussedField.startsWith(name)

  const handleSetActive = (event: any) => {
    if (active || childIsActive) return
    setFocussedField(name)
    event.stopPropagation()
    event.preventDefault()
  }

  const offset = typeof focusRing === 'object' ? focusRing.offset : undefined

  return (
    <FocusRing
      ref={groupRef}
      active={focusRing && active}
      onClick={handleSetActive}
      offset={offset}
      borderRadius={
        typeof focusRing === 'object' ? focusRing.borderRadius : undefined
      }
      disableHover={!focusRing && childIsActive}
      disableChildren={focusRing && !active && !childIsActive}
    >
      <BlockMenuWrapper
        ref={groupMenuRef}
        offset={offset}
        inset={insetControls}
        active={active}
      >
        <BlockMenu>
          <InlineSettings fields={fields} />
        </BlockMenu>
      </BlockMenuWrapper>
      {children}
    </FocusRing>
  )
}
