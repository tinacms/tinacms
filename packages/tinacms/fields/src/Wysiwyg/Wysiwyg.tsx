import * as React from 'react'
import styled from 'styled-components'
import { useTinaProsemirror } from './useTinaProsemirror'

let lightGrey = 'rgb(243, 243, 243)'
let lightMediumGrey = `rgb(200, 200, 200)`
let mediumGrey = `rgb(143, 143, 143);`
let darkGrey = 'rgb(40, 40, 40)'

export const Wysiwyg = styled(({ input, ...styleProps }: any) => {
  let prosemirrorEl = useTinaProsemirror(input)

  return (
    <div>
      <div {...styleProps} ref={prosemirrorEl} />
    </div>
  )
})`
  white-space: pre-wrap;
`
