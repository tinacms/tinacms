import * as React from 'react'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps, ImageUpload } from '../components'
import { Media, MediaStore } from '../../core'
import { useCMS } from '../../react-core'
import { parse } from './textFormat'
import { useState, useEffect } from 'react'

interface ImageProps {
  path: string
  uploadDir?(formValues: any): string
  clearable?: boolean
}

export const ImageField = wrapFieldsWithMeta<InputProps, ImageProps>(
  (props) => {
    const cms = useCMS()
    const { value } = props.input
    const src = value
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
        src={src}
        loading={isImgUploading}
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
            // @ts-ignore
            cms.alerts.error('Upload failed: File not supported.')
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
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
