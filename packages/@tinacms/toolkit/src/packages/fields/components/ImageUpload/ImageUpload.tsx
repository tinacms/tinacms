/**

*/

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { IconButton } from '../../../styles'
import { TrashIcon } from '../../../icons'
import { LoadingDots } from '../../../form-builder'
import { useCMS } from '../../../../react-tinacms/use-cms'
import {
  DEFAULT_MEDIA_UPLOAD_TYPES,
  dropzoneAcceptFromString,
} from '../../../../components/media/utils'

interface ImageUploadProps {
  onDrop: (_acceptedFiles: any[]) => void
  onClear?: () => void
  onClick?: () => void
  value?: string
  src?: string
  loading?: boolean
}

const StyledImage = ({ src }) => (
  <img
    src={src}
    className="max-w-full min-h-[100px] max-h-[400px] rounded-[5px] transition-opacity duration-100 ease-out m-0 block bg-gray-200 bg-auto bg-center bg-no-repeat"
    style={{
      backgroundImage:
        src && (src.includes('png') || src.includes('svg'))
          ? 'none'
          : `url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='40px' height='50px' viewBox='0 0 40 50' style='enable-background:new 0 0 40 50;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cdefs%3E%3C/defs%3E%3Cpath class='st0' d='M16.09,24.97c-3.31,0.55-6.16-2.09-5.57-5.16c0.34-1.73,1.82-3.14,3.68-3.5c3.39-0.66,6.37,2.11,5.67,5.25 C19.48,23.28,17.96,24.66,16.09,24.97z M1.88,26.75c0-7.69,0-15.38,0-23.07C2,3.64,1.97,3.53,1.99,3.45c0.5-1.7,1.64-2.82,3.48-3.31 C5.57,0.12,5.71,0.14,5.75,0c7.31,0,14.63,0,21.94,0c0.03,0.1,0.12,0.08,0.2,0.1c0.96,0.2,1.77,0.63,2.47,1.28 c2.72,2.52,5.44,5.05,8.16,7.57c0.68,0.63,1.14,1.38,1.37,2.24c0.02,0.08-0.02,0.19,0.11,0.23c0,5.11,0,10.22,0,15.34h-4.76 c0-3.38,0-6.75,0-10.13c0-0.35-0.1-0.43-0.46-0.43c-3.21,0.01-6.42,0.01-9.63,0.01c-1.65,0-2.62-0.9-2.62-2.42 c0-2.94-0.01-5.89,0.01-8.83c0-0.46-0.14-0.54-0.6-0.53c-4.91,0.02-9.83,0.02-14.74,0c-0.44,0-0.57,0.09-0.57,0.52 c0.02,6.21,0.01,12.42,0.01,18.63c0,1.06,0,2.12,0,3.18H1.88z M27.28,11.46c0,0.31,0.14,0.34,0.41,0.34c2.25-0.01,4.5,0,6.75-0.01 c0.09,0,0.2,0.04,0.24,0c-2.46-2.28-4.92-4.56-7.39-6.85C27.29,7.1,27.3,9.28,27.28,11.46z M33.37,29.61c0,5.18-0.01,10.37,0,15.55 c0,0.35-0.1,0.43-0.46,0.43c-9.23-0.01-18.46-0.01-27.69,0c-0.44,0-0.45-0.17-0.45-0.48c0.01-5.17,0-10.33,0-15.5H0 c0,5.6,0,11.19,0,16.79c0.17,0.09,0.15,0.26,0.19,0.4c0.57,1.85,2.39,3.18,4.47,3.19c9.6,0.01,19.2,0.01,28.81,0 c2.08,0,3.89-1.33,4.47-3.19c0.04-0.14,0.02-0.31,0.19-0.4c0-5.6,0-11.19,0-16.79H33.37z M29.75,42.62c0.34,0,0.44-0.06,0.44-0.4 c-0.01-3.68-0.01-4.6-0.01-8.28c0-0.25-0.08-0.43-0.28-0.6c-0.62-0.55-1.22-1.13-1.83-1.69c-0.79-0.73-1.36-0.74-2.15-0.01 c-2.71,2.52-5.43,5.03-8.13,7.55c-0.26,0.25-0.39,0.24-0.65,0c-1.13-1.08-2.28-2.13-3.43-3.19c-0.7-0.65-1.31-0.65-2.01,0 c-1.16,1.07-2.31,2.15-3.48,3.22c-0.2,0.19-0.29,0.37-0.29,0.64c0.01,1.69,0.03,0.61,0,2.3c-0.01,0.41,0.14,0.46,0.53,0.46 c3.52-0.01,7.05-0.01,10.57-0.01C22.6,42.61,26.17,42.61,29.75,42.62z'/%3E%3C/svg%3E")`,
    }}
  />
)

const ImageContainer = ({ className = '', ...props }) => (
  <div
    className={'w-fit relative overflow-hidden hover:opacity-60 ' + className}
    {...props}
  />
)

export const ImageUpload = ({
  onDrop,
  onClear,
  onClick,
  value,
  src,
  loading,
}: ImageUploadProps) => {
  const cms = useCMS()

  const { getRootProps, getInputProps } = useDropzone({
    accept: dropzoneAcceptFromString(
      cms.media.accept || DEFAULT_MEDIA_UPLOAD_TYPES
    ),
    onDrop,
    noClick: !!onClick,
  })
  return (
    <div
      className="rounded-[5px] flex-1 flex flex-col outline-none cursor-pointer"
      {...getRootProps()}
      onClick={onClick}
    >
      <input {...getInputProps()} />
      {value ? (
        <ImageContainer>
          {loading ? (
            <ImageLoadingIndicator />
          ) : (
            <>
              <StyledImage src={src} />
              {onClear && (
                <DeleteImageButton
                  onClick={(e) => {
                    e.stopPropagation()
                    onClear()
                  }}
                />
              )}
            </>
          )}
        </ImageContainer>
      ) : (
        <ImageContainer className="w-full">
          {loading ? (
            <ImageLoadingIndicator />
          ) : (
            <div className="text-center rounded-[5px] bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal transition-all ease-out duration-100 hover:opacity-60">
              Drag 'n' drop a file here,
              <br />
              or click to select a file
            </div>
          )}
        </ImageContainer>
      )}
    </div>
  )
}

export const DeleteImageButton = ({
  onClick,
}: {
  onClick: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) => {
  return (
    <IconButton
      className="absolute top-2 right-2 [&:not(:hover)]:fill-white"
      onClick={onClick}
    >
      <TrashIcon className="w-5/6 h-auto" />
    </IconButton>
  )
}

const ImageLoadingIndicator = () => (
  <div className="p-4 w-full min-h-[96px] flex flex-col justify-center items-center">
    <LoadingDots />
  </div>
)
