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
import { FocusRing } from '../styles'
import { InlineFieldContext } from '../inline-field-context'
import {
  BlockMenu,
  BlockMenuWrapper,
} from '../blocks/inline-block-field-controls'
import { FocusRingOptions, FocusRingContext } from '../styles'

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
  const focusContext = React.useContext(FocusRingContext)
  const groupMenuRef = React.useRef<HTMLDivElement>(null)
  const { fields } = React.useContext(InlineFieldContext)

  if (cms.disabled) {
    return children
  }

  return (
    <FocusRing name={name} options={focusRing}>
      <BlockMenuWrapper
        ref={groupMenuRef}
        offset={focusContext.offset}
        inset={insetControls}
        active={focusContext.active}
      >
        <BlockMenu>
          <InlineSettings fields={fields} />
        </BlockMenu>
      </BlockMenuWrapper>
      {children}
    </FocusRing>
  )
}
