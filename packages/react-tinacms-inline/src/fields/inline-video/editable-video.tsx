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
import { useVideoPreviewSrc, Form, useCMS } from 'tinacms'
import { FocusRing } from '../../styles'
import { InlineVideoProps } from './inline-video-field'
import { InlineVideoUpload } from './inline-video-upload'

interface EditableVideoProps extends InlineVideoProps {
  input: any
  form: Form
}

export function EditableVideo({
  form,
  input,
  name,
  previewSrc,
  uploadDir,
  children,
  focusRing = true,
  alt = '',
  className,
}: EditableVideoProps) {
  const cms = useCMS()

  const [_previewSrc] = useVideoPreviewSrc(
    input.value,
    name,
    form.values,
    previewSrc
  )

  async function handleUploadVideo([file]: File[]) {
    const directory = uploadDir ? uploadDir(form.values) : ''

    const [media] = await cms.media.persist([
      {
        directory,
        file,
      },
    ])

    if (media) {
      input.onChange(media)
    }

    return null
  }

  return (
    <FocusRing name={name} options={focusRing}>
      <InlineVideoUpload
        src={_previewSrc}
        alt={alt}
        onDrop={handleUploadVideo}
        onClick={() => {
          const directory = uploadDir ? uploadDir(form.values) : ''
          cms.media.open({
            allowDelete: true,
            directory,
            filter: 'video',
            onSelect(media: any) {
              if (media.filename == input.value) {
                input.onChange('') // trigger rerender
              }
              input.onChange(media)
            },
          })
        }}
        className={className}
      >
        {children}
      </InlineVideoUpload>
    </FocusRing>
  )
}
