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
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Plugin } from '@tinacms/core'

import { Menu } from '../Menu'
import { Format } from '../../Translator'
import { ImageProps } from '../../types'

import { CodeMirrorCss } from './styles/CodeMirror'
import { ProseMirrorCss } from './styles/ProseMirror'
import { EditorStateProvider } from '../../context/editorState'

export interface WysiwygProps {
  input: any
  plugins?: Plugin[]
  sticky?: boolean
  format?: Format
  imageProps?: ImageProps
}

export const Wysiwyg = styled(
  ({
    input,
    plugins,
    sticky,
    format,
    imageProps,
    ...styleProps
  }: WysiwygProps) => {
    const [el, setEl] = useState<HTMLDivElement>()
    const editorRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      // State is updated with latest value of editorRef to trigger re-render
      if (editorRef.current) setEl(editorRef.current)
    }, [editorRef])

    return (
      <WysiwygWrapper className="wysiwyg-wrapper">
        <link
          rel="stylesheet"
          href="https://codemirror.net/lib/codemirror.css"
        />
        <EditorStateProvider
          input={input}
          el={el}
          imageProps={imageProps}
          format={format}
        >
          <Menu
            bottom={false}
            sticky={sticky}
            uploadImages={imageProps && imageProps.upload}
          />
        </EditorStateProvider>
        <div {...styleProps} ref={editorRef} />
      </WysiwygWrapper>
    )
  }
)`
  ${CodeMirrorCss}${ProseMirrorCss}
`

const WysiwygWrapper = styled.div`
  position: relative;
`
