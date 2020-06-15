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
import { useCMS, CMS } from 'tinacms'
import { InlineField } from '../inline-field'
import { InputFocusWrapper } from '../styles'

export interface InlineTextProps {
  name: string
  className?: string
  focusRing?: boolean
}

/**
 * @deprecated
 * @alias InlineText
 */
export const InlineTextField = InlineText

export function InlineText({
  name,
  className,
  focusRing = true,
}: InlineTextProps) {
  const cms: CMS = useCMS()

  return (
    <InlineField name={name}>
      {({ input }) => {
        if (cms.enabled) {
          if (!focusRing) {
            return <Input type="text" {...input} className={className} />
          }

          return (
            <InputFocusWrapper>
              <Input type="text" {...input} className={className} />
            </InputFocusWrapper>
          )
        }
        return <>{input.value}</>
      }}
    </InlineField>
  )
}

const Input = styled.input`
  width: 100%;
  display: block;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  box-sizing: border-box;
  color: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  max-width: inherit;
  background-color: inherit;
  text-align: inherit;
  outline: none;
  resize: none;
  border: none;
  overflow: visible;
  position: relative;
  -ms-overflow-style: none;
`
