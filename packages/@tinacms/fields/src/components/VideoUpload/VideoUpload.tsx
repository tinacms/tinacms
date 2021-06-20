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
import { IconButton } from '@tinacms/styles'
import { TrashIcon } from '@tinacms/icons'
import { LoadingDots } from '@tinacms/react-forms'

interface VideoUploadProps {
  onDrop: (acceptedFiles: any[]) => void
  onClear?: () => void
  onClick?: () => void
  value?: string
  previewSrc?: string
  loading?: boolean
}

const DropArea = styled.div`
  border-radius: var(--tina-radius-small);
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
  cursor: pointer;
`

const VideoPlaceholder = styled.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
  transition: all 85ms ease-out;
  &:hover {
    opacity: 0.6;
  }
`

const StyledVideo = styled.video`
  max-width: 100%;
  min-height: 100px;
  border-radius: var(--tina-radius-small);
  transition: opacity var(--tina-timing-short) ease-out;
  margin: 0;
  display: block;
  background-color: #e1ddec;
  background-size: auto;
  background-position: center center;
  background-repeat: no-repeat;
`

const DeleteButton = styled(IconButton)`
  top: 8px;
  right: 8px;
  position: absolute;
  &:not(:hover) {
    fill: var(--tina-color-grey-0);
    background-color: transparent;
    border-color: transparent;
  }
`

const StyledVideoContainer = styled.div`
  background-color: var(--tina-color-grey-4);
  position: relative;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  background-color: var(--tina-color-grey-8);
  &:hover {
    ${StyledVideo} {
      opacity: 0.6;
    }
  }
`

export const VideoUpload = ({
  onDrop,
  onClear,
  onClick,
  value,
  previewSrc,
  loading,
}: VideoUploadProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'video/*',
    onDrop,
    noClick: !!onClick,
  })

  return (
    <DropArea {...getRootProps()} onClick={onClick}>
      <input {...getInputProps()} />
      {value ? (
        <StyledVideoContainer>
          {loading ? (
            <VideoLoadingIndicator />
          ) : (
            <>
              <StyledVideo src={previewSrc} />
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
            </>
          )}
        </StyledVideoContainer>
      ) : (
        <VideoPlaceholder>
          Drag 'n' drop some files here,
          <br />
          or click to select files
        </VideoPlaceholder>
      )}
    </DropArea>
  )
}

const VideoLoadingIndicator = () => (
  <VideoLoaderWrapper>
    <LoadingDots />
  </VideoLoaderWrapper>
)

const VideoLoaderWrapper = styled.div`
  padding: 1rem;
  width: 100%;
  min-height: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
