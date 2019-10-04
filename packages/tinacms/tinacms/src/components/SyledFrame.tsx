import * as React from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { StyleSheetManager } from 'styled-components'

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLFrameElement>,
    HTMLFrameElement
  > {
  children: any
  frameStyles: any
}
export const StyledFrame = ({
  children,
  frameStyles,
  ...frameProps
}: Props) => {
  return (
    <Frame style={frameStyles} {...frameProps}>
      <FrameContextConsumer>
        {(frameProps: any) => {
          return (
            <StyleSheetManager target={frameProps.document.head}>
              <FrameContext.Provider value={frameProps}>
                {children}
              </FrameContext.Provider>
            </StyleSheetManager>
          )
        }}
      </FrameContextConsumer>
    </Frame>
  )
}

interface FrameProps {
  window: Window
  document: Document
}
const FrameContext = React.createContext<FrameProps | null>(null)
export function useFrameContext(): FrameProps {
  const frame = React.useContext(FrameContext)

  if (!frame) {
    return {
      document,
      window,
    }
  }

  return frame
}
