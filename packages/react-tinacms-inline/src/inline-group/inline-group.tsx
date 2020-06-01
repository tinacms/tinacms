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
import styled from 'styled-components'
import { Field } from 'tinacms'

import { InlineFieldContext } from '../inline-field-context'
import { InlineGroupControls } from './inline-group-controls'

interface InlineGroupProps {
  name?: string
  fields?: Field[]
  controls?: boolean
  offset?: number
  borderRadius?: number
  children?: any
}

export function InlineGroup({
  name,
  children,
  fields = [],
  controls = true,
  offset,
  borderRadius,
}: InlineGroupProps) {
  return (
    <InlineFieldContext.Provider value={{ name, fields }}>
      {controls ? (
        <InlineGroupControls offset={offset} borderRadius={borderRadius}>
          {children}
        </InlineGroupControls>
      ) : (
        <Wrapper>{children}</Wrapper>
      )}
    </InlineFieldContext.Provider>
  )
}

/**
 * TODO: This needs to emulate focusRing behavior
 * for consistency in edit versus preview mode
 */
const Wrapper = styled.div`
  width: 100%;
`
