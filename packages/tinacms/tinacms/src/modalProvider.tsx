import * as React from 'react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { StyledFrame } from './styled-frame'
import styled, { ThemeProvider } from 'styled-components'
import { Theme, RootElement, HEADER_HEIGHT, FOOTER_HEIGHT } from './Globals'

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
    <ThemeProvider theme={Theme}>
      <>
        <div id="modal-root" ref={setModalRef} />
        <ModalContainerContext.Provider
          value={{ portalNode: modalRootContainerRef }}
        >
          {...children}
        </ModalContainerContext.Provider>
      </>
    </ThemeProvider>
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
            position: 'fixed',
            zIndex: 1001,
            border: 0,
          }}
        >
          <RootElement />
          <ModalOverlay>
            <div {...props} />
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
  overflow: auto;
  padding: 0;
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: normal;
  padding: ${p => p.theme.padding}rem ${p => p.theme.padding}rem 0
    ${p => p.theme.padding}rem;
  margin: 0;
`

export const ModalBody = styled.div`
  padding: ${p => p.theme.padding}rem;
  margin: 0;
`
