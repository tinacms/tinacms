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
import { useTinaProsemirror } from './useTinaProsemirror'
import { ALL_PLUGINS } from './default-plugins'

interface Wysiwyg {
  input: any
  frame?: any
  plugins?: Plugin[]
}

export const Wysiwyg = styled(
  ({ input, plugins, frame, ...styleProps }: any) => {
    const prosemirrorEl = useTinaProsemirror(input, ALL_PLUGINS, frame)

    return (
      <>
        <link
          rel="stylesheet"
          href="https://codemirror.net/lib/codemirror.css"
        />
        <div {...styleProps} ref={prosemirrorEl} />
      </>
    )
  }
)`
  white-space: pre-wrap;

  .CodeMirror {
    width: 100%;
    height: auto;
    border-radius: 0.3rem;
    margin-bottom: 1rem;

    .CodeMirror-sizer {
      min-height: auto;
    }
  }
`
