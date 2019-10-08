import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { radius, color, font } from '@tinacms/styles'

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
          Drag 'n' drop some files here,
          <br />
          or click to select files
        </ImgPlaceholder>
      )}
    </DropArea>
  )
}
