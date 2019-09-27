import * as React from 'react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { StyledFrame } from '../SyledFrame'
import styled from 'styled-components'
import { Z_INDEX } from '../../Globals'
import { GlobalStyles, padding } from '@tinacms/styles'
import { Button } from '../Button'

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
            position: 'fixed',
            zIndex: Z_INDEX + 100,
            border: 0,
          }}
        >
          <GlobalStyles />
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
  padding: ${padding()}rem ${padding()}rem ${padding()}rem ${padding()}rem;
  border-bottom: 1px solid rgba(51, 51, 51, 0.09);
  margin: 0;
`

export const ModalBody = styled.div`
  padding: ${padding()}rem ${padding()}rem 0 ${padding()}rem;
  margin: 0;
`

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  border-radius: 0 0 ${p => p.theme.radius.big} ${p => p.theme.radius.big};
  padding: 0 ${padding()}rem ${padding()}rem ${padding()}rem;
  ${Button} {
    flex: 0 1 auto;
    min-width: 8rem;
    margin: 0 ${padding('small')}rem;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
`
