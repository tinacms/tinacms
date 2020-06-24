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

export const ModalProvider: React.FC = ({ children }) => {
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
