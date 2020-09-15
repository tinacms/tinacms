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
import { useCMS, Form, Media, MediaStore, usePreviewSrc } from 'tinacms'
import { useDropzone } from 'react-dropzone'
import { FocusRing, FocusRingOptions } from '../styles'

export interface InlineImageProps {
  name: string
  parse(media: Media): string
  uploadDir(form: Form): string
  previewSrc?: MediaStore['previewSrc']
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
  children,
  focusRing = true,
}: EditableImageProps) {
  const cms = useCMS()

  const [_previewSrc] = usePreviewSrc(
    input.value,
    name,
    form.values,
    previewSrc
  )

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
