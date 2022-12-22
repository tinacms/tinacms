/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { Media, MediaStore } from '../../core'
import { useCMS } from '../../react-core'
import { parse } from './textFormat'
import { useState, useEffect } from 'react'

interface ImageProps {
  path: string
  previewSrc?: MediaStore['previewSrc']
  uploadDir?(formValues: any): string
  clearable?: boolean
}

export function usePreviewSrc(
  value: string,
  fieldName: string,
  formValues: any,
  getPreviewSrc?: MediaStore['previewSrc']
): [string, boolean] {
  const cms = useCMS()
  const getSrc = getPreviewSrc || cms.media.previewSrc
  const [{ src, loading }, setState] = useState({
    src: '',
    loading: true,
  })

  useEffect(() => {
    let componentUnmounted = false
    let tmpSrc = ''
    ;(async () => {
      try {
        tmpSrc = await getSrc(value, fieldName, formValues)
      } catch {}

      if (componentUnmounted) return

      setState({
        src: tmpSrc,
        loading: false,
      })
    })()

    return () => {
      componentUnmounted = true
    }
  }, [value])

  return [src, loading]
}

export const ImageField = wrapFieldsWithMeta<InputProps, ImageProps>(
  (props) => {
    const cms = useCMS()
    const { form, field } = props
    const { name, value } = props.input
    const [src, srcIsLoading] = usePreviewSrc(
      value,
      name,
      form.getState().values,
      field.previewSrc
    )
    const [isImgUploading, setIsImgUploading] = useState(false)
    let onClear: any
    if (props.field.clearable) {
      onClear = () => props.input.onChange('')
    }

    async function onChange(media?: Media | Media[]) {
      if (media) {
        const parsedValue =
          // @ts-ignore
          typeof cms?.media?.store?.parse === 'function'
            ? // @ts-ignore
              cms.media.store.parse(media)
            : media

        props.input.onChange(parsedValue)
      }
    }
    const uploadDir = props.field.uploadDir || (() => '')

    return (
      <ImageUpload
        value={value}
        previewSrc={src}
        loading={isImgUploading || srcIsLoading}
        onClick={() => {
          const directory = uploadDir(props.form.getState().values)
          cms.media.open({
            allowDelete: true,
            directory,
            onSelect: onChange,
          })
        }}
        onDrop={async ([file]: File[]) => {
          setIsImgUploading(true)
          try {
            const directory = uploadDir(props.form.getState().values)
            const [media] = await cms.media.persist([
              {
                directory: directory,
                file,
              },
            ])
            if (media) {
              await onChange(media)
            }
          } catch (error) {
            console.error('Error uploading media asset: ', error)
          } finally {
            setIsImgUploading(false)
          }
        }}
        onClear={onClear}
      />
    )
  }
)

export const ImageFieldPlugin = {
  name: 'image',
  Component: ImageField,
  parse,
}
