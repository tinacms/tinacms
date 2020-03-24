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

import React, { useEffect, useState, ChangeEvent } from 'react'
import styled from 'styled-components'
import { EditorView } from 'prosemirror-view'

import { MediaIcon } from '@tinacms/icons'
import { insertImage } from '../../../../commands/image-commands'
import { MenuButton, MenuButtonDropdown } from '../MenuComponents'

interface ImageMenu {
  editorView: { view: EditorView }
  uploadImages: (files: File[]) => Promise<string[]>
}

export default ({ editorView, uploadImages }: ImageMenu) => {
  if (!uploadImages) return null

  const [imageUrl, setImageUrl] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const menuButtonRef = React.createRef()
  const wrapperRef = React.createRef() as any

  useEffect(() => {
    if (!wrapperRef.current) return
    const handleMousedown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowImageModal(false)
      }
    }
    window.addEventListener('mousedown', handleMousedown)
    return () => {
      window.removeEventListener('mousedown', handleMousedown)
    }
  }, [wrapperRef])

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
        onClick={() => {
          setShowImageModal(!showImageModal)
          setImageUrl('')
        }}
        ref={menuButtonRef}
      >
        <MediaIcon />
      </MenuButton>
      <MenuButtonDropdown
        triggerRef={menuButtonRef}
        open={showImageModal}
        onKeyDown={handleKeyDown}
      >
        <div ref={wrapperRef}>
          <div onMouseDown={evt => evt.stopPropagation()}>
            url: <input onChange={evt => setImageUrl(evt.target.value)}></input>
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
              src={imageUrl}
              uploading={uploading}
            >
              {imageUrl && (
                <ImageWrapper>
                  <StyledImage src={imageUrl} alt="uploaded_image" />
                </ImageWrapper>
              )}
              <UploadLabel>
                Drag and Drop the Image
                <br />
                or
                <br />
                Click to Upload
              </UploadLabel>
              {uploading && 'UPLOADING'}
            </UploadSection>
          </StyledLabel>
          <button onClick={insertImageInEditor}>upload</button>
        </div>
      </MenuButtonDropdown>
    </>
  )
}

const UploadSection = styled.span<{ uploading: boolean; src: string }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  margin: 28px auto 0 auto;
  height: 80px;
  min-width: 140px;
  width: 140px;
  padding: 20px;
  position: relative;

  background-repeat: no-repeat;
  background-size: contain;
  border: ${({ uploading, src }) =>
    uploading || src ? `1px dashed blue` : `1px dashed black`};
`

const UploadLabel = styled.span`
  margin-bottom: 10;
  margin-top: 20;
  text-align: center;
  z-index: 1;
`

const StyledLabel = styled.label`
  display: block;
  height: 75%;
  width: 100%;
`

const FileUploadInput = styled.input`
  display: none;
`

const ImageWrapper = styled.span`
  padding: 5px;
  position: absolute;

  height: calc(100% - 10px);
  left: 0;
  top: 0;
  width: calc(100% - 10px);

  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledImage = styled.img`
  height: auto;
  width: auto;

  max-height: 100%;
  max-width: 100%;
`
