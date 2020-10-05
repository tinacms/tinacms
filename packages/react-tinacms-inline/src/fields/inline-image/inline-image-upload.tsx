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
import styled from 'styled-components'
import { useDropzone } from 'react-dropzone'
import { ImageRenderChildren } from './inline-image-field'

interface InlineImageUploadProps {
  src?: string
  alt?: string
  className?: string
  onClick(): void
  onDrop(acceptedFiles: any[]): void
  children?: ImageRenderChildren
}

export function InlineImageUpload({
  src,
  alt,
  className,
  onClick,
  onDrop,
  children,
}: InlineImageUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop,
    noClick: !!onClick,
  })

  if (!src)
    return (
      <Container {...getRootProps()} onClick={onClick} className={className}>
        <input {...getInputProps()} />
        <ImagePlaceholder />
      </Container>
    )

  return (
    <Container {...getRootProps()} onClick={onClick} className={className}>
      <input {...getInputProps()} />
      {children ? children({ src }) : <img src={src} alt={alt} />}
    </Container>
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

export const Container = styled.div`
  width: inherit;
  height: inherit;
`
