import React, { useState } from 'react'
import styled from 'styled-components'
import { TinaReset, Button as TinaButton } from '@tinacms/styles'
import {
  Modal,
  ModalPopup,
  ModalBody,
  ModalActions,
  ModalHeader,
} from 'tinacms'

export interface ActionableModalOptions {
  title: string
  message: string
  actions: Array<{ name: string; action(): void; primary?: boolean }>
}

export const ActionableModal = ({
  title,
  message,
  actions,
}: ActionableModalOptions) => {
  if (!open) {
    return null
  }

  return (
    <TinaReset>
      <Modal>
        <ModalPopup>
          <ModalHeader close={null}>{title}</ModalHeader>
          <ModalBody padded>
            <p>{message}</p>
          </ModalBody>
          <ModalActions>
            {actions.map(action => (
              <TinaButton primary={action.primary} onClick={action.action}>
                {action.name}
              </TinaButton>
            ))}
          </ModalActions>
        </ModalPopup>
      </Modal>
    </TinaReset>
  )
}

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
