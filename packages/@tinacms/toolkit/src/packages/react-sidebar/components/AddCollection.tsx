import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '../../react-modals'
import React, { useState } from 'react'
import { Button } from '../../styles'

enum MODAL_STATE {
  HIDDEN,
  DROPZONE,
}
export const AddCollection = () => {
  const [modalState, setModalState] = useState(MODAL_STATE.HIDDEN)

  const close = () => {
    setModalState(MODAL_STATE.HIDDEN)
  }
  const open = () => {
    setModalState(MODAL_STATE.DROPZONE)
  }
  return (
    <>
      <div
        onClick={open}
        className="text-slate-500 hover:text-blue-600 mt-2 text-sm cursor-pointer"
      >
        Add New
      </div>
      {modalState === MODAL_STATE.DROPZONE && (
        <Modal>
          <ModalPopup>
            <ModalHeader close={close}>Add New Collection</ModalHeader>
            <ModalBody padded={true}></ModalBody>

            <ModalActions>
              <Button
                style={{ flexGrow: 2 }}
                onClick={() => {
                  close()
                }}
              >
                Close
              </Button>
            </ModalActions>
          </ModalPopup>
        </Modal>
      )}
    </>
  )
}
