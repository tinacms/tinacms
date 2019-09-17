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
    console.log('Frame', frame)
    let prosemirrorEl = useTinaProsemirror(input, ALL_PLUGINS, frame)

    return <div {...styleProps} ref={prosemirrorEl} />
  }
)`
  white-space: pre-wrap;
`
