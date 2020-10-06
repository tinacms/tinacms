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
import styled from 'styled-components'

import { TinaCMS, useCMS } from 'tinacms'
import { BrowserFocusProvider } from '../../context/browserFocus'
import { EditorModeMenu } from '../EditorModeMenu'
import {
  EditorModeProvider,
  EditorModeConsumer,
} from '../../context/editorMode'
import { EditorProps, ImageProps } from '../../types'
import { MarkdownEditor } from '../MarkdownEditor'
import { ProsemirrorEditor } from '../ProsemirrorEditor'

const modeTogglePlugin = {
  name: 'wysiwygModeToggle',
  MenuItem: () => <EditorModeMenu />,
}

export const Wysiwyg = ({
  imageProps: passedInImageProps,
  input,
  plugins = [],
  format = 'markdown',
  sticky,
  className,
}: EditorProps) => {
  const cms = useCMS()
  const { value, onChange } = input
  const pluginList =
    format === 'markdown' ? [...plugins, modeTogglePlugin] : plugins

  const imageProps: ImageProps | undefined = React.useMemo(
    () => generateImageProps(cms, passedInImageProps),
    [
      cms.media.store,
      passedInImageProps?.directory,
      passedInImageProps?.previewSrc,
      passedInImageProps?.upload,
    ]
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

function generateImageProps(cms: TinaCMS, passedInImageProps?: ImageProps) {
  if (!passedInImageProps) return
  return {
    async upload(files: File[]) {
      const filesToUpload = files.map(file => ({
        directory: passedInImageProps?.directory || '',
        file,
      }))

      const allMedia = await cms.media.persist(filesToUpload)

      return allMedia.map(media => {
        if (passedInImageProps.parse) {
          return passedInImageProps.parse(media)
        } else {
          return media.filename
        }
      })
    },
    previewSrc(src: string) {
      return cms.media.previewSrc(src)
    },
    ...passedInImageProps,
  }
}
