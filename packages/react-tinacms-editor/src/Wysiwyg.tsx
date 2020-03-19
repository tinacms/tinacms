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
import { Plugin } from '@tinacms/core'
import { useProsemirror } from './useProsemirror'
import { ALL_PLUGINS } from './default-plugins'
import { CodeMirrorCss } from './CodeMirrorCss'
import { ProseMirrorCss } from './ProseMirrorCss'
import { Format } from './Translator'
import Menu from './state/plugins/Menu'

interface Wysiwyg {
  input: any
  plugins?: Plugin[]
  sticky?: boolean
  format?: Format
  upload?: () => [Promise<string>]
  previewUrl?: (url: string) => string
}

export const Wysiwyg = styled(
  ({
    input,
    plugins,
    sticky,
    format,
    upload,
    previewUrl,
    ...styleProps
  }: any) => {
    const { elRef: prosemirrorEl, editorView, translator } = useProsemirror(
      input,
      ALL_PLUGINS,
      format,
      previewUrl
    )

    return (
      <WysiwygWrapper className="wysiwyg-wrapper">
        <link
          rel="stylesheet"
          href="https://codemirror.net/lib/codemirror.css"
        />
        {editorView && (
          <Menu
            editorView={editorView}
            bottom={false}
            translator={translator}
            sticky={sticky}
            imageUpload={upload}
          />
        )}
        <div {...styleProps} ref={prosemirrorEl} />
      </WysiwygWrapper>
    )
  }
)`
  ${CodeMirrorCss}${ProseMirrorCss}
`

const WysiwygWrapper = styled.div`
  position: relative;
`
