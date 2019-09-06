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
  return '#eeeeee'
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getBorderColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
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
    <div className="container">
      {imageUrl ? (
        <img src={imageUrl} />
      ) : (
        <Container
          {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
        >
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </Container>
      )}
    </div>
  )
}
