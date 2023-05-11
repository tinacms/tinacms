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
  isImage,
} from '../../../../components/media/utils'
import { BiFileBlank } from 'react-icons/bi'

interface ImageUploadProps {
  onDrop: (files: any, fileRejections: any) => Promise<void>
  onClear?: () => void
  onClick?: () => void
  value?: string
  src?: string
  loading?: boolean
}

const StyledImage = ({ src }) => {
  const isSvg = /\.svg$/.test(src)

  return (
    <img
      src={src}
      className={`"block max-w-full rounded shadow overflow-hidden max-h-48 h-auto object-contain transition-opacity duration-100 ease-out m-0 bg-gray-200 bg-auto bg-center bg-no-repeat ${
        isSvg ? 'min-w-[12rem]' : ''
      }`}
    />
  )
}

const StyledFile = ({ src }) => {
  return (
    <div className="max-w-full w-full overflow-hidden flex-1 flex justify-start items-center gap-3">
      <div className="w-14 h-14 bg-gray-50 shadow border border-gray-100 rounded flex justify-center flex-none">
        <BiFileBlank className="w-3/5 h-full fill-gray-300" />
      </div>
      <span className="text-base text-left flex-1 text-gray-500 w-full break-words truncate">
        {src}
      </span>
    </div>
  )
}

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
    <div className="w-full max-w-full" {...getRootProps()}>
      <input {...getInputProps()} />
      {value ? (
        loading ? (
          <ImageLoadingIndicator />
        ) : (
          <div
            className={`relative w-full max-w-full flex justify-start gap-3 ${
              isImage(src) ? `items-start` : `items-center`
            }`}
          >
            <button
              className="outline-none overflow-visible cursor-pointer border-none hover:opacity-60 transition ease-out duration-100"
              onClick={onClick}
            >
              {isImage(src) ? (
                <StyledImage src={src} />
              ) : (
                <StyledFile src={src} />
              )}
            </button>
            {onClear && (
              <DeleteImageButton
                onClick={(e) => {
                  e.stopPropagation()
                  onClear()
                }}
              />
            )}
          </div>
        )
      ) : (
        <button
          className="outline-none relative hover:opacity-60 w-full"
          onClick={onClick}
        >
          {loading ? (
            <ImageLoadingIndicator />
          ) : (
            <div className="text-center rounded-[5px] bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal transition-all ease-out duration-100 hover:opacity-60">
              Drag 'n' drop a file here,
              <br />
              or click to select a file
            </div>
          )}
        </button>
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
    <IconButton variant="white" className="flex-none" onClick={onClick}>
      <TrashIcon className="w-7 h-auto" />
    </IconButton>
  )
}

const ImageLoadingIndicator = () => (
  <div className="p-4 w-full min-h-[96px] flex flex-col justify-center items-center">
    <LoadingDots />
  </div>
)
