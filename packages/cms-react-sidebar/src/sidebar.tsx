import * as React from 'react'
import Frame from 'react-frame-component'

export const Sidebar = ({ children }: { children: any }) => {
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
