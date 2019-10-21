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
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { radius, color, font, timing, IconButton } from '@tinacms/styles'
import { TrashIcon } from '@tinacms/icons'

interface ImageUploadProps {
  onDrop: (acceptedFiles: any[]) => void
  onClear?: () => void
  value?: string
  previewSrc?: string
}

const getBorderColor = (props: any) => {
  if (props.isDragAccept) {
    return '#00e676'
  }
  if (props.isDragReject) {
    return '#ff1744'
  }
  if (props.isDragActive) {
    return '#2196f3'
  }
  return '#fff'
}

const DropArea = styled.div`
  border-radius: ${radius('small')};
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
  cursor: pointer;
`

const ImgPlaceholder = styled.div`
  text-align: center;
  border-radius: ${radius('small')};
  background-color: ${color.grey(2)};
  color: ${color.grey(4)};
  line-height: 1.35;
  padding: 0.75rem 0;
  font-size: ${font.size(2)};
  font-weight: 500;
  transition: all 85ms ease-out;
  &:hover {
    opacity: 0.6;
  }
`

const StyledImage = styled.img`
  max-width: 100%;
  border-radius: ${radius('small')};
  transition: opacity ${timing('short')} ease-out;
  margin: 0;
  display: block;
`

const DeleteButton = styled(IconButton)`
  top: 0.5rem;
  right: 0.5rem;
  position: absolute;
  &:not(:hover) {
    fill: ${color.grey()};
    background-color: transparent;
    border-color: transparent;
  }
`

const StyledImageContainer = styled.div`
  background-color: ${color.grey(4)};
  position: relative;
  border-radius: ${radius('small')};
  overflow: hidden;
  background-color: ${color.grey(8)};
  &:hover {
    ${StyledImage} {
      opacity: 0.6;
    }
  }
`

export const ImageUpload = ({
  onDrop,
  onClear,
  value,
  previewSrc,
}: ImageUploadProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: 'image/*', onDrop })

  return (
    <DropArea {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
      <input {...getInputProps()} />
      {value ? (
        <StyledImageContainer>
          <StyledImage src={previewSrc} />
          {onClear && (
            <DeleteButton
              onClick={e => {
                e.stopPropagation()
                onClear()
              }}
            >
              <TrashIcon />
            </DeleteButton>
          )}
        </StyledImageContainer>
      ) : (
        <ImgPlaceholder>
          Drag 'n' drop some files here,
          <br />
          or click to select files
        </ImgPlaceholder>
      )}
    </DropArea>
  )
}
