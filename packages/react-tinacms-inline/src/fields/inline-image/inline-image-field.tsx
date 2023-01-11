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
import { InlineField } from '../../inline-field'
import { useCMS, Media, MediaStore } from '@einsteinindustries/tinacms'
import { FocusRingOptions } from '../../styles'
import { NonEditableImage } from './non-editable-image'
import { EditableImage } from './editable-image'

export interface InlineImageProps {
  name: string
  parse(media: Media): string
  uploadDir?(formValues: any): string
  previewSrc?: MediaStore['previewSrc']
  focusRing?: boolean | FocusRingOptions
  className?: string
  alt?: string
  children?: ImageRenderChildren
}

interface ImageRenderChildrenProps {
  src?: string
}

export type ImageRenderChildren = (
  props: ImageRenderChildrenProps
) => React.ReactNode

/**
 * @deprecated
 * @alias InlineImage
 */
export const InlineImageField = InlineImage

export function InlineImage(props: InlineImageProps) {
  const cms = useCMS()

  return (
    <InlineField name={props.name} parse={props.parse}>
      {({ input, form }) => {
        if (cms.enabled) {
          return <EditableImage {...props} input={input} form={form} />
        }

        return (
          <NonEditableImage
            children={props.children}
            src={input.value}
            alt={props.alt}
            className={props.className}
          />
        )
      }}
    </InlineField>
  )
}
