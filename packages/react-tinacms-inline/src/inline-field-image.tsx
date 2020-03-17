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
import { useCMS } from 'tinacms'
import { useDropzone } from 'react-dropzone'
import { InputFocusWrapper } from './styles'

interface InlineImageProps {
  name: string
  path?: string
  parse(filename: string): string
  uploadDir(form: any): string
  children?: any
}

export function InlineImageField({
  name,
  uploadDir,
  parse,
  children,
}: InlineImageProps) {
  const cms = useCMS()

  return (
    <InlineField name={name}>
      {({ input, status, form }) => {
        if (status === 'active') {
          return (
            <InputFocusWrapper>
              <ImageUpload
                value={input.value}
                onDrop={async ([file]: File[]) => {
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
                    // TODO Handle failure
                  }
                  return null
                }}
                {...input}
              >
                {children}
              </ImageUpload>
            </InputFocusWrapper>
          )
        }
        return children ? children : <img src={input.value} />
      }}
    </InlineField>
  )
}

interface ImageUploadProps {
  onDrop: (acceptedFiles: any[]) => void
  value?: string
  children?: any
}

export const ImageUpload = ({ onDrop, value, children }: ImageUploadProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: 'image/*', onDrop })

  return (
    <div {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
      <input {...getInputProps()} />
      {value ? (
        <div>{children ? children : <img src={value} />}</div>
      ) : (
        <div>
          Drag 'n' drop some files here,
          <br />
          or click to select files
        </div>
      )}
    </div>
  )
}
