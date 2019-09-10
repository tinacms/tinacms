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

    console.log('val: ' + input.value)
    return (
      <ImageUpload
        value={input.value}
        directory={field.path}
        onDrop={(acceptedFiles: any[]) => {
          acceptedFiles.forEach(async (file: any) => {
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
