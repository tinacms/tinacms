/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '@tinacms/fields'
import { useCMS } from '@tinacms/react-tinacms'

interface ImageProps {
  path: string
  previewSrc(form: any): string
  uploadDir(form: any): string
}

export const ImageField = wrapFieldsWithMeta<InputProps, ImageProps>(
  ({ form, field, input }) => {
    const cms = useCMS()

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

export default {
  name: 'image',
  Component: ImageField,
}
