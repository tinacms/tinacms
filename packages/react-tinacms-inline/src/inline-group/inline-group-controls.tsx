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
import { InlineFieldContext } from '../inline-field-context'
import {
  BlockMenu,
  BlockMenuWrapper,
} from '../blocks/inline-block-field-controls'
import { FocusRingOptions, StyledFocusRing } from '../styles'
import { useInlineForm } from '..'

interface InlineGroupControls {
  name: string
  children: any
  insetControls?: boolean
  focusRing?: boolean | FocusRingOptions
}

export function InlineGroupControls({
  name,
  children,
  insetControls,
  focusRing = {},
}: InlineGroupControls) {
  const cms = useCMS()
  const groupMenuRef = React.useRef<HTMLDivElement>(null)
  const { fields } = React.useContext(InlineFieldContext)
  const [active, setActive] = React.useState(false)
  const [childActive, setChildActive] = React.useState(false)
  const { focussedField, setFocussedField } = useInlineForm()
  const focusRingRef = React.useRef<HTMLDivElement>(null)
  const borderRadius =
    typeof focusRing === 'object' ? focusRing.borderRadius : undefined
  const offset = typeof focusRing === 'object' ? focusRing.offset : undefined

  React.useEffect(() => {
    if (!focusRing || !name) return
    setActive(name === focussedField)
    setChildActive(focussedField.startsWith(name!))
  }, [name, focusRing, focussedField])

  const updateFocusedField = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    if (active || !name) return
    setFocussedField(name)
  }

  if (cms.disabled) {
    return children
  }

  return (
    <StyledFocusRing
      ref={focusRingRef}
      active={focusRing && active}
      onClick={updateFocusedField}
      offset={offset}
      borderRadius={borderRadius}
      disableHover={focusRing === false ? true : childActive}
      disableChildren={!active && !childActive}
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
    </StyledFocusRing>
  )
}
