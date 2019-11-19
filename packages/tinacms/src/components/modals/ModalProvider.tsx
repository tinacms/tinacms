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
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { StyledFrame } from '../SyledFrame'
import styled, { StyledComponent } from 'styled-components'
import { Z_INDEX } from '../../Globals'
import { GlobalStyles, Button, padding, font, color } from '@tinacms/styles'

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
  const modalContainer = React.useContext(ModalContainerContext)

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

export const ModalHeader: StyledComponent<'div', {}> = styled.div`
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${font.size(5)};
  font-weight: 500;
  line-height: normal;
  padding: 0 ${padding()} 0 ${padding()};
  border-bottom: 1px solid ${color.grey(3)};
  margin: 0;
`

export const ModalBody = styled.div<{ padded?: boolean }>`
  padding: ${p => (p.padded ? padding() : '0')};
  margin: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 10rem;

  &:last-child {
    border-radius: 0 0 0.3rem 0.3rem;
  }
`

export const ModalActions: StyledComponent<'div', {}, {}> = styled.div`
  display: flex;
  justify-content: flex-end;
  border-radius: 0 0 0.3rem 0.3rem;
  padding: 0 ${padding()} ${padding()} ${padding()};
  ${Button} {
    flex: 0 1 auto;
    min-width: 8rem;
    margin: 0 ${padding('small')} 0 0;
    &:last-child {
      margin-right: 0;
    }
  }
`
