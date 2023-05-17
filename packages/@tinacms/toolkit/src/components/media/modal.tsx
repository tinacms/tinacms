import React from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  PopupModal,
  ModalActions,
} from '../../packages/react-modals'
import { Button } from '../../packages/styles'

interface DeleteModalProps {
  close(): void
  deleteFunc(): void
  filename: string
}

export const DeleteModal = ({
  close,
  deleteFunc,
  filename,
}: DeleteModalProps) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Delete {filename}</ModalHeader>
        <ModalBody padded={true}>
          <p>
            Are you sure you want to delete <strong>{filename}</strong>?
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="danger"
            onClick={() => {
              deleteFunc()
              close()
            }}
          >
            Delete
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}
