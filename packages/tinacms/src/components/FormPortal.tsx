import * as React from 'react'
import { useContext } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

export type FormPortal = React.FC<{}>

const FormPortalContext = React.createContext<FormPortal>(() => {
  return null
})

export function useFormPortal() {
  return useContext(FormPortalContext)
}

export const FormPortalProvider: React.FC = styled(
  ({ children, ...styleProps }) => {
    const wrapperRef = React.useRef<HTMLDivElement | null>(null)

    const FormPortal = React.useCallback(
      (props: any) => {
        if (!wrapperRef.current) return null
        return createPortal(props.children, wrapperRef.current)
      },
      [wrapperRef.current]
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
