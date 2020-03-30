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

import React, { useState, ChangeEvent } from 'react'
import styled from 'styled-components'
import { EditorView } from 'prosemirror-view'
import { Button } from '@tinacms/styles'
import { Input } from '@tinacms/fields'
import { MediaIcon, UploadIcon } from '@tinacms/icons'
import { insertImage } from '../../../../commands/image-commands'
import { MenuButton, MenuButtonDropdown } from '../MenuComponents'
import { Dismissible } from 'react-dismissible'

interface ImageMenu {
  editorView: { view: EditorView }
  uploadImages: (files: File[]) => Promise<string[]>
}

export default ({ editorView, uploadImages }: ImageMenu) => {
  if (!uploadImages) return null

  const [imageUrl, setImageUrl] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const menuButtonRef = React.useRef()

  const uploadImageFile = (file: File) => {
    setUploading(true)
    const uploadPromise = uploadImages([file])
    uploadPromise.then((urls = []) => {
      setImageUrl(urls[0])
      setUploading(false)
    })
  }

  const insertImageInEditor = () => {
    const { state, dispatch } = editorView.view
    insertImage(state, dispatch, imageUrl)
    editorView.view.focus()
    setShowImageModal(false)
    setImageUrl('')
  }

  const uploadSelectedImage = (event: ChangeEvent) => {
    const { files } = event.target as any
    if (files[0]) {
      uploadImageFile(files[0])
    }
  }

  const stopDefault = (evt: React.DragEvent<HTMLSpanElement>) => {
    evt.preventDefault()
    evt.stopPropagation()
  }

  // Check if property name is files or items
  // IE uses 'files' instead of 'items'
  const onImageDrop = (evt: React.DragEvent<HTMLSpanElement>) => {
    stopDefault(evt)
    const { items, files } = evt.dataTransfer
    const data = items || files
    const dataIsItems = !!items
    for (let i = 0; i < data.length; i += 1) {
      if (
        (!dataIsItems || data[i].kind === 'file') &&
        data[i].type.match('^image/')
      ) {
        const file = (dataIsItems ? data[i].getAsFile() : data[i]) as File
        if (file) {
          uploadImageFile(file)
        }
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setShowImageModal(false)
  }

  return (
    <>
      <MenuButton
        ref={menuButtonRef}
        onClick={() => {
          setShowImageModal(!showImageModal)
          setImageUrl('')
        }}
      >
        <MediaIcon />
      </MenuButton>
      <MenuButtonDropdown
        triggerRef={menuButtonRef}
        open={showImageModal}
        onKeyDown={handleKeyDown}
      >
        <Dismissible
          click
          escape
          disabled={!showImageModal}
          onDismiss={() => {
            setShowImageModal(false)
          }}
        >
          <ImageModalContent>
            {imageUrl && (
              <>
                <ImageInputLabel>Current Image</ImageInputLabel>
                <CurrentImage src={imageUrl} alt="uploaded_image" />
              </>
            )}
            <div onMouseDown={evt => evt.stopPropagation()}>
              <ImageInputLabel>URL</ImageInputLabel>
              <Input
                small
                onChange={evt => setImageUrl(evt.target.value)}
              ></Input>
            </div>
            <StyledLabel htmlFor="fileInput">
              <FileUploadInput
                id="fileInput"
                onChange={uploadSelectedImage}
                type="file"
                accept="image/*"
              />
              <UploadSection
                onDragEnter={stopDefault}
                onDragOver={stopDefault}
                onDrop={onImageDrop}
                uploading={uploading}
              >
                <UploadIconWrapper>
                  <UploadIcon />
                </UploadIconWrapper>
                <UploadText>
                  {!uploading && `Drag and drop or click to upload`}
                  {uploading && 'Image uploading...'}
                </UploadText>
              </UploadSection>
            </StyledLabel>
            <ImageModalActions>
              <Button
                small
                onClick={() => {
                  setShowImageModal(false)
                }}
              >
                Cancel
              </Button>
              <Button primary small onClick={insertImageInEditor}>
                Upload
              </Button>
            </ImageModalActions>
          </ImageModalContent>
        </Dismissible>
      </MenuButtonDropdown>
    </>
  )
}

const UploadIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: -7px;
  svg {
    width: 50px;
    height: auto;
    fill: var(--tina-color-primary);
  }
`

const CurrentImage = styled.img`
  display: block;
  width: 100%;
  margin-bottom: var(--tina-padding-small);
  border-radius: var(--tina-radius-small);
  border: 3px dashed var(--tina-color-grey-2);
`

const ImageInputLabel = styled.label`
  display: block;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  color: var(--tina-color-grey-8);
  margin-bottom: 8px;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
`

const ImageModalContent = styled.div`
  background: var(--tina-color-grey-1);
  padding: var(--tina-padding-small);
  font-family: var(--tina-font-family);

  * {
    font-family: inherit;
  }
`

const ImageModalActions = styled.div`
  display: flex;
  margin: 0 -4px;
  width: calc(100% + 8px);

  ${Button} {
    flex: 1 0 auto;
    margin: 0 4px;
  }
`

const UploadText = styled.span`
  font-size: var(--tina-font-size-2);
  text-align: center;
  line-height: 1.2;
  color: var(--tina-color-grey-10);
  max-width: 120px;
  display: block;
  margin: 0 auto;
`

const UploadSection = styled.div<{ uploading: boolean }>`
  display: block;
  width: 100%;
  padding: var(--tina-padding-big) 0;
  margin: var(--tina-padding-small) 0;
  border-radius: var(--tina-radius-big);
  border: 3px dashed var(--tina-color-grey-3);
  cursor: pointer;
`

const FileUploadInput = styled.input`
  display: none;
`

const StyledLabel = styled.label``
