import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '@tinacms/fields'

interface ImageProps {}

export const ImageUploadInput = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ input, field }) => {
    return (
      <ImageUpload
        value={input.value}
        onDrop={() => {
          alert('TODO - handle dropped image')
        }}
      />
    )
  }
)
