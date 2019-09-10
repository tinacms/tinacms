import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '@tinacms/fields'
import { useCMS } from '@tinacms/react-tinacms'

interface ImageProps {
  path: string
  previewSrc: string
}

export const ImageUploadInput = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ input, field }) => {
    let cms = useCMS()

    return (
      <ImageUpload
        value={input.value}
        previewSrc={field.previewSrc}
        onDrop={(acceptedFiles: any[]) => {
          acceptedFiles.forEach(async (file: any) => {
            // @ts-ignore
            await cms.api.git!.onUploadMedia!({
              fileRelativePath: field.path,
              content: file,
            })
            input.onChange(file.path)
          })
        }}
      />
    )
  }
)
