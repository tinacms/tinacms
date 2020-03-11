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
// import styled from 'styled-components'
import { InlineField } from './inline-field'
import { useCMS } from 'tinacms'
import { useDropzone } from 'react-dropzone'

/**
 * InlineImageField
 */
interface InlineImageProps {
  name: string
  path?: string
  parse(filename: string): string
  uploadDir(form: any): string
}

export function InlineImageField({ name, uploadDir, parse }: InlineImageProps) {
  const cms = useCMS()

  return (
    <InlineField name={name}>
      {props => {
        if (props.status === 'active') {
          return (
            <ImageUpload
              value={props.input.value}
              onDrop={async ([file]: File[]) => {
                const directory = uploadDir(props.form)
                const [media] = await cms.media.store.persist([
                  {
                    directory,
                    file,
                  },
                ])
                if (media) {
                  props.input.onChange(parse(media.filename))
                } else {
                  // TODO Handle failure
                }
                return null
              }}
              {...props.input}
            />
          )
        }
        return <img src={props.input.value} />
      }}
    </InlineField>
  )
}

interface ImageUploadProps {
  onDrop: (acceptedFiles: any[]) => void
  value?: string
}

export const ImageUpload = ({ onDrop, value }: ImageUploadProps) => {
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
        <div>
          <img src={value} />
        </div>
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
