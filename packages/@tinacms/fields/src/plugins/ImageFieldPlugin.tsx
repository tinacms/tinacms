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
import { InputProps, ImageUpload } from '../components'
import { Media, MediaStore } from '@tinacms/core'
import { useCMS } from '@tinacms/react-core'
import { parse } from './textFormat'
import { useState, useEffect } from 'react'

interface ImageProps {
  path: string
  previewSrc?: MediaStore['previewSrc']
  uploadDir(form: any): string
  clearable?: boolean // defaults to true
}

export function usePreviewSrc(
  value: string,
  name: string,
  values: any,
  previewSrc?: MediaStore['previewSrc']
): [string, boolean] {
  const cms = useCMS()
  const [srcIsLoading, setSrcIsLoading] = useState(true)
  const [src, setSrc] = useState('')

  useEffect(() => {
    let canceled = false
    ;(async () => {
      setSrcIsLoading(true)
      let imageSrc = ''
      try {
        const getSrc = previewSrc || cms.media.previewSrc

        imageSrc = await getSrc(value, name, values)
      } catch {}

      if (!canceled) {
        setSrc(imageSrc)
        setSrcIsLoading(false)
      }
    })()

    return () => {
      canceled = true
    }
  }, [value])

  return [src, srcIsLoading]
}

export const ImageField = wrapFieldsWithMeta<InputProps, ImageProps>(props => {
  const cms = useCMS()
  const { form, field } = props
  const { name, value } = props.input
  const [src, srcIsLoading] = usePreviewSrc(
    value,
    name,
    form.getState().values,
    field.previewSrc
  )

  let onClear: any
  if (props.field.clearable) {
    onClear = () => onChange()
  }

  function onChange(media?: Media) {
    if (media) {
      props.input.onChange('')
      props.input.onChange(media)
    }
  }

  return (
    <ImageUpload
      value={value}
      previewSrc={src}
      loading={srcIsLoading}
      onClick={() => {
        cms.media.open({
          onSelect: onChange,
        })
      }}
      onDrop={async ([file]: File[]) => {
        const directory = props.field.uploadDir(props.form.getState().values)

        const [media] = await cms.media.persist([
          {
            directory,
            file,
          },
        ])

        onChange(media)
      }}
      onClear={onClear}
    />
  )
})

export const ImageFieldPlugin = {
  name: 'image',
  Component: ImageField,
  parse,
}
