import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageDropzone } from '@tinacms/fields'

interface ImageProps {}

export const ImageUploadInput = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ input, field }) => {
    return (
      <ImageDropzone
        value={input.value}
        onDrop={() => {
          alert('cool')
        }}
      />
    )
  }
)
