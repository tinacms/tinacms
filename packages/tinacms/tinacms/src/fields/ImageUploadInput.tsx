import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '@tinacms/fields'
import { useCMS } from '@tinacms/react-tinacms'

interface ImageProps {
  path: string
  previewSrc(form: any): string
  outputDirectory(form: any, path: string): string
}

export const ImageUploadInput = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ form, field, input }) => {
    let cms = useCMS()

    return (
      <ImageUpload
        value={input.value}
        previewSrc={field.previewSrc(form.getState().values)}
        onDrop={(acceptedFiles: any[]) => {
          acceptedFiles.forEach(async (file: any) => {
            // @ts-ignore
            await cms.api.git!.onUploadMedia!({
              directory: field.outputDirectory(
                form.getState().values,
                field.path
              ),
              content: file,
            })
            input.onChange(file.path)
          })
        }}
      />
    )
  }
)
