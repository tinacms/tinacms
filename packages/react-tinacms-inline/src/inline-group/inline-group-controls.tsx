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

import { InlineSettings } from '../inline-settings'
import { useInlineForm } from '../inline-form'
import { FocusRing } from '../styles'
import { InlineFieldContext } from '../inline-field-context'
import {
  BlockMenu,
  BlockMenuWrapper,
} from '../blocks/inline-block-field-controls'

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
  const { status } = useInlineForm()
  const [active, setActive] = React.useState(false)
  const groupRef = React.useRef<HTMLDivElement>(null)
  const groupMenuRef = React.useRef<HTMLDivElement>(null)
  const { fields } = React.useContext(InlineFieldContext)

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
      <BlockMenuWrapper ref={groupMenuRef} offset={offset} active={active}>
        <BlockMenu>
          <InlineSettings fields={fields} />
        </BlockMenu>
      </BlockMenuWrapper>
      {children}
    </FocusRing>
  )
}
