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
import styled, { ThemeContext } from 'styled-components'
import { Plugin } from '@tinacms/core'
import { useTinaProsemirror } from './useTinaProsemirror'
import { ALL_PLUGINS } from './default-plugins'
import { CodeMirrorCss } from './CodeMirrorCss'
import { ProseMirrorCss } from './ProseMirrorCss'
import { Menu } from './state/plugins/Menu'

interface Wysiwyg {
  input: any
  plugins?: Plugin[]
  sticky?: boolean
}

export const Wysiwyg = styled(
  ({ input, plugins, sticky, ...styleProps }: any) => {
    const theme = React.useContext(ThemeContext) || {}
    const { elRef: prosemirrorEl, editorView } = useTinaProsemirror(
      input,
      ALL_PLUGINS,
      theme
    )
    return (
      <>
        <link
          rel="stylesheet"
          href="https://codemirror.net/lib/codemirror.css"
        />
        <Menu
          editorView={editorView}
          format={'markdown'}
          theme={theme}
          bottom={false}
          sticky={sticky}
        />
        <div {...styleProps} ref={prosemirrorEl} />
      </>
    )
  }
)`
  ${CodeMirrorCss}${ProseMirrorCss}
`
