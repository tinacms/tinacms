import * as React from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Plugin } from '@tinacms/core'
import { useTinaProsemirror } from './useTinaProsemirror'
import { ALL_PLUGINS } from './default-plugins'
import { radius } from '@tinacms/styles'
import { CodeMirrorCss } from './CodeMirrorCss'

interface Wysiwyg {
  input: any
  frame?: any
  plugins?: Plugin[]
}

export const Wysiwyg = styled(
  ({ input, plugins, frame, ...styleProps }: any) => {
    const theme = React.useContext(ThemeContext)
    console.log({ theme })
    const prosemirrorEl = useTinaProsemirror(input, ALL_PLUGINS, frame, theme)

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
  ${CodeMirrorCss}
`
