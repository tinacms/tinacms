import * as React from 'react'
import Frame from 'react-frame-component'

export const Sidebar = ({ children }: { children: any }) => {
  return (
    <Frame
      style={{
        width: '100%',
        height: '100%',
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {children}
    </Frame>
  )
}
