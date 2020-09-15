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
import { InlineField, FocusRing } from 'react-tinacms-inline'
import { FocusRingOptions } from 'react-tinacms-inline/src/styles'
import { Wysiwyg } from '../components/Wysiwyg'
import { EditorProps, ImageProps } from '../types'

export interface InlineWysiwygFieldProps extends Omit<EditorProps, 'input'> {
  name: string
  children: any
  focusRing?: boolean | FocusRingOptions
}

export function InlineWysiwyg({
  name,
  children,
  focusRing = true,
  imageProps: passedInImageProps,
  ...wysiwygProps
}: InlineWysiwygFieldProps) {
  const cms = useCMS()

  const imageProps: ImageProps | undefined = React.useMemo(() => {
    if (!passedInImageProps) return
    return {
      async upload(files: File[]) {
        const filesToUpload = files.map(file => ({
          directory: passedInImageProps?.directory || '',
          file,
        }))

        const allMedia = await cms.media.persist(filesToUpload)

        return allMedia.map(media => {
          if (passedInImageProps.parse) {
            return passedInImageProps.parse(media.filename)
          } else {
            return media.filename
          }
        })
      },
      previewSrc(src) {
        // TODO: Implement formValues correctly
        return cms.media.previewSrc(src, name, {})
      },
      ...passedInImageProps,
    }
  }, [
    cms.media.store,
    passedInImageProps?.directory,
    passedInImageProps?.previewSrc,
    passedInImageProps?.upload,
  ])

  if (cms.disabled) {
    return children
  }

  return (
    <InlineField name={name}>
      {({ input }: any) => {
        return (
          <FocusRing name={name} options={focusRing}>
            <Wysiwyg input={input} {...wysiwygProps} imageProps={imageProps} />
          </FocusRing>
        )
      }}
    </InlineField>
  )
}
