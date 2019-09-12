import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'

interface ImageUploadProps {
  onDrop: (acceptedFiles: any[]) => void
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
  border-width: 2px;
  /* Where do we get access to this global theme? need to import it?
  or use the context api?
  border-radius: ${p => p.theme.radius.small}; 
  */
  border-radius: .25rem;
  border-color: ${props => getBorderColor(props)};
  border-style: dashed;
  transition: border 0.24s ease-in-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
  cursor: pointer;
`

const ImgPlaceholder = styled.div`
  align-items: center;
  padding: 20px;
  background-color: #fafafa;
  color: #bdbdbd;
`

const StyledImage = styled.img`
  max-width: 100%;
  /* border-radius: ${p => p.theme.radius.small}; */
  border-radius: .25rem;
  transition: opacity ${p => p.theme.timing.short} ease-out;
  ${DropArea}:hover & {
    opacity: 0.6;
  }
`

export const ImageUpload = ({
  onDrop,
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
        <StyledImage src={previewSrc} />
      ) : (
        <ImgPlaceholder>
          <p>Drag 'n' drop some files here, or click to select files</p>
        </ImgPlaceholder>
      )}
    </DropArea>
  )
}
