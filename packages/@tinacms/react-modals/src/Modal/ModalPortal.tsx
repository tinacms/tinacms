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
import { useContext } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

export type ModalPortal = React.FC<{}>

const ModalPortalContext = React.createContext<ModalPortal>(() => {
  return null
})

export function useModalPortal() {
  return useContext(ModalPortalContext)
}

export const ModalPortalProvider: React.FC = styled(
  ({ children, ...styleProps }) => {
    const wrapperRef = React.useRef<HTMLDivElement | null>(null)

    const ModalPortal = React.useCallback(
      (props: any) => {
        if (!wrapperRef.current) return null
        return createPortal(props.children, wrapperRef.current)
      },
      [wrapperRef.current]
    )

    return (
      <ModalPortalContext.Provider value={ModalPortal}>
        <div ref={wrapperRef} {...styleProps}>
          {children}
        </div>
      </ModalPortalContext.Provider>
    )
  }
)`
  height: 100%;
  scrollbar-width: none;
`
