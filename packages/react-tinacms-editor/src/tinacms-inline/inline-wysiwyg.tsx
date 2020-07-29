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
import { InlineField, FocusRing, useInlineForm } from 'react-tinacms-inline'
import { FocusRingStyleProps } from 'react-tinacms-inline/src/styles'
import { Wysiwyg } from '../components/Wysiwyg'
import { EditorProps } from '../types'

export interface InlineWysiwygFieldProps extends Omit<EditorProps, 'input'> {
  name: string
  children: any
  focusRing?: boolean | FocusRingStyleProps
}

export function InlineWysiwyg({
  name,
  children,
  focusRing = false,
  ...wysiwygProps
}: InlineWysiwygFieldProps) {
  const cms = useCMS()
  const [active, setActive] = React.useState(false)
  const { focussedField, setFocussedField } = useInlineForm()
  const focusRingRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!focusRing) return
    setActive(name === focussedField)
  }, [active, focusRing, focussedField])

  if (cms.disabled) {
    return children
  }

  const handleSetActive = (event: any) => {
    if (active) return
    setFocussedField(name)
    event.stopPropagation()
    event.preventDefault()
  }

  const offset = typeof focusRing === 'object' ? focusRing.offset : undefined

  return (
    <InlineField name={name}>
      {({ input }: any) => {
        return (
          <FocusRing
            ref={focusRingRef}
            active={active}
            onClick={handleSetActive}
            offset={offset}
            borderRadius={
              typeof focusRing === 'object' ? focusRing.borderRadius : undefined
            }
            disableHover={!focusRing}
            disableChildren={false}
          >
            <Wysiwyg input={input} {...wysiwygProps} />
          </FocusRing>
        )
      }}
    </InlineField>
  )
}
