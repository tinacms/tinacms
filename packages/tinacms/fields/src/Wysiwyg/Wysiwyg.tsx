import * as React from 'react'
import styled from 'styled-components'
import { Plugin } from '@tinacms/core'
import { useTinaProsemirror } from './useTinaProsemirror'
import { ALL_PLUGINS } from './default-plugins'

let lightGrey = 'rgb(243, 243, 243)'
let lightMediumGrey = `rgb(200, 200, 200)`
let mediumGrey = `rgb(143, 143, 143);`
let darkGrey = 'rgb(40, 40, 40)'

interface Wysiwyg {
  input: any
  frame?: any
  plugins?: Plugin[]
}

export const Wysiwyg = styled(
  ({ input, plugins, frame, ...styleProps }: any) => {
    console.log('Frame', frame)
    let prosemirrorEl = useTinaProsemirror(input, ALL_PLUGINS, frame)

    return (
      <div>
        <div {...styleProps} ref={prosemirrorEl} />
      </div>
    )
  }
)`
  white-space: pre-wrap;
`
