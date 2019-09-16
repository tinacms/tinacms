import * as React from 'react'
import styled from 'styled-components'
import { Plugin } from 'prosemirror-state'
import { useTinaProsemirror } from './useTinaProsemirror'

let lightGrey = 'rgb(243, 243, 243)'
let lightMediumGrey = `rgb(200, 200, 200)`
let mediumGrey = `rgb(143, 143, 143);`
let darkGrey = 'rgb(40, 40, 40)'

interface Wysiwyg {
  input: any
  plugins?: Plugin<any>[]
}
export const Wysiwyg = styled(({ input, plugins, ...styleProps }: any) => {
  let prosemirrorEl = useTinaProsemirror(input, plugins)

  return (
    <div>
      <div {...styleProps} ref={prosemirrorEl} />
    </div>
  )
})`
  white-space: pre-wrap;
`
