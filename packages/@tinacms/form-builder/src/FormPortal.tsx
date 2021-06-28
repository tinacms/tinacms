/**

Copyright 2021 Forestry.io Holdings, Inc.

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

export type FormPortal = React.FC<{
  children(props: { zIndexShift: number }): React.ReactNode | null
}>

const FormPortalContext = React.createContext<FormPortal>(() => {
  return null
})

export function useFormPortal() {
  return useContext(FormPortalContext)
}

export const FormPortalProvider: React.FC = styled(
  ({ children, ...styleProps }) => {
    const wrapperRef = React.useRef<HTMLDivElement | null>(null)
    const zIndexRef = React.useRef<number>(0)

    const FormPortal = React.useCallback(
      (props: any) => {
        const portalZIndex = React.useMemo<number>(() => {
          const value = zIndexRef.current
          zIndexRef.current += 1
          return value
        }, [])

        if (!wrapperRef.current) return null

        return createPortal(
          props.children({ zIndexShift: portalZIndex }),
          wrapperRef.current
        )
      },
      [wrapperRef, zIndexRef]
    )

    return (
      <FormPortalContext.Provider value={FormPortal}>
        <div ref={wrapperRef} {...styleProps}>
          {children}
        </div>
      </FormPortalContext.Provider>
    )
  }
)`
  height: 100%;
  scrollbar-width: none;
`
