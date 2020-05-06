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
import { InlineField } from './inline-field'
import { useCMS, Form } from 'tinacms'
import { useDropzone } from 'react-dropzone'
import { InputFocusWrapper } from './styles'

export interface InlineImageProps {
  name: string
  previewSrc(formValues: any): string
  parse(filename: string): string
  uploadDir(form: Form): string
  children?: any
}

export function InlineImageField({
  name,
  previewSrc,
  uploadDir,
  parse,
  children,
}: InlineImageProps) {
  const cms = useCMS()

  return (
    <InlineField name={name}>
      {({ input, status, form }) => {
        const _previewSrc = previewSrc(form.finalForm.getState().values)

        async function handleUploadImage([file]: File[]) {
          const directory = uploadDir(form)
          const [media] = await cms.media.store.persist([
            {
              directory,
              file,
            },
          ])
          if (media) {
            input.onChange(parse(media.filename))
          } else {
            /**
             * TODO: Handle failure with events
             * or alerts here?
             */
          }
          return null
        }

        if (status === 'active') {
          return (
            <InputFocusWrapper>
              <InlineImageUpload
                value={input.value}
                previewSrc={_previewSrc}
                onDrop={handleUploadImage}
                {...input}
              >
                {/** If children, pass previewSrc to children */}
                {children &&
                  ((props: any) =>
                    children({ previewSrc: _previewSrc }, ...props))}
              </InlineImageUpload>
            </InputFocusWrapper>
          )
        }
        return children ? children() : <img src={input.value} />
      }}
    </InlineField>
  )
}

interface InlineImageUploadProps {
  onDrop: (acceptedFiles: any[]) => void
  value?: string
  children?: any
  previewSrc?: string
}

export function InlineImageUpload({
  onDrop,
  value,
  previewSrc,
  children,
}: InlineImageUploadProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: 'image/*', onDrop })

  if (!value) return <ImagePlaceholder />

  return (
    <div {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
      <input {...getInputProps()} />
      <div>{children ? children(previewSrc) : <img src={previewSrc} />}</div>
    </div>
  )
}

function ImagePlaceholder() {
  // TODO: style this component
  return (
    <div>
      Drag 'n' drop some files here,
      <br />
      or click to select files
    </div>
  )
}
