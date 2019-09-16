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
  plugins?: Plugin[]
}

export const Wysiwyg = styled(({ input, plugins, ...styleProps }: any) => {
  let prosemirrorEl = useTinaProsemirror(input, ALL_PLUGINS)

  return (
    <div>
      <div {...styleProps} ref={prosemirrorEl} />
    </div>
  )
})`
  @import url('https://raw.githubusercontent.com/ProseMirror/prosemirror-gapcursor/master/style/gapcursor.css');
  white-space: pre-wrap;
`
