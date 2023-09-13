import * as React from 'react'
import { useCallback, useState } from 'react'

export const ModalProvider: React.FC = ({ children }) => {
  const [modalRootContainerRef, setModalRootContainerRef] = useState(
    null as Element | null
  )

  const setModalRef = useCallback((node) => {
    if (node !== null) {
      setModalRootContainerRef(node)
    }
  }, [])

  return (
    <>
      <div id="modal-root" ref={setModalRef} />
      <ModalContainerContext.Provider
        value={{ portalNode: modalRootContainerRef }}
      >
        {children}
      </ModalContainerContext.Provider>
    </>
  )
}

export interface ModalContext {
  portalNode: Element | null
}

const ModalContainerContext = React.createContext<ModalContext | null>(null)

export function useModalContainer(): ModalContext {
  const modalContainer = React.useContext(ModalContainerContext)

  if (!modalContainer) {
    throw new Error('No Modal Container context provided')
  }

  return modalContainer
}
