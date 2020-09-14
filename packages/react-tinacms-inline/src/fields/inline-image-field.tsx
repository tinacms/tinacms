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
import { InlineField } from '../inline-field'
import { useCMS, Form, Media } from 'tinacms'
import { useDropzone } from 'react-dropzone'
import { FocusRing, FocusRingOptions } from '../styles'
import { useState, useEffect } from 'react'

export interface InlineImageProps {
  name: string
  parse(media: Media): string
  uploadDir(form: Form): string
  previewSrc?(formValues: any): string | Promise<string>
  focusRing?: boolean | FocusRingOptions
  children?: any
}

/**
 * @deprecated
 * @alias InlineImage
 */
export const InlineImageField = InlineImage

export function InlineImage(props: InlineImageProps) {
  const cms = useCMS()

  return (
    <InlineField name={props.name} parse={props.parse}>
      {({ input, form }) => {
        if (cms.enabled) {
          return <EditableImage {...props} input={input} form={form} />
        }

        return props.children ? props.children() : <img src={input.value} />
      }}
    </InlineField>
  )
}

interface EditableImageProps extends InlineImageProps {
  input: any
  form: any
}

function EditableImage({
  form,
  input,
  name,
  previewSrc,
  uploadDir,
  parse,
  children,
  focusRing = true,
}: EditableImageProps) {
  const cms = useCMS()

  // TODO: Use this
  const [, setSrcIsLoading] = useState(true)
  const [_previewSrc, setSrc] = useState('')
  useEffect(() => {
    let canceled = false
    ;(async () => {
      setSrcIsLoading(true)
      let imageSrc = ''
      try {
        if (previewSrc) {
          imageSrc = await previewSrc(form.values)
        } else {
          imageSrc = await cms.media.previewSrc(input.value)
        }
      } catch (e) {
        if (!canceled) {
          setSrc('')
          console.error(e)
          cms.alerts.error(
            `Failed to generate preview for '${name}': ${e.message}`
          )
        }
      }
      if (!canceled) {
        setSrc(imageSrc)
      }
      setSrcIsLoading(false)
    })()
    return () => {
      canceled = true
    }
  }, [input.value])

  async function handleUploadImage([file]: File[]) {
    const directory = uploadDir(form)
    const [media] = await cms.media.persist([
      {
        directory,
        file,
      },
    ])
    if (media) {
      input.onChange(media)
    } else {
      console.error(
        'TinaCMS Image Upload Failed: This could be due to media store configuration, file size, or if the image is a duplicate (has already been uploaded).'
      )
      cms.alerts.error('Image Upload Failed.')
    }
    return null
  }

  return (
    <FocusRing name={name} options={focusRing}>
      <InlineImageUpload
        value={input.value}
        previewSrc={_previewSrc}
        onDrop={handleUploadImage}
        onClick={() =>
          cms.media.open({
            onSelect(media: any) {
              if (media.filename == input.value) {
                input.onChange('') // trigger rerender
              }
              input.onChange(media)
            },
          })
        }
        {...input}
      >
        {/** If children, pass previewSrc to children */}
        {children &&
          ((props: any) => children({ previewSrc: _previewSrc }, ...props))}
      </InlineImageUpload>
    </FocusRing>
  )
}

interface InlineImageUploadProps {
  onDrop: (acceptedFiles: any[]) => void
  value?: string
  children?: any
  previewSrc?: string
  onClick: () => void
}

function InlineImageUpload({
  onDrop,
  value,
  previewSrc,
  children,
  onClick,
}: InlineImageUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop,
    noClick: !!onClick,
  })

  if (!value) return <ImagePlaceholder />

  return (
    <div {...getRootProps()} onClick={onClick}>
      <input {...getInputProps()} />
      <div>{children ? children(previewSrc) : <img src={previewSrc} />}</div>
    </div>
  )
}

function ImagePlaceholder() {
  // TODO: style this component
  return (
    <div>
      Drag 'n' drop some files here,
      <br />
      or click to select files
    </div>
  )
}
