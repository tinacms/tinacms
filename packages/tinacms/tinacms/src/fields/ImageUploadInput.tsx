import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '@tinacms/fields'
import { useCMS } from '@tinacms/react-tinacms'

interface ImageProps {
  path: string
  previewSrc(form: any): string
  uploadDir(form: any): string
}

export const ImageUploadInput = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ form, field, input }) => {
    let cms = useCMS()

    if (!field.uploadDir)
      throw new Error(
        'TinaCMS `image` field is missing the `uploadDir` option.'
      )

    return (
      <ImageUpload
        value={input.value}
        previewSrc={field.previewSrc(form.getState().values)}
        onDrop={(acceptedFiles: any[]) => {
          acceptedFiles.forEach(async (file: any) => {
            // @ts-ignore
            await cms.api.git!.onUploadMedia!({
              directory: field.uploadDir(form.getState().values),
              content: file,
            })
            input.onChange(file.name)
          })
        }}
      />
    )
  }
)
