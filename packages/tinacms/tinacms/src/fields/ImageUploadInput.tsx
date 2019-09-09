import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '@tinacms/fields'
import { useCMS } from '@tinacms/react-tinacms'

interface ImageProps {
  path: string
}

export const ImageUploadInput = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ input, field }) => {
    let cms = useCMS()

    return (
      <ImageUpload
        value={input.value}
        onDrop={(acceptedFiles: any[]) => {
          acceptedFiles.forEach((file: any) => {
            cms.api.git!.onUploadMedia!({
              fileRelativePath: field.path,
              content: file,
            })
          })
        }}
      />
    )
  }
)
