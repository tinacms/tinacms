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
import { ImageRenderChildren } from './inline-image-field'
import { DropzoneWrapper } from './dropzone-wrapper'

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
  if (!src)
    return (
      <DropzoneWrapper onClick={onClick} onDrop={onDrop} className={className}>
        <ImagePlaceholder />
      </DropzoneWrapper>
    )

  return (
    <DropzoneWrapper onClick={onClick} onDrop={onDrop} className={className}>
      {children ? children({ src }) : <img src={src} alt={alt} />}
    </DropzoneWrapper>
  )
}

const ImagePlaceholder = styled(styleProps => {
  return (
    <div {...styleProps}>
      Drag 'n' drop some files here,
      <br />
      or click to select files
    </div>
  )
})`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  input:active,
  input:focus {
    outline: none;
  }
`
