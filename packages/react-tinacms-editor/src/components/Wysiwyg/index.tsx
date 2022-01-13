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
import styled from 'styled-components'

import { TinaCMS, useCMS, Form } from '@einsteinindustries/tinacms'
import { BrowserFocusProvider } from '../../context/browserFocus'
import { EditorModeMenu } from '../EditorModeMenu'
import {
  EditorModeProvider,
  EditorModeConsumer,
} from '../../context/editorMode'
import { EditorProps, PassedImageProps, ImageProps } from '../../types'
import { MarkdownEditor } from '../MarkdownEditor'
import { ProsemirrorEditor } from '../ProsemirrorEditor'

const modeTogglePlugin = {
  name: 'wysiwygModeToggle',
  MenuItem: () => <EditorModeMenu />,
}

export const Wysiwyg = ({
  imageProps: passedInImageProps,
  input,
  form,
  plugins = [],
  format = 'markdown',
  sticky,
  className,
}: EditorProps) => {
  const cms = useCMS()
  const { value, onChange } = input
  const pluginList =
    format === 'markdown' ? [...plugins, modeTogglePlugin] : plugins

  const imageProps: ImageProps | undefined = useImageProps(
    cms,
    form,
    passedInImageProps
  )

  return (
    <EditorModeProvider>
      <EditorModeConsumer>
        {({ mode }) => (
          <BrowserFocusProvider>
            <Wrapper>
              {mode === 'markdown' ? (
                <MarkdownEditor
                  value={value}
                  onChange={onChange}
                  imageProps={imageProps}
                  plugins={pluginList}
                  sticky={sticky}
                />
              ) : (
                <ProsemirrorEditor
                  input={{
                    value,
                    onChange: onChange,
                  }}
                  plugins={pluginList}
                  sticky={sticky}
                  format={format}
                  imageProps={imageProps}
                  className={className}
                />
              )}
            </Wrapper>
          </BrowserFocusProvider>
        )}
      </EditorModeConsumer>
    </EditorModeProvider>
  )
}

const Wrapper = styled.div`
  display: block;
  min-height: 100px;
`

function useImageProps(
  cms: TinaCMS,
  form?: Form,
  passedInImageProps?: PassedImageProps
): ImageProps | undefined {
  const [imageProps, setImageProps] = React.useState<ImageProps | undefined>()

  React.useMemo(() => {
    if (!passedInImageProps) return
    const { uploadDir, parse } = passedInImageProps
    const _uploadDir: string = uploadDir && form ? uploadDir(form.values) : ''

    setImageProps({
      async upload(files: File[]): Promise<string[]> {
        const filesToUpload = files.map(file => ({
          directory: _uploadDir,
          file,
        }))

        const allMedia = await cms.media.persist(filesToUpload)

        return allMedia.map(media => {
          if (parse) {
            return parse(media)
          } else {
            return media.filename
          }
        })
      },
      previewSrc(src: string) {
        return cms.media.previewSrc(src)
      },
      mediaDir: _uploadDir,
      ...passedInImageProps,
    })
  }, [
    cms.media.store,
    passedInImageProps?.uploadDir,
    passedInImageProps?.previewSrc,
    passedInImageProps?.upload,
  ])

  return imageProps
}
