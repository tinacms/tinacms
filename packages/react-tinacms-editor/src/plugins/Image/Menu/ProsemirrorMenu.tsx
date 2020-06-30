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

import React, { useRef, useState, ChangeEvent } from 'react'
import styled, { css } from 'styled-components'
import { Dismissible } from 'react-dismissible'

import { Button } from '@tinacms/styles'
import { Input } from '@tinacms/fields'
import { MediaIcon, UploadIcon, CloseIcon } from '@tinacms/icons'

import { MenuButton, MenuDropdown } from '../../../components/MenuHelpers'
import { useEditorStateContext } from '../../../context/editorState'
import { insertImage } from '../commands'

export interface MenuProps {
  uploadImages?: (files: File[]) => Promise<string[]>
}

export const ProsemirrorMenu = ({ uploadImages }: MenuProps) => {
  const menuButtonRef = useRef()
  const { editorView } = useEditorStateContext()
  const [displayUrlInput, setDisplayUrlInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!uploadImages) return null

  const uploadImageFile = (file: File) => {
    setUploading(true)
    const uploadPromise = uploadImages([file])
    uploadPromise.then((urls = []) => {
      setImageUrl(urls[0])
      setUploading(false)
    })
  }

  const insertImageInEditor = () => {
    if (!editorView) return
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

  const handleCloseModal = () => {
    setImageUrl('')
    setShowImageModal(!showImageModal)
  }

  return (
    <>
      <MenuButton ref={menuButtonRef} onClick={handleCloseModal}>
        <MediaIcon />
      </MenuButton>
      <MenuDropdown
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
                imageUrl={imageUrl}
              >
                {imageUrl && (
                  <>
                    <ClearImageButton
                      onMouseDown={evt => {
                        setImageUrl('')
                        evt.stopPropagation()
                      }}
                    >
                      <CloseIcon />
                    </ClearImageButton>
                    <CurrentImage src={imageUrl} alt="uploaded_image" />
                  </>
                )}
                {!imageUrl && (
                  <>
                    <UploadIconWrapper>
                      <UploadIcon />
                    </UploadIconWrapper>
                    <UploadText>
                      {!uploading && `Drag and drop or click to upload`}
                      {uploading && 'Image uploading...'}
                    </UploadText>
                  </>
                )}
              </UploadSection>
            </StyledLabel>
            <UrlInputWrapper>
              {displayUrlInput && (
                <>
                  <UrlInput onMouseDown={evt => evt.stopPropagation()}>
                    <ImageInputLabel
                      onClick={() => {
                        setDisplayUrlInput(false)
                      }}
                    >
                      Or Enter Image URL
                    </ImageInputLabel>
                    <Input
                      small
                      onChange={evt => setImageUrl(evt.target.value)}
                      value={imageUrl}
                    ></Input>
                  </UrlInput>
                </>
              )}
              {!displayUrlInput && (
                <>
                  <UrlInputTrigger
                    onClick={() => {
                      setDisplayUrlInput(true)
                    }}
                  >
                    Or Enter Image URL
                  </UrlInputTrigger>
                </>
              )}
            </UrlInputWrapper>
            <ImageModalActions>
              <Button small onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button primary small onClick={insertImageInEditor}>
                Insert
              </Button>
            </ImageModalActions>
          </ImageModalContent>
        </Dismissible>
      </MenuDropdown>
    </>
  )
}

const ClearImageButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  width: 32px;
  height: 32px;
  padding: 0;
  position: absolute;
  top: 18px;
  right: 18px;
  border-radius: var(--tina-radius-big);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  cursor: pointer;
  transition: all 85ms ease-out;

  &:hover {
    background-color: var(--tina-color-grey-1);
  }

  svg {
    fill: var(--tina-color-primary);
    width: 22px;
    height: 22px;
  }
`

const UrlInputWrapper = styled.div`
  display: flex;
  margin-bottom: var(--tina-padding-small);
`

const UrlInputTrigger = styled.button`
  background: none;
  border: none;
  outline: none;
  color: var(--tina-color-primary);
  cursor: pointer;
  transition: all 80ms ease-out;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  padding: 0;

  &:hover {
    text-decoration: underline;
    text-decoration-color: var(--tina-color-primary-light);
  }
`

const UrlInput = styled.div``

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
  margin: 0;
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

const UploadSection = styled.div<{ uploading: boolean; imageUrl: string }>`
  display: block;
  width: 100%;
  min-width: 200px;
  padding: var(--tina-padding-big) 0;
  margin-bottom: var(--tina-padding-small);
  border-radius: var(--tina-radius-big);
  border: 3px dashed var(--tina-color-grey-3);
  cursor: pointer;

  ${props =>
    props.imageUrl !== '' &&
    css`
      padding: 0;
      border: none;
      border-radius: var(--tina-radius-small);
      border: 1px solid var(--tina-color-grey-2);
    `};
`

const FileUploadInput = styled.input`
  display: none;
`

const StyledLabel = styled.label``
