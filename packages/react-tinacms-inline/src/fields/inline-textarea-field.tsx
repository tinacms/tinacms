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

import React from 'react'
import styled from 'styled-components'
import { useCMS } from '@einsteinindustries/tinacms'
import { InlineField } from '../inline-field'
import TextareaAutosize from 'react-textarea-autosize'
import { InlineTextProps } from './inline-text-field'
import { FocusRing } from '../styles'

/**
 * @deprecated
 * @alias InlineTextarea
 */
export const InlineTextareaField = InlineTextarea

export function InlineTextarea({
  name,
  className,
  placeholder,
  children,
  focusRing = true,
}: InlineTextProps) {
  const cms = useCMS()

  return (
    <InlineField name={name}>
      {({ input }) => {
        if (cms.enabled) {
          if (!focusRing) {
            return (
              <Textarea
                className={className}
                {...input}
                rows={1}
                placeholder={placeholder}
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
              <Textarea
                className={className}
                {...input}
                rows={1}
                placeholder={placeholder}
              />
            </FocusRing>
          )
        }
        return <>{children || input.value}</>
      }}
    </InlineField>
  )
}

const Textarea = styled(TextareaAutosize)`
  width: 100%;
  word-wrap: break-word;
  display: block;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  box-sizing: border-box;
  color: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  margin: 0 auto;
  max-width: inherit;
  background-color: inherit;
  text-align: inherit;
  outline: none;
  resize: none;
  border: none;
  overflow: visible;
  position: relative;
  -ms-overflow-style: none;

  ::-webkit-scrollbar {
    display: none;
  }
`
