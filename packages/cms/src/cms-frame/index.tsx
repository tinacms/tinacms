import * as React from 'react'
import Frame from 'react-frame-component'

interface Props {
  children: any
}

export const CMSFrame = ({ children }: Props) => {
  return (
    <Frame
      style={{
        width: 320,
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {children}
    </Frame>
  )
}
