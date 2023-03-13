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
import { BiFileBlank } from 'react-icons/bi'

interface ImageUploadProps {
  onDrop: (_acceptedFiles: any[]) => void
  onClear?: () => void
  onClick?: () => void
  value?: string
  src?: string
  loading?: boolean
}

const isStringImage = (src: string) => {
  return src && src.match(/\.(bmp|gif|jpe?g|jfif|jp2|jxr|png|webp)$/) != null
}

const StyledImage = ({ src }) => (
  <img
    src={src}
    className="block max-w-full rounded shadow overflow-hidden max-h-48 h-auto object-contain transition-opacity duration-100 ease-out m-0 bg-gray-200 bg-auto bg-center bg-no-repeat"
  />
)

const StyledFile = ({ src }) => {
  return (
    <div className="max-w-full flex-1 flex justify-start items-center gap-3">
      <div className="w-14 h-14 bg-gray-50 shadow border border-gray-100 rounded overflow-hidden flex justify-center shrink-0">
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
  const isImage = isStringImage(src)

  const { getRootProps, getInputProps } = useDropzone({
    accept: dropzoneAcceptFromString(
      cms.media.accept || DEFAULT_MEDIA_UPLOAD_TYPES
    ),
    onDrop,
    noClick: !!onClick,
  })
  return (
    <div className="flex-1" {...getRootProps()}>
      <input {...getInputProps()} />
      {value ? (
        loading ? (
          <ImageLoadingIndicator />
        ) : (
          <div
            className={`relative w-full max-w-full flex flex-1 justify-between gap-3 ${
              isImage ? `items-start` : `items-center`
            }`}
          >
            <button
              className="outline-none flex-1 w-full max-w-full cursor-pointer border-none hover:opacity-60 transition ease-out duration-100"
              onClick={onClick}
            >
              {isImage ? <StyledImage src={src} /> : <StyledFile src={src} />}
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
    <IconButton variant="white" className="shrink-0" onClick={onClick}>
      <TrashIcon className="w-7 h-auto" />
    </IconButton>
  )
}

const ImageLoadingIndicator = () => (
  <div className="p-4 w-full min-h-[96px] flex flex-col justify-center items-center">
    <LoadingDots />
  </div>
)
