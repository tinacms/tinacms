import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'

interface ImageDropzoneProps {
  onDrop: (acceptedFiles: any[]) => void
  imageUrl?: string
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
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getBorderColor(props)};
  border-style: dashed;
  transition: border 0.24s ease-in-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
`

const ImgPlaceholder = styled.div`
  align-items: center;
  padding: 20px;
  background-color: #fafafa;
  color: #bdbdbd;
`

export const ImageDropzone = ({ onDrop, imageUrl }: ImageDropzoneProps) => {
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
      {imageUrl ? (
        <img src={imageUrl} />
      ) : (
        <ImgPlaceholder>
          <p>Drag 'n' drop some files here, or click to select files</p>
        </ImgPlaceholder>
      )}
    </DropArea>
  )
}
