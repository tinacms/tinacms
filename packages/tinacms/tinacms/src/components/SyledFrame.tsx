/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

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
