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
import { useCMS, Form } from 'tinacms'
import { InlineField, FocusRing } from 'react-tinacms-inline'
import { FocusRingOptions } from 'react-tinacms-inline/src/styles'
import { Wysiwyg } from '../components/Wysiwyg'
import { EditorProps } from '../types'

export interface InlineWysiwygFieldProps extends Omit<EditorProps, 'input'> {
  name: string
  children: any
  focusRing?: boolean | FocusRingOptions
}

interface InlineWysiwygRenderProps {
  input: any
  form: Form
}

export function InlineWysiwyg({
  name,
  children,
  focusRing = true,
  imageProps,
  ...wysiwygProps
}: InlineWysiwygFieldProps) {
  const cms = useCMS()

  if (cms.disabled) {
    return children
  }
  /**
   * Note: We use `input.name` not `name` on FocusRing because
   * the given name is only relative to the block, not
   * the absolute path in the form.
   */

  return (
    <InlineField name={name}>
      {({ input, form }: InlineWysiwygRenderProps) => {
        return (
          <FocusRing name={input.name} options={focusRing}>
            {active => {
              if (active) {
                return (
                  <Wysiwyg
                    input={input}
                    imageProps={imageProps}
                    form={form}
                    {...wysiwygProps}
                  />
                )
              }
              return children
            }}
          </FocusRing>
        )
      }}
    </InlineField>
  )
}
