import * as React from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import styled, { StyleSheetManager } from 'styled-components'

interface Props {
  children: any
  frameStyles: any
}
export const StyledFrame = ({ children, frameStyles }: Props) => {
  return (
    <Frame style={frameStyles}>
      <FrameContextConsumer>
        {(frameProps: any) => (
          <StyleSheetManager target={frameProps.document.head}>
            {children}
          </StyleSheetManager>
        )}
      </FrameContextConsumer>
    </Frame>
  )
}
