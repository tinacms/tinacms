import * as React from 'react'
import { useContext } from 'react'
import { createPortal } from 'react-dom'

export type FormPortal = React.FC<{
  children(props: { zIndexShift: number }): React.ReactNode | null
}>

const FormPortalContext = React.createContext<FormPortal>(() => {
  return null
})

export function useFormPortal() {
  return useContext(FormPortalContext)
}

export const FormPortalProvider: React.FC = ({ children }) => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const zIndexRef = React.useRef<number>(0)

  const FormPortal = React.useCallback(
    (props: any) => {
      if (!wrapperRef.current) return null

      return createPortal(
        props.children({ zIndexShift: (zIndexRef.current += 1) }),
        wrapperRef.current
      )
    },
    [wrapperRef, zIndexRef]
  )

  return (
    <FormPortalContext.Provider value={FormPortal}>
      <div
        ref={wrapperRef}
        style={{
          position: 'relative',
          width: '100%',
          flex: '1 1 0%',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </FormPortalContext.Provider>
  )
}
