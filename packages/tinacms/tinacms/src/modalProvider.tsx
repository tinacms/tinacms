import * as React from 'react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { StyledFrame } from './styled-frame'
import styled from 'styled-components'

interface Props {
  children: any
}

export const ModalProvider = ({ children }: Props) => {
  const [modalRootContainerRef, setModalRootContainerRef] = useState(
    null as Element | null
  )

  const setModalRef = useCallback(node => {
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
        {...children}
      </ModalContainerContext.Provider>
    </>
  )
}

interface ModalContainerProps {
  portalNode: Element | null
}

const ModalContainerContext = React.createContext<ModalContainerProps | null>(
  null
)

export function useModalContainer(): ModalContainerProps {
  let modalContainer = React.useContext(ModalContainerContext)

  if (!modalContainer) {
    throw new Error('No Modal Container context provided')
  }

  return modalContainer
}

export const Modal = ({
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) => {
  const { portalNode } = useModalContainer()

  return portalNode && portalNode
    ? (createPortal(
        <StyledFrame
          frameStyles={{
            height: '100vh',
            width: '100vw',
            margin: '0 auto',
            position: 'absolute',
            zIndex: 999,
          }}
        >
          <ModalOverlay>
            <ModalInner>
              <div {...props} />
            </ModalInner>
          </ModalOverlay>
        </StyledFrame>,
        portalNode
      ) as any)
    : null
}

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: auto;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: normal;
  padding: 1rem 1rem 0 1rem;
  margin: 0 0 1rem 0;
`

export const ModalBody = styled.div`
  margin: 2rem 1rem;
`

export const ModalInner = styled.div`
  display: block;
  z-index: 1;
  overflow: visible; /* Keep this as "visible", select component needs to overflow */
  background-color: #fefefe;
  border-radius: 0.25rem;
  margin: auto;
  width: 460px;
  max-width: 90%;
`
