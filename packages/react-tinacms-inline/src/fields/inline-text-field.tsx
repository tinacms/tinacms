/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { useCMS, TinaCMS } from '@einsteinindustries/tinacms'
import { FocusRing, FocusRingOptions } from '../styles'
import { InlineField } from '..'

export interface InlineTextProps {
  name: string
  className?: string
  focusRing?: boolean | FocusRingOptions
  placeholder?: string
  children?: React.ReactChild
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
  placeholder,
  children,
}: InlineTextProps) {
  const cms: TinaCMS = useCMS()

  return (
    <InlineField name={name}>
      {({ input }) => {
        if (cms.enabled) {
          if (!focusRing) {
            return (
              <Input
                type="text"
                {...input}
                placeholder={placeholder}
                className={className}
              />
            )
          }

          return (
            /**
             * Note: We use `input.name` not `name` here because
             * the given name is only relative to the block, not
             * the absolute path in the form.
             */
            <FocusRing name={input.name} options={focusRing}>
              <Input
                type="text"
                {...input}
                placeholder={placeholder}
                className={className}
              />
            </FocusRing>
          )
        }
        return <>{children || input.value}</>
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
